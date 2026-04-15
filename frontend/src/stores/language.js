import { defineStore } from 'pinia'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '@/i18n'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: DEFAULT_LANGUAGE,
    hydrated: false,
  }),
  actions: {
    hydrate() {
      if (this.hydrated) return

      try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
        if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
          this.currentLanguage = saved
        }
      } catch (error) {
        console.warn('Failed to hydrate language setting.', error)
      } finally {
        this.applyDocumentLanguage()
        this.hydrated = true
      }
    },

    setLanguage(language) {
      if (!SUPPORTED_LANGUAGES.includes(language)) return
      this.currentLanguage = language
      this.applyDocumentLanguage()
      this.persist()
    },

    toggleLanguage() {
      this.setLanguage(this.currentLanguage === 'zh' ? 'en' : 'zh')
    },

    persist() {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, this.currentLanguage)
      } catch (error) {
        console.warn('Failed to persist language setting.', error)
      }
    },

    applyDocumentLanguage() {
      if (typeof document === 'undefined') return
      document.documentElement.lang = this.currentLanguage === 'zh' ? 'zh-CN' : 'en'
    },
  },
})
