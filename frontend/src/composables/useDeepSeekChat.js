import axios from 'axios'
import { computed, ref } from 'vue'

const API_ENDPOINT = 'https://api.deepseek.com/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'
const STORAGE_KEY = 'deepseek_api_key'
const ENV_API_KEY = (import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim()

function normalizeMessages(conversationHistory, message) {
  const history = Array.isArray(conversationHistory) ? conversationHistory : []

  return [...history, { role: 'user', content: message }]
    .filter((entry) => entry && typeof entry.content === 'string')
    .map((entry) => ({
      role: entry.role === 'assistant' ? 'assistant' : 'user',
      content: entry.content.trim(),
    }))
    .filter((entry) => entry.content.length > 0)
    .slice(-12)
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

      return response.data?.choices?.[0]?.message?.content?.trim() || null
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
    setApiKey,
    loadApiKey,
    clearApiKey,
    sendMessage,
  }
}
