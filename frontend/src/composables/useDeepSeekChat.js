import axios from 'axios'
import { computed, ref } from 'vue'

const API_ENDPOINT = 'https://api.deepseek.com/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'
const STORAGE_KEY = 'deepseek_api_key'
const ENV_API_KEY = (import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim()
const MAX_MESSAGE_CHARS = 1200
const MAX_MESSAGES = 12

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
  return `${locale.replyLanguage}\n\n${locale.safetyPreamble}`
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

function normalizeMessages(conversationHistory, message, language) {
  const history = Array.isArray(conversationHistory) ? conversationHistory : []

  const conversation = [...history, { role: 'user', content: message }]
    .filter((entry) => entry && typeof entry.content === 'string')
    .map((entry) => ({
      role: entry.role === 'assistant' ? 'assistant' : entry.role === 'system' ? 'system' : 'user',
      content: entry.content.trim(),
    }))
    .filter((entry) => entry.content.length > 0)
    .filter((entry) => !containsSensitiveContent(entry.content))
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
