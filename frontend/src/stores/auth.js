import { defineStore } from 'pinia'
import { getApiErrorMessage, getCurrentUser, login, logout, register } from '@/services/backend'

const AUTH_SESSION_STORAGE_KEY = 'gradquest-auth-session'

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY) || 'null')
  } catch (error) {
    console.warn('Failed to parse saved auth session.', error)
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: null,
    hydrated: false,
    submitting: false,
    hydratingPromise: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    isTeacher: (state) => state.user?.role === 'teacher',
    isStudent: (state) => state.user?.role === 'student',
  },
  actions: {
    async hydrate(force = false) {
      if (this.hydrated && !force) return
      if (this.hydratingPromise && !force) return this.hydratingPromise

      this.hydratingPromise = (async () => {
        try {
          const session = readSession()
          if (!session?.token) {
            this.clearSession()
            this.hydrated = true
            return
          }

          this.token = session.token
          this.user = session.user || null

          try {
            this.user = await getCurrentUser()
            this.persistSession()
          } catch (error) {
            this.clearSession()
          } finally {
            this.hydrated = true
          }
        } finally {
          this.hydratingPromise = null
        }
      })()

      return this.hydratingPromise
    },

    async login(payload) {
      this.submitting = true
      try {
        const session = await login(payload)
        this.applySession(session)
        return session.user
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Login failed.'))
      } finally {
        this.submitting = false
        this.hydrated = true
      }
    },

    async register(payload) {
      this.submitting = true
      try {
        const session = await register(payload)
        this.applySession(session)
        return session.user
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Registration failed.'))
      } finally {
        this.submitting = false
        this.hydrated = true
      }
    },

    async logout() {
      try {
        if (this.token) {
          await logout()
        }
      } catch (error) {
        // The session is local and stateless, so local cleanup still wins.
      } finally {
        this.clearSession()
        this.hydrated = true
      }
    },

    applySession(session) {
      this.token = session.token
      this.user = session.user
      this.persistSession()
    },

    persistSession() {
      try {
        sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify({
          token: this.token,
          user: this.user,
        }))
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to persist auth session.', error)
      }
    },

    clearSession() {
      this.token = ''
      this.user = null
      try {
        sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to clear auth session.', error)
      }
    },
  },
})
