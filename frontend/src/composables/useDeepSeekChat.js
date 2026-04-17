import axios from 'axios'
import { computed, ref } from 'vue'

const API_ENDPOINT = 'https://api.deepseek.com/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'
const STORAGE_KEY = 'deepseek_api_key'
const ENV_API_KEY = (import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim()
const MAX_MESSAGE_CHARS = 1200
const MAX_MESSAGES = 12

const SAFETY_PREAMBLE =
  'Safety rules: Never request, store, or reveal personal data (emails, phone numbers, student IDs), credentials (passwords/verification codes), or secrets (tokens/API keys/JWTs). If the user provides any of these, ask them to remove it and continue with general guidance. You do not have access to any student/teacher database or internal systems.'

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
  const normalized = typeof text === 'string' ? text.trim() : ''

  if (!normalized) {
    return null
  }

  if (normalized.length > MAX_MESSAGE_CHARS) {
    return `Message is too long (${normalized.length} chars). Please shorten it.`
  }

  if (containsSensitiveContent(normalized)) {
    return 'Privacy guard: please remove passwords/verification codes, emails, phone numbers, student IDs, tokens, or API keys before sending.'
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

function normalizeMessages(conversationHistory, message) {
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

  return [{ role: 'system', content: SAFETY_PREAMBLE }, ...conversation]
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

  const sendMessage = async (message, conversationHistory = []) => {
    const trimmedMessage = typeof message === 'string' ? message.trim() : ''

    if (!trimmedMessage) {
      return null
    }

    const safetyIssue = getSafetyIssue(trimmedMessage)
    if (safetyIssue) {
      error.value = safetyIssue
      return null
    }

    if (!isConfigured.value) {
      error.value = 'DeepSeek API key is not configured.'
      return null
    }

    isLoading.value = true
    error.value = ''

    try {
      const response = await axios.post(
        API_ENDPOINT,
        {
          model: DEFAULT_MODEL,
          messages: normalizeMessages(conversationHistory, trimmedMessage),
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
        error.value = 'The DeepSeek API key is invalid or expired.'
      } else if (status === 429) {
        error.value = 'Too many requests. Please wait and try again.'
      } else if (requestError.code === 'ERR_NETWORK') {
        error.value = 'Network request failed. Check your connection and retry.'
      } else {
        error.value =
          requestError.response?.data?.error?.message ||
          requestError.message ||
          'Failed to get a response from DeepSeek.'
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
    getSafetyIssue,
    setApiKey,
    loadApiKey,
    clearApiKey,
    sendMessage,
  }
}
