import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { LANGUAGE_STORAGE_KEY } from '@/i18n'
import { useLanguageStore } from './language'

describe('language store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hydrates a saved supported language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')

    const store = useLanguageStore()
    store.hydrate()

    expect(store.currentLanguage).toBe('en')
    expect(store.hydrated).toBe(true)
    expect(document.documentElement.lang).toBe('en')
  })

  it('ignores unsupported saved languages', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')

    const store = useLanguageStore()
    store.hydrate()

    expect(store.currentLanguage).toBe('zh')
    expect(document.documentElement.lang).toBe('zh-CN')
  })

  it('persists language changes and applies document language', () => {
    const store = useLanguageStore()

    store.setLanguage('en')

    expect(store.currentLanguage).toBe('en')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('toggles between supported languages', () => {
    const store = useLanguageStore()

    store.toggleLanguage()
    expect(store.currentLanguage).toBe('en')

    store.toggleLanguage()
    expect(store.currentLanguage).toBe('zh')
  })
})
