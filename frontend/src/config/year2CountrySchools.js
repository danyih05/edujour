const MATCHED_COUNTRY_STORAGE_KEY = 'gradquest-y2-matched-country'

const COUNTRY_ALIAS_MAP = Object.freeze({
  uk: 'uk',
  'united kingdom': 'uk',
  'great britain': 'uk',
  gb: 'uk',
  england: 'uk',
  britain: 'uk',
  '英国': 'uk',
  '英國': 'uk',

  us: 'us',
  usa: 'us',
  'united states': 'us',
  'united states of america': 'us',
  america: 'us',
  '美国': 'us',
  '美國': 'us',

  australia: 'australia',
  au: 'australia',
  'australian': 'australia',
  'australia route': 'australia',
  '澳大利亚': 'australia',
  '澳大利亞': 'australia',
  '澳洲': 'australia',

  hk: 'hk',
  'hong kong': 'hk',
  hongkong: 'hk',
  'hong-kong': 'hk',
  '中国香港': 'hk',
  '中國香港': 'hk',
  '香港': 'hk',

  sg: 'sg',
  singapore: 'sg',
  'lion city': 'sg',
  '新加坡': 'sg',

  eu: 'eu',
  europe: 'eu',
  'continental europe': 'eu',
  'european union': 'eu',
  '欧陆': 'eu',
  '歐陸': 'eu',
  '欧洲': 'eu',
  '歐洲': 'eu',
  '欧洲大陆': 'eu',
  '歐洲大陸': 'eu',
})

