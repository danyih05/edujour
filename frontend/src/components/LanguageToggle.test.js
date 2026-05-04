import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { LANGUAGE_STORAGE_KEY } from '@/i18n'
import LanguageToggle from './LanguageToggle.vue'

describe('LanguageToggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hydrates from saved language and switches languages from the button group', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en')

    const wrapper = mount(LanguageToggle)
    const buttons = wrapper.findAll('button.lang-btn')

    expect(document.documentElement.lang).toBe('en')
    expect(buttons).toHaveLength(2)
    expect(buttons[1].classes()).toContain('active')

    await buttons[0].trigger('click')
    expect(document.documentElement.lang).toBe('zh-CN')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('zh')
    expect(buttons[0].classes()).toContain('active')

    await buttons[1].trigger('click')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    expect(buttons[1].classes()).toContain('active')
  })
})
