import axios from 'axios'

const AUTH_SESSION_STORAGE_KEY = 'gradquest-auth-session'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(
      sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)
        || localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
        || 'null'
    )
    if (session?.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${session.token}`
    }
  } catch (error) {
    console.warn('Failed to attach auth token.', error)
  }

  return config
})

export default api
