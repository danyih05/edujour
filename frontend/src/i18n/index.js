import en from './locales/en'
import zh from './locales/zh'

export const DEFAULT_LANGUAGE = 'zh'
export const LANGUAGE_STORAGE_KEY = 'cw-web-language'
export const SUPPORTED_LANGUAGES = ['zh', 'en']

export const messages = {
  zh,
  en,
}

function getByPath(object, path) {
  return path.split('.').reduce((value, segment) => (
    value && Object.prototype.hasOwnProperty.call(value, segment)
      ? value[segment]
      : undefined
  ), object)
}

function interpolate(template, params = {}) {
  if (typeof template !== 'string') return template

  return template.replace(/\{(\w+)\}/g, (_, key) => (
    params[key] ?? `{${key}}`
  ))
}

export function getLocaleMessage(language, key) {
  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
  const localized = getByPath(messages[safeLanguage], key)

  if (localized !== undefined) {
    return localized
  }

  if (safeLanguage !== DEFAULT_LANGUAGE) {
    return getByPath(messages[DEFAULT_LANGUAGE], key)
  }

  return undefined
}

export function translate(language, key, params = {}) {
  const message = getLocaleMessage(language, key)

  if (typeof message === 'string') {
    return interpolate(message, params)
  }

  if (message !== undefined) {
    return message
  }

  return key
}

export function resolveLocalizedValue(language, value) {
  if (value == null) return ''
  if (typeof value === 'string') return value

  if (typeof value === 'object') {
    if (value[language]) return value[language]
    if (value[DEFAULT_LANGUAGE]) return value[DEFAULT_LANGUAGE]
    if (value.zh) return value.zh
    if (value.en) return value.en
  }

  return ''
}
