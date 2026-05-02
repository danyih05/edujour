import axios from 'axios'
import { computed, ref } from 'vue'

const API_ENDPOINT = 'https://api.deepseek.com/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'
const STORAGE_KEY = 'deepseek_api_key'
const ENV_API_KEY = (import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim()
const MAX_MESSAGE_CHARS = 1200
const MAX_MESSAGES = 12

const PUBLIC_GAME_CONTEXT = `
You are the XJTLU AI Assistant inside Edujour / GradQuest. You only know public, high-level game flow metadata and general study/application guidance. You do not have access to teacher-authored level content, hidden prompts, specific cases, clauses, questions, answer keys, or student/teacher databases.

Public game map:
- Total playable nodes: 15.
- Year 2 has 7 nodes: 1 Identity Forge (profile and self-positioning), 2 Region Choice (choosing study regions), 3 Tier Mapping (Reach / Match / Safety school planning), 4 Senior Case Archives (high-level admissions case comparison), 5 Action Plan (time and effort allocation), 6 Contract Guardian (service agreement and risk-awareness practice), 7 Final Trial (Year 2 wrap-up).
- Year 3 has 8 nodes: 1 Timeline Crucible (application timeline and material chain), 2 Material Types (CV / personal statement / recommendation category awareness), 3 CV Surgery (resume/CV review habits), 4 PS Weaving (personal statement storyline), 5 Recommendation (recommender communication and recommendation letter preparation), 6 Exam Combat (exam/application milestone battle), 7 Risk Scan (DIY/application risk spotting), 8 Coronation (final celebration and wrap-up).

Safe routing examples:
- If the user asks how many games there are, answer: 15 total, Year 2 has 7 and Year 3 has 8.
- If the user asks about application essays, personal statements, or PS, recommend Year 3 node 4 PS Weaving, and optionally Year 3 node 2 for material category basics.
- If the user asks about recommendation letters or asking a professor, recommend Year 3 node 5 Recommendation, and optionally Year 3 node 2 for material category basics.
- If the user asks about CV/resume, recommend Year 3 node 3 CV Surgery.
- If the user asks about school selection, recommend Year 2 node 3 Tier Mapping and Year 2 node 2 Region Choice.
- If the user asks about contracts, agencies, promises, or risk clauses, recommend Year 2 node 6 Contract Guardian for practice, but do not explain any specific in-game clause.
- If the user asks about DIY/application risk, recommend Year 3 node 7 Risk Scan.
- If the user asks about timeline, recommend Year 3 node 1 Timeline Crucible.

Privacy boundary:
- Never read, explain, summarize, translate, solve, quote, complete, or identify answers for teacher-provided in-game materials, including specific clauses, drafts, cases, questions, options, prompts, screenshots, or text copied from a node.
- If the user asks about a specific in-game sentence, clause, case, question, option, or answer, politely refuse. Do not repeat the protected text. Offer to explain the general skill area or suggest the relevant public node instead.
- Do not infer or reveal answer keys or "what should I choose" for a node.

Support style:
- Be warm, concise, and practical. Offer emotional support for application stress, uncertainty, rejection anxiety, procrastination, or feeling behind.
- Do not diagnose. For severe distress or self-harm risk, encourage contacting a trusted person, school counselor, local emergency service, or crisis hotline immediately.
`

const PROTECTED_CONTENT_GUARD_MESSAGES = {
  en:
    'I cannot read or explain specific teacher-provided content from inside a game node, such as exact clauses, drafts, questions, options, cases, or answer keys. I also will not send that text to the AI service. I can still explain the general skill area or point you to the right node to practice.',
  zh:
    '这个问题涉及关卡里的具体题目、条款、草案、案例、选项或答案，我不能读取或解释老师放在节点里的材料，也不会把这段内容发给 AI 服务。你可以根据游戏内提示作答，或向老师确认；我可以讲这个节点训练的通用原则，或者告诉你该去哪个节点练习。',
}

const COPY = {
  en: {
    replyLanguage: 'Reply language: English only, regardless of the user’s language.',
    safetyPreamble:
      'Safety rules: Never request, store, or reveal personal data (emails, phone numbers, student IDs), credentials (passwords/verification codes), or secrets (tokens/API keys/JWTs). If the user provides any of these, ask them to remove it and continue with general guidance. You do not have access to any student/teacher database or internal systems.',
    messageTooLong: ({ length }) => `Message is too long (${length} chars). Please shorten it.`,
    privacyGuard:
      'Privacy guard: please remove passwords/verification codes, emails, phone numbers, student IDs, tokens, or API keys before sending.',
    apiKeyNotConfigured: 'DeepSeek API key is not configured.',
    apiKeyInvalid: 'The DeepSeek API key is invalid or expired.',
    tooManyRequests: 'Too many requests. Please wait and try again.',
    networkFailed: 'Network request failed. Check your connection and retry.',
    requestFailed: 'Failed to get a response from DeepSeek.',
  },
  zh: {
    replyLanguage: '回复语言：无论用户使用什么语言，都只用简体中文回复。',
    safetyPreamble:
      '安全规则：不要请求、存储或泄露任何个人信息（邮箱、手机号、学号等）、凭证（密码/验证码）或机密信息（token/API key/JWT）。如果用户提供了这些信息，请提醒其删除后再继续，并仅提供一般性建议。你无法访问任何学生/教师数据库或内部系统。',
    messageTooLong: ({ length }) => `消息太长（${length} 字符），请缩短后再发送。`,
    privacyGuard:
      '隐私保护：发送前请移除密码/验证码、邮箱、手机号、学号、token 或 API Key。',
    apiKeyNotConfigured: '未配置 DeepSeek API Key。',
    apiKeyInvalid: 'DeepSeek API Key 无效或已过期。',
    tooManyRequests: '请求过于频繁，请稍后再试。',
    networkFailed: '网络请求失败，请检查网络后重试。',
    requestFailed: '获取 DeepSeek 回复失败。',
  },
}

function resolveLanguage(language) {
  return language === 'en' ? 'en' : 'zh'
}

function buildSystemMessage(language) {
  const locale = COPY[resolveLanguage(language)]
  return `${locale.replyLanguage}\n\n${locale.safetyPreamble}\n\n${PUBLIC_GAME_CONTEXT}`
}

function getTargetLanguageLabel(language) {
  return resolveLanguage(language) === 'en' ? 'English' : 'Simplified Chinese'
}

function buildHistoryTranslateMessages(textList, language) {
  const targetLanguage = getTargetLanguageLabel(language)

  return [
    {
      role: 'system',
      content: 'You are a translator. Return only valid JSON.',
    },
    {
      role: 'user',
      content:
        `Translate each string in the JSON array to ${targetLanguage}. Keep the same order and number of items. ` +
        'Keep URLs, code snippets, keys, emails, and proper nouns unchanged when appropriate. ' +
        'Return only a JSON array of strings without markdown.\n\n' +
        JSON.stringify(textList),
    },
  ]
}

function parseJsonArray(text) {
  if (typeof text !== 'string') {
    return null
  }

  const trimmed = text.trim()
  if (!trimmed) {
    return null
  }

  try {
    const direct = JSON.parse(trimmed)
    return Array.isArray(direct) ? direct : null
  } catch {
    // Ignore and try to extract JSON from wrapped text.
  }

  const matchedArray = trimmed.match(/\[[\s\S]*\]/)
  if (!matchedArray) {
    return null
  }

  try {
    const extracted = JSON.parse(matchedArray[0])
    return Array.isArray(extracted) ? extracted : null
  } catch {
    return null
  }
}

const SENSITIVE_PATTERNS = [
  {
    label: 'api_key',
    pattern: /\bsk-[A-Za-z0-9]{16,}\b/,
  },
  {
    label: 'jwt',
    pattern: /\b[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    label: 'bearer_token',
    pattern: /\bBearer\s+[A-Za-z0-9._~\\-]{20,}\b/i,
  },
  {
    label: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  },
  {
    label: 'phone_cn',
    pattern: /\b1\d{10}\b/,
  },
  {
    label: 'student_id',
    pattern: /(student\s*id|studentid|学号)\s*[:：=]?\s*\d{4,12}/i,
  },
  {
    label: 'password',
    pattern: /\b(password|passwd|pwd)\b\s*[:=]\s*\S{4,}/i,
  },
  {
    label: 'password_cn',
    pattern: /密码\s*[:：=]?\s*\S{4,}/,
  },
  {
    label: 'otp_cn',
    pattern: /验证码\s*[:：=]?\s*\d{4,8}/,
  },
  {
    label: 'otp_en',
    pattern: /\b(otp|one[-\s]?time(\s+password)?|verification\s+code)\b\s*[:=]?\s*\d{4,8}\b/i,
  },
]

function containsSensitiveContent(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return false
  }

  return SENSITIVE_PATTERNS.some(({ pattern }) => pattern.test(text))
}

const PROTECTED_CONTEXT_PATTERNS = [
  /条款|草案|案例|题目|选项|答案|原文|句子|这句话|这段话|高风险|中风险|低风险|关卡内容|老师.*材料|游戏.*材料/,
  /第\s*\d+\s*(关|题|条)|第一关|第二关|第三关|第四关|第五关|第六关|第七关|第八关/,
  /\byear\s*[23]\s*[_-]?\s*\d+\b/i,
  /\by[23]\s*[_-]?\s*\d+\b/i,
  /\b(clause|draft|case|question|option|answer|answer key|prompt|quote|sentence|level content|teacher material)\b/i,
]

const PROTECTED_HELP_REQUEST_PATTERNS = [
  /什么意思|解释|翻译|分析|怎么选|选哪个|该选|正确答案|答案是什么|帮我做|帮我答|怎么过|通关|泄题|判断一下|评价一下/,
  /\b(what does|meaning|explain|translate|analy[sz]e|which option|what should i choose|correct answer|answer this|solve|walkthrough|cheat)\b/i,
]

const GAME_CONTEXT_PATTERNS = [
  /游戏|关卡|节点|老师|材料|第\s*\d+\s*(关|题|条)/,
  /\b(game|level|node|teacher|material)\b/i,
]

const SPECIFIC_PROTECTED_ITEM_PATTERNS = [
  /条款\s*\d+|第\s*\d+\s*条|第\s*\d+\s*题|选项\s*[A-DＡ-Ｄ]/i,
  /\b(clause|question|option|case|draft)\s*[-#:]?\s*\d+\b/i,
]

function hasQuotedOrLongExcerpt(text) {
  return /["'“”‘’「」『』]/.test(text) || /[:：]\s*\S{8,}/.test(text)
}

function containsProtectedCurriculumContent(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return false
  }

  const normalized = text.trim()
  if (!normalized) {
    return false
  }

  const hasProtectedContext = PROTECTED_CONTEXT_PATTERNS.some((pattern) => pattern.test(normalized))
  const asksForHelp = PROTECTED_HELP_REQUEST_PATTERNS.some((pattern) => pattern.test(normalized))
  const hasGameContext = GAME_CONTEXT_PATTERNS.some((pattern) => pattern.test(normalized))
  const hasSpecificProtectedItem = SPECIFIC_PROTECTED_ITEM_PATTERNS.some((pattern) => pattern.test(normalized))
  const hasExcerpt = hasQuotedOrLongExcerpt(normalized)

  return (
    hasProtectedContext &&
    asksForHelp &&
    (hasExcerpt || hasGameContext || hasSpecificProtectedItem)
  ) || (
    hasExcerpt &&
    asksForHelp &&
    hasGameContext
  )
}

function getSafetyIssue(text) {
  return getSafetyIssueLocalized(text, 'zh')
}

function getSafetyIssueLocalized(text, language) {
  const locale = COPY[resolveLanguage(language)]
  const normalized = typeof text === 'string' ? text.trim() : ''

  if (!normalized) {
    return null
  }

  if (normalized.length > MAX_MESSAGE_CHARS) {
    return locale.messageTooLong({ length: normalized.length })
  }

  if (containsSensitiveContent(normalized)) {
    return locale.privacyGuard
  }

  if (containsProtectedCurriculumContent(normalized)) {
    return PROTECTED_CONTENT_GUARD_MESSAGES[resolveLanguage(language)]
  }

  return null
}

function toGlobalRegex(regex) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`
  return new RegExp(regex.source, flags)
}

function redactSensitiveContent(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return text
  }

  let redacted = text

  for (const { pattern } of SENSITIVE_PATTERNS) {
    if (pattern.test(redacted)) {
      redacted = redacted.replace(toGlobalRegex(pattern), '[REDACTED]')
    }
  }

  return redacted
}

function shouldExcludeFromModelContext(text) {
  return containsSensitiveContent(text) || containsProtectedCurriculumContent(text)
}

function normalizeMessages(conversationHistory, message, language) {
  const history = Array.isArray(conversationHistory) ? conversationHistory : []

  const conversation = [...history, { role: 'user', content: message }]
    .filter((entry) => entry && typeof entry.content === 'string')
    .map((entry) => ({
      role: entry.role === 'assistant' ? 'assistant' : entry.role === 'system' ? 'system' : 'user',
      content: entry.content.trim(),
    }))
    .filter((entry) => entry.content.length > 0)
    .filter((entry) => !shouldExcludeFromModelContext(entry.content))
    .slice(-(MAX_MESSAGES - 1))

  return [{ role: 'system', content: buildSystemMessage(language) }, ...conversation]
}

export function useDeepSeekChat() {
  const apiKey = ref('')
  const isLoading = ref(false)
  const error = ref('')

  const isConfigured = computed(() => apiKey.value.length > 0)

  const setApiKey = (key) => {
    const normalizedKey = typeof key === 'string' ? key.trim() : ''

    apiKey.value = normalizedKey

    if (normalizedKey) {
      localStorage.setItem(STORAGE_KEY, normalizedKey)
      return
    }

    localStorage.removeItem(STORAGE_KEY)
  }

  const loadApiKey = () => {
    const savedKey = (localStorage.getItem(STORAGE_KEY) || '').trim()
    apiKey.value = ENV_API_KEY || savedKey
  }

  const clearApiKey = () => {
    apiKey.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  const sendMessage = async (message, conversationHistory = [], language = 'zh') => {
    const trimmedMessage = typeof message === 'string' ? message.trim() : ''
    const locale = COPY[resolveLanguage(language)]

    if (!trimmedMessage) {
      return null
    }

    const safetyIssue = getSafetyIssueLocalized(trimmedMessage, language)
    if (safetyIssue) {
      error.value = safetyIssue
      return null
    }

    if (!isConfigured.value) {
      error.value = locale.apiKeyNotConfigured
      return null
    }

    isLoading.value = true
    error.value = ''

    try {
      const response = await axios.post(
        API_ENDPOINT,
        {
          model: DEFAULT_MODEL,
          messages: normalizeMessages(conversationHistory, trimmedMessage, language),
          temperature: 0.7,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey.value}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const reply = response.data?.choices?.[0]?.message?.content?.trim() || null
      if (!reply) {
        return null
      }

      return redactSensitiveContent(reply)
    } catch (requestError) {
      const status = requestError.response?.status

      if (status === 401) {
        error.value = locale.apiKeyInvalid
      } else if (status === 429) {
        error.value = locale.tooManyRequests
      } else if (requestError.code === 'ERR_NETWORK') {
        error.value = locale.networkFailed
      } else {
        const serverMessage = requestError.response?.data?.error?.message
        if (serverMessage) {
          error.value = serverMessage
        } else if (requestError.message && resolveLanguage(language) === 'en') {
          error.value = requestError.message
        } else {
          error.value = locale.requestFailed
        }
      }

      return null
    } finally {
      isLoading.value = false
    }
  }

  const translateHistory = async (historyMessages = [], language = 'zh') => {
    const locale = COPY[resolveLanguage(language)]
    const sourceMessages = Array.isArray(historyMessages) ? historyMessages : []

    if (sourceMessages.length === 0) {
      return sourceMessages
    }

    if (!isConfigured.value) {
      error.value = locale.apiKeyNotConfigured
      return null
    }

    const textList = sourceMessages.map((entry) => (
      entry && typeof entry.content === 'string' ? entry.content : ''
    ))

    isLoading.value = true
    error.value = ''

    try {
      const response = await axios.post(
        API_ENDPOINT,
        {
          model: DEFAULT_MODEL,
          messages: buildHistoryTranslateMessages(textList, language),
          temperature: 0.2,
          max_tokens: 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey.value}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const reply = response.data?.choices?.[0]?.message?.content?.trim() || ''
      const translatedTextList = parseJsonArray(reply)

      if (!translatedTextList || translatedTextList.length !== textList.length) {
        error.value = locale.requestFailed
        return null
      }

      return sourceMessages.map((entry, index) => ({
        ...entry,
        content:
          typeof translatedTextList[index] === 'string' && translatedTextList[index].trim().length > 0
            ? redactSensitiveContent(translatedTextList[index].trim())
            : textList[index],
      }))
    } catch (requestError) {
      const status = requestError.response?.status

      if (status === 401) {
        error.value = locale.apiKeyInvalid
      } else if (status === 429) {
        error.value = locale.tooManyRequests
      } else if (requestError.code === 'ERR_NETWORK') {
        error.value = locale.networkFailed
      } else {
        error.value = locale.requestFailed
      }

      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    apiKey,
    isConfigured,
    isLoading,
    error,
    getSafetyIssue: (text, language = 'zh') => getSafetyIssueLocalized(text, language),
    setApiKey,
    loadApiKey,
    clearApiKey,
    sendMessage,
    translateHistory,
  }
}
