import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LANGUAGE,
  getLocaleMessage,
  resolveLocalizedValue,
  translate,
} from './index'

describe('i18n helpers', () => {
  it('reads nested locale messages', () => {
    expect(getLocaleMessage('en', 'common.actions.close')).toBe('Close')
  })

  it('interpolates placeholder parameters', () => {
    const message = translate('en', 'map.lockedTooltip', {
      previous: 2,
      current: 3,
    })

    expect(message).toContain('2')
    expect(message).toContain('3')
  })

  it('falls back to the default language for unsupported language codes', () => {
    expect(getLocaleMessage('not-supported', 'common.loading')).toBe(
      getLocaleMessage(DEFAULT_LANGUAGE, 'common.loading'),
    )
  })

  it('returns the key when a message cannot be found', () => {
    expect(translate('en', 'missing.example.key')).toBe('missing.example.key')
  })

  it('resolves localized object values with sensible fallbacks', () => {
    expect(resolveLocalizedValue('en', { zh: 'Default copy', en: 'English copy' })).toBe('English copy')
    expect(resolveLocalizedValue('en', { zh: 'Default copy' })).toBe('Default copy')
    expect(resolveLocalizedValue('en', null)).toBe('')
  })
})