const YEAR2_COUNTRY_SCHOOLS = Object.freeze({
  uk: {
    key: 'uk',
    icon: '🏰',
    canonicalName: 'UK',
    label: { zh: '英国', en: 'UK' },
    schools: [
      { id: 'uk-imperial', icon: '👑', name: { zh: '帝国理工学院', en: 'Imperial College London' }, tag: { zh: 'QS 前 10', en: 'QS Top 10' }, recommendedTier: 'reach' },
      { id: 'uk-ucl', icon: '🏛️', name: { zh: '伦敦大学学院', en: 'UCL' }, tag: { zh: 'QS 前 10', en: 'QS Top 10' }, recommendedTier: 'reach' },
      { id: 'uk-kcl', icon: '🦁', name: { zh: '伦敦国王学院', en: "King's College London" }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'uk-southampton', icon: '⚓', name: { zh: '南安普顿大学', en: 'University of Southampton' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'uk-cardiff', icon: '🐉', name: { zh: '卡迪夫大学', en: 'Cardiff University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
  },
  us: {
    key: 'us',
    icon: '🗽',
    canonicalName: 'US',
    label: { zh: '美国', en: 'US' },
    schools: [
      { id: 'us-stanford', icon: '🌉', name: { zh: '斯坦福大学', en: 'Stanford University' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'us-cornell', icon: '🍂', name: { zh: '康奈尔大学', en: 'Cornell University' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'us-northeastern', icon: '🚇', name: { zh: '东北大学', en: 'Northeastern University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'us-bu', icon: '📚', name: { zh: '波士顿大学', en: 'Boston University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'us-asu', icon: '☀️', name: { zh: '亚利桑那州立大学', en: 'Arizona State University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
  },
  australia: {
    key: 'australia',
    icon: '🦘',
    canonicalName: 'Australia',
    label: { zh: '澳大利亚', en: 'Australia' },
    schools: [
      { id: 'au-melbourne', icon: '🎓', name: { zh: '墨尔本大学', en: 'University of Melbourne' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'au-unsw', icon: '🌊', name: { zh: '新南威尔士大学', en: 'UNSW Sydney' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'au-monash', icon: '🧪', name: { zh: '莫纳什大学', en: 'Monash University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'au-uq', icon: '🌿', name: { zh: '昆士兰大学', en: 'The University of Queensland' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'au-deakin', icon: '🛟', name: { zh: '迪肯大学', en: 'Deakin University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
  },
  hk: {
    key: 'hk',
    icon: '🏙️',
    canonicalName: 'Hong Kong',
    label: { zh: '香港', en: 'Hong Kong' },
    schools: [
      { id: 'hk-hku', icon: '🌆', name: { zh: '香港大学', en: 'The University of Hong Kong' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'hk-hkust', icon: '🚀', name: { zh: '香港科技大学', en: 'HKUST' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'hk-cuhk', icon: '⛰️', name: { zh: '香港中文大学', en: 'CUHK' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'hk-cityu', icon: '🏢', name: { zh: '香港城市大学', en: 'City University of Hong Kong' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'hk-hkbu', icon: '📍', name: { zh: '香港浸会大学', en: 'Hong Kong Baptist University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
  },
  sg: {
    key: 'sg',
    icon: '🌏',
    canonicalName: 'Singapore',
    label: { zh: '新加坡', en: 'Singapore' },
    schools: [
      { id: 'sg-nus', icon: '🦁', name: { zh: '新加坡国立大学', en: 'National University of Singapore' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'sg-ntu', icon: '⚙️', name: { zh: '南洋理工大学', en: 'Nanyang Technological University' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'sg-smu', icon: '💼', name: { zh: '新加坡管理大学', en: 'Singapore Management University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'sg-sutd', icon: '🛠️', name: { zh: '新加坡科技设计大学', en: 'Singapore University of Technology and Design' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'sg-jcu', icon: '🌴', name: { zh: '詹姆斯库克大学新加坡校区', en: 'James Cook University Singapore' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
  },
  eu: {
    key: 'eu',
    icon: '🏛️',
    canonicalName: 'Continental Europe',
    label: { zh: '欧洲大陆', en: 'Continental Europe' },
    schools: [
      { id: 'eu-eth', icon: '🧠', name: { zh: '苏黎世联邦理工学院', en: 'ETH Zurich' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'eu-delft', icon: '🚲', name: { zh: '代尔夫特理工大学', en: 'TU Delft' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'eu-ku-leuven', icon: '🏫', name: { zh: '鲁汶大学', en: 'KU Leuven' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'eu-uva', icon: '🌷', name: { zh: '阿姆斯特丹大学', en: 'University of Amsterdam' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'eu-twente', icon: '🧭', name: { zh: '特文特大学', en: 'University of Twente' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
  },
  global: {
    key: 'global',
    icon: '🧭',
    canonicalName: 'Cross-region',
    label: { zh: '跨地区备选', en: 'Cross-region fallback' },
    schools: [
      { id: 'global-imperial', icon: '👑', name: { zh: '帝国理工学院', en: 'Imperial College London' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'global-cornell', icon: '🍂', name: { zh: '康奈尔大学', en: 'Cornell University' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'global-monash', icon: '🧪', name: { zh: '莫纳什大学', en: 'Monash University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'global-cuhk', icon: '⛰️', name: { zh: '香港中文大学', en: 'CUHK' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'global-cardiff', icon: '🐉', name: { zh: '卡迪夫大学', en: 'Cardiff University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
  },
})

function normalizeLookupValue(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
}

export function normalizeCountryKey(value) {
  if (!value) return ''

  if (typeof value === 'object') {
    return (
      normalizeCountryKey(value.key) ||
      normalizeCountryKey(value.id) ||
      normalizeCountryKey(value.code) ||
      normalizeCountryKey(value.label) ||
      ''
    )
  }

  const normalized = normalizeLookupValue(value)
  return COUNTRY_ALIAS_MAP[normalized] || ''
}

export function resolveMatchedCountryKey(profile) {
  if (!profile || typeof profile !== 'object') return ''

  return (
    normalizeCountryKey(profile.matchedCountryKey) ||
    normalizeCountryKey(profile.matchedCountry) ||
    normalizeCountryKey(profile.latestMatchedCountry) ||
    normalizeCountryKey(profile.country) ||
    ''
  )
}

export function persistMatchedCountryKey(countryKey) {
  const normalizedKey = normalizeCountryKey(countryKey)
  if (!normalizedKey || typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(MATCHED_COUNTRY_STORAGE_KEY, normalizedKey)
  } catch (error) {
    console.warn('Failed to persist matched country.', error)
  }
}

export function getPersistedMatchedCountryKey() {
  if (typeof localStorage === 'undefined') return ''

  try {
    const savedValue = localStorage.getItem(MATCHED_COUNTRY_STORAGE_KEY)
    return normalizeCountryKey(savedValue)
  } catch (error) {
    console.warn('Failed to read matched country.', error)
    return ''
  }
}

export function getYear2CountrySchoolConfig(countryKey) {
  const normalizedKey = normalizeCountryKey(countryKey)
  return YEAR2_COUNTRY_SCHOOLS[normalizedKey] || YEAR2_COUNTRY_SCHOOLS.global
}

export function getTierBuckets(schools) {
  return schools.reduce((buckets, school) => {
    const bucket = school.recommendedTier
    if (!buckets[bucket]) {
      buckets[bucket] = []
    }
    buckets[bucket].push(school)
    return buckets
  }, { reach: [], match: [], safety: [] })
}
