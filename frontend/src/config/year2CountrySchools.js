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

  niche: 'niche',
  'niche regions': 'niche',
  'japan korea': 'niche',
  'japan / korea and other niche regions': 'niche',
  'japan korea and other niche regions': 'niche',
  'japan and korea': 'niche',
  'japan': 'niche',
  'korea': 'niche',
  '日韩': 'niche',
  '日韓': 'niche',
  '日韩等小众地区': 'niche',
  '日韓等小眾地區': 'niche',
  '小众地区': 'niche',
  '小眾地區': 'niche',

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
    schools: [],
  },
  us: {
    key: 'us',
    icon: '🗽',
    canonicalName: 'US',
    label: { zh: '美国', en: 'US' },
    schools: [],
  },
  australia: {
    key: 'australia',
    icon: '🦘',
    canonicalName: 'Australia',
    label: { zh: '澳洲', en: 'Australia' },
    schools: [],
  },
  niche: {
    key: 'niche',
    icon: '🧭',
    canonicalName: 'Niche regions',
    label: { zh: '日韩等小众地区', en: 'Japan / Korea and other niche regions' },
    nicheMessage: {
      zh: '小众地区，请联系 DA 获得更多升学信息。',
      en: 'Niche regions. Please contact your DA for more study abroad information.',
    },
    schools: [],
  },
  hk: {
    key: 'hk',
    icon: '🏙️',
    canonicalName: 'Hong Kong',
    label: { zh: '香港', en: 'Hong Kong' },
    schools: [],
  },
  sg: {
    key: 'sg',
    icon: '🌏',
    canonicalName: 'Singapore',
    label: { zh: '新加坡', en: 'Singapore' },
    schools: [],
  },
  eu: {
    key: 'eu',
    icon: '🏛️',
    canonicalName: 'Europe',
    label: { zh: '欧洲', en: 'Europe' },
    schools: [],
  },
  global: {
    key: 'global',
    icon: '🧭',
    canonicalName: 'Cross-region',
    label: { zh: '跨地区备选', en: 'Cross-region fallback' },
    schools: [],
  },
})

const SCORE_BAND_ORDER = Object.freeze(['70-100', '60-70', '50-60', '40-50'])

const GPA_BAND_SCORE = Object.freeze({
  scholar: 82,
  steady: 75,
  sprint: 65,
  comeback: 55,
})

const YEAR2_SCORE_SCHOOL_BANDS = Object.freeze({
  uk: {
    '40-50': ['伯明翰大学', '卡迪夫大学', '布里斯托大学', '曼彻斯特大学', '谢菲尔德大学', '格拉斯哥大学', '爱丁堡大学', '伦敦国王学院', '纽卡斯尔大学', '利物浦大学', '杜伦大学'],
    '50-60': ['伦敦大学学院', '伦敦大学玛丽女王学院', '伯明翰大学', '纽卡斯尔大学', '谢菲尔德大学', '兰卡斯特大学', '曼彻斯特大学', '华威大学', '利物浦大学', '布里斯托大学', '格拉斯哥大学', '卡迪夫大学', '南安普顿大学', '埃克塞特大学', '巴斯大学', '杜伦大学', '伦敦国王学院', '爱丁堡大学'],
    '60-70': ['伦敦大学学院', '利物浦大学', '华威大学', '格拉斯哥大学', '杜伦大学', '爱丁堡大学', '布里斯托大学', '南安普顿大学', '谢菲尔德大学', '曼彻斯特大学', '伯明翰大学', '帝国理工学院', '伦敦国王学院', '利兹大学', '纽卡斯尔大学', '伦敦艺术大学', '伦敦大学玛丽女王学院', '诺丁汉大学', '金斯顿大学'],
    '70-100': ['伦敦大学学院', '帝国理工学院', '布里斯托大学', '曼彻斯特大学', '爱丁堡大学', '华威大学', '利物浦大学', '剑桥大学', '南安普顿大学', '格拉斯哥大学', '杜伦大学', '卡迪夫大学', '伦敦国王学院', '牛津大学', '诺丁汉大学'],
  },
  us: {
    '40-50': ['圣路易斯华盛顿大学', '马里兰大学学院公园分校'],
    '50-60': ['东北大学', '伊利诺伊大学厄本那-香槟分校', '匹兹堡大学', '哥伦比亚大学', '华盛顿大学', '印第安纳大学伯明顿分校', '加州大学伯克利分校', '雪城大学', '南加州大学', '宾夕法尼亚大学', '佐治亚理工学院', '波士顿大学', '杜克大学', '纽约大学', '佛罗里达大学', '宾州州立大学公园分校'],
    '60-70': ['俄亥俄州立大学', '宾夕法尼亚大学', '东北大学', '明尼苏达双城大学', '匹兹堡大学', '纽约大学', '华盛顿大学', '哥伦比亚大学', '加州大学圣地亚哥分校', '莱斯大学', '西北大学', '威斯康星大学麦迪逊分校', '约翰霍普金斯大学', '密歇根大学安娜堡分校', '杜克大学', '康奈尔大学', '亚利桑那州立大学', '犹他大学', '宾夕法尼亚州立大学', '北卡罗来纳大学教堂山分校', '加州大学尔湾分校', '加州大学戴维斯分校', '弗吉尼亚大学', '史蒂文斯理工学院', '罗切斯特理工学院', '达特茅斯学院'],
    '70-100': ['加州大学伯克利分校', '哥伦比亚大学', '宾夕法尼亚大学', '波士顿大学', '华盛顿大学', '乔治敦大学', '加州大学尔湾分校', '卡内基梅隆大学', '东北大学', '纽约大学', '加州大学圣地亚哥分校', '康奈尔大学', '约翰霍普金斯大学', '南加州大学', '西北大学', '圣路易斯华盛顿大学', '匹兹堡大学', '伊利诺伊大学厄本那-香槟分校', '布朗大学', '杜克大学', '罗格斯大学', '普渡大学西拉法叶分校', '莱斯大学', '俄亥俄州立大学', '密歇根大学安娜堡分校', '密歇根州立大学', '斯坦福大学', '耶鲁大学', '圣母大学', '特拉华大学'],
  },
  australia: {
    '40-50': ['悉尼大学', '昆士兰大学', '莫纳什大学', '悉尼科技大学', '澳大利亚国立大学'],
    '50-60': ['悉尼大学', '昆士兰大学', '新南威尔士大学', '莫纳什大学', '墨尔本大学'],
    '60-70': ['悉尼大学', '墨尔本大学', '新南威尔士大学', '昆士兰大学', '莫纳什大学', '澳大利亚国立大学'],
    '70-100': ['墨尔本大学', '悉尼大学', '澳大利亚国立大学', '莫纳什大学'],
  },
  eu: {
    '50-60': ['格罗宁根大学'],
    '60-70': ['都柏林大学', '捷克技术大学'],
    '70-100': ['代尔夫特理工大学', '莱顿大学', '苏黎世联邦理工学院', '瑞典皇家理工学院'],
  },
  sg: {
    '40-50': ['新加坡国立大学'],
    '50-60': ['新加坡管理大学'],
    '60-70': ['南洋理工大学', '新加坡国立大学'],
    '70-100': ['南洋理工大学', '新加坡国立大学'],
  },
  hk: {
    '40-50': ['香港理工大学'],
    '50-60': ['香港浸会大学', '香港理工大学'],
    '60-70': ['香港中文大学', '香港城市大学', '香港大学', '香港理工大学'],
    '70-100': ['香港中文大学', '香港中文大学（深圳）', '香港大学'],
  },
})

function buildYear2ScoreSchoolData(bandsByCountry) {
  return Object.fromEntries(Object.entries(bandsByCountry).map(([countryKey, bands]) => {
    const schoolMap = new Map()
    Object.entries(bands).forEach(([band, schools]) => {
      schools.forEach((name) => {
        if (!schoolMap.has(name)) {
          schoolMap.set(name, { name, bands: [] })
        }
        schoolMap.get(name).bands.push(band)
      })
    })
    return [countryKey, Array.from(schoolMap.values())]
  }))
}

const YEAR2_SCORE_SCHOOL_DATA = Object.freeze(buildYear2ScoreSchoolData(YEAR2_SCORE_SCHOOL_BANDS))

const TIER_LABELS = Object.freeze({
  reach: { zh: '冲刺', en: 'Reach' },
  match: { zh: '主申', en: 'Match' },
  safety: { zh: '保底', en: 'Safety' },
})

const SCORE_CARD_ICONS = Object.freeze(['🍇', '🍒', '🍋', '🍀', '💎', '🎯', '🌟', '🔮'])

const SCHOOL_NAME_ALIASES = Object.freeze({
  卡耐基梅龙大学: '卡内基梅隆大学',
  加州大学圣地亚哥: '加州大学圣地亚哥分校',
  加利福尼亚大学圣地亚哥分校: '加州大学圣地亚哥分校',
  伊利诺伊大学厄本那香槟分校: '伊利诺伊大学厄本那-香槟分校',
  '伊利诺伊大学厄巴纳-香槟分校': '伊利诺伊大学厄本那-香槟分校',
  悉尼新南威尔士大学: '新南威尔士大学',
  澳洲国立大学: '澳大利亚国立大学',
  蒙纳士大学: '莫纳什大学',
  纽卡斯尔大学英国: '纽卡斯尔大学',
})

function buildSchoolCountryKeys(bandsByCountry) {
  const countryKeys = {}
  Object.entries(bandsByCountry).forEach(([countryKey, bands]) => {
    Object.values(bands).flat().forEach((name) => {
      countryKeys[normalizeSchoolNameForTier(name)] = countryKey
    })
  })
  return countryKeys
}

const SCHOOL_COUNTRY_KEYS = Object.freeze(buildSchoolCountryKeys(YEAR2_SCORE_SCHOOL_BANDS))

const SCHOOL_MIN_MATCH_BANDS = Object.freeze({
  牛津大学: '70-100',
  剑桥大学: '70-100',
  帝国理工学院: '70-100',
  伦敦大学学院: '70-100',
  伦敦国王学院: '70-100',
  香港中文大学深圳: '70-100',
  宾夕法尼亚大学: '70-100',
  斯坦福大学: '70-100',
  耶鲁大学: '70-100',
  哥伦比亚大学: '70-100',
  康奈尔大学: '70-100',
  卡内基梅隆大学: '70-100',
  西北大学: '70-100',
  杜克大学: '70-100',
  布朗大学: '70-100',
  加州大学伯克利分校: '70-100',
  约翰霍普金斯大学: '70-100',
  佐治亚理工学院: '70-100',
  加州大学圣地亚哥分校: '70-100',
  南加州大学: '70-100',
  纽约大学: '70-100',
  '伊利诺伊大学厄本那-香槟分校': '70-100',
  莱斯大学: '70-100',
  密歇根大学安娜堡分校: '70-100',
  华盛顿大学: '70-100',
  圣路易斯华盛顿大学: '70-100',
  新加坡国立大学: '70-100',
  南洋理工大学: '70-100',
  香港大学: '70-100',
  香港科技大学: '70-100',
  香港中文大学: '70-100',
  苏黎世联邦理工学院: '70-100',
  代尔夫特理工大学: '70-100',
  瑞典皇家理工学院: '70-100',
  莱顿大学: '70-100',
  墨尔本大学: '70-100',
  澳大利亚国立大学: '70-100',
  爱丁堡大学: '60-70',
  曼彻斯特大学: '60-70',
  布里斯托大学: '60-70',
  华威大学: '60-70',
  格拉斯哥大学: '60-70',
  杜伦大学: '60-70',
  南安普顿大学: '60-70',
  悉尼大学: '60-70',
  新南威尔士大学: '60-70',
  莫纳什大学: '60-70',
  昆士兰大学: '60-70',
  波士顿大学: '60-70',
  东北大学: '60-70',
  威斯康星大学麦迪逊分校: '60-70',
})

const CHINESE_SCHOOL_EN_NAMES = Object.freeze({
  伦敦大学学院: 'University College London',
  帝国理工学院: 'Imperial College London',
  爱丁堡大学: 'University of Edinburgh',
  曼彻斯特大学: 'University of Manchester',
  布里斯托大学: 'University of Bristol',
  谢菲尔德大学: 'University of Sheffield',
  华威大学: 'University of Warwick',
  利物浦大学: 'University of Liverpool',
  南安普顿大学: 'University of Southampton',
  格拉斯哥大学: 'University of Glasgow',
  杜伦大学: 'Durham University',
  卡迪夫大学: 'Cardiff University',
  伦敦艺术大学: 'University of the Arts London',
  提赛德大学: 'Teesside University',
  剑桥大学: 'University of Cambridge',
  伦敦国王学院: "King's College London",
  伦敦大学国王学院: "King's College London",
  宾夕法尼亚大学: 'University of Pennsylvania',
  牛津大学: 'University of Oxford',
  诺丁汉大学: 'University of Nottingham',
  纽卡斯尔大学: 'Newcastle University',
  伦敦大学玛丽女王学院: 'Queen Mary University of London',
  玛丽女王大学: 'Queen Mary University of London',
  悉尼大学: 'University of Sydney',
  伯明翰大学: 'University of Birmingham',
  伦敦大学金史密斯学院: 'Goldsmiths, University of London',
  利兹大学: 'University of Leeds',
  金斯顿大学: 'Kingston University',
  南洋理工大学: 'Nanyang Technological University',
  东北大学: 'Northeastern University',
  美国东北大学: 'Northeastern University',
  昆士兰大学: 'University of Queensland',
  埃克塞特大学: 'University of Exeter',
  巴斯大学: 'University of Bath',
  西交利物浦大学: "Xi'an Jiaotong-Liverpool University",
  匹兹堡大学: 'University of Pittsburgh',
  兰卡斯特大学: 'Lancaster University',
  西北大学: 'Northwestern University',
  密歇根大学安娜堡分校: 'University of Michigan, Ann Arbor',
  加州大学伯克利分校: 'University of California, Berkeley',
  哥伦比亚大学: 'Columbia University',
  华盛顿大学: 'University of Washington',
  约翰霍普金斯大学: 'Johns Hopkins University',
  圣路易斯华盛顿大学: 'Washington University in St. Louis',
  特拉华大学: 'University of Delaware',
  乔治敦大学: 'Georgetown University',
  加州大学尔湾分校: 'University of California, Irvine',
  卡内基梅隆大学: 'Carnegie Mellon University',
  卡耐基梅龙大学: 'Carnegie Mellon University',
  波士顿大学: 'Boston University',
  纽约大学: 'New York University',
  加州大学圣地亚哥分校: 'University of California, San Diego',
  加利福尼亚大学圣地亚哥分校: 'University of California, San Diego',
  康奈尔大学: 'Cornell University',
  南加州大学: 'University of Southern California',
  伊利诺伊大学厄本那香槟分校: 'University of Illinois Urbana-Champaign',
  '伊利诺伊大学厄本那-香槟分校': 'University of Illinois Urbana-Champaign',
  '伊利诺伊大学厄巴纳-香槟分校': 'University of Illinois Urbana-Champaign',
  罗格斯大学: 'Rutgers University',
  杜克大学: 'Duke University',
  加州大学圣塔芭芭拉分校: 'University of California, Santa Barbara',
  圣母大学: 'University of Notre Dame',
  佐治亚理工学院: 'Georgia Institute of Technology',
  布朗大学: 'Brown University',
  密歇根州立大学: 'Michigan State University',
  加州大学戴维斯分校: 'University of California, Davis',
  普渡大学西拉法叶分校: 'Purdue University West Lafayette',
  麦吉尔大学: 'McGill University',
  麦克马斯特大学: 'McMaster University',
  加拿大西安大略大学: 'Western University',
  莱斯大学: 'Rice University',
  俄亥俄州立大学: 'Ohio State University',
  西俄克拉荷马州立学院: 'Southwestern Oklahoma State University',
  斯坦福大学: 'Stanford University',
  耶鲁大学: 'Yale University',
  理海大学: 'Lehigh University',
  威斯康星大学麦迪逊分校: 'University of Wisconsin-Madison',
  多伦多大学: 'University of Toronto',
  明尼苏达双城大学: 'University of Minnesota Twin Cities',
  亚利桑那州立大学: 'Arizona State University',
  犹他大学: 'University of Utah',
  宾夕法尼亚州立大学: 'Pennsylvania State University',
  宾州州立大学公园分校: 'Pennsylvania State University, University Park',
  北卡罗来纳大学教堂山分校: 'University of North Carolina at Chapel Hill',
  史蒂文斯理工学院: 'Stevens Institute of Technology',
  弗吉尼亚大学: 'University of Virginia',
  罗切斯特理工学院: 'Rochester Institute of Technology',
  达特茅斯学院: 'Dartmouth College',
  印第安纳大学伯明顿分校: 'Indiana University Bloomington',
  温莎大学: 'University of Windsor',
  佛罗里达大学: 'University of Florida',
  皇家大学: 'Royal Roads University',
  雪城大学: 'Syracuse University',
  马里兰大学学院公园分校: 'University of Maryland, College Park',
  瑞士酒店管理大学: 'Swiss Hotel Management School',
  澳大利亚国立大学: 'Australian National University',
  墨尔本大学: 'University of Melbourne',
  奥克兰大学: 'University of Auckland',
  莫纳什大学: 'Monash University',
  新南威尔士大学: 'University of New South Wales',
  悉尼科技大学: 'University of Technology Sydney',
  香港中文大学: 'The Chinese University of Hong Kong',
  香港大学: 'The University of Hong Kong',
  昆山杜克大学: 'Duke Kunshan University',
  '香港中文大学（深圳）': 'The Chinese University of Hong Kong, Shenzhen',
  香港中文大学深圳: 'The Chinese University of Hong Kong, Shenzhen',
  香港理工大学: 'The Hong Kong Polytechnic University',
  香港城市大学: 'City University of Hong Kong',
  宁波诺丁汉大学: 'University of Nottingham Ningbo China',
  香港浸会大学: 'Hong Kong Baptist University',
  新加坡国立大学: 'National University of Singapore',
  新加坡管理大学: 'Singapore Management University',
  代尔夫特理工大学: 'Delft University of Technology',
  瑞典皇家理工学院: 'KTH Royal Institute of Technology',
  苏黎世联邦理工学院: 'ETH Zurich',
  莱顿大学: 'Leiden University',
  捷克技术大学: 'Czech Technical University in Prague',
  都柏林大学: 'University College Dublin',
  格罗宁根大学: 'University of Groningen',
})

export function localizeYear2SchoolName(name, language = 'zh') {
  if (!name) return ''
  if (typeof name === 'object') {
    return name[language] || name.en || name.zh || ''
  }
  if (language === 'en') {
    return CHINESE_SCHOOL_EN_NAMES[name] || name
  }
  return name
}

function getScoreBand(score) {
  const numericScore = Number(score)
  if (numericScore >= 70) return '70-100'
  if (numericScore >= 60) return '60-70'
  if (numericScore >= 50) return '50-60'
  return '40-50'
}

function getProfileScore(profile) {
  const academicProfile = profile?.academicProfile || {}
  const rawExplicitScore = academicProfile.gpaScore ?? academicProfile.score ?? profile?.gpaScore
  const explicitScore = Number(rawExplicitScore)
  if (rawExplicitScore !== null && rawExplicitScore !== undefined && rawExplicitScore !== '' && Number.isFinite(explicitScore) && explicitScore >= 0) {
    return explicitScore
  }

  const bandScore = GPA_BAND_SCORE[academicProfile.gpaBand] || GPA_BAND_SCORE[profile?.gpaBand]
  if (bandScore) return bandScore

  const gpaText = String(academicProfile.gpa || profile?.gpa || '')
  const parsedScore = Number(gpaText.match(/\d+(?:\.\d+)?/)?.[0])
  return Number.isFinite(parsedScore) && parsedScore > 0 ? parsedScore : 82
}

function normalizeSchoolNameForTier(name) {
  const normalized = String(name || '')
    .trim()
    .replace(/[（）()]/g, '')
    .replace(/\s+/g, '')
  return SCHOOL_NAME_ALIASES[normalized] || normalized
}

function getSchoolCountryKey(name) {
  return SCHOOL_COUNTRY_KEYS[normalizeSchoolNameForTier(name)] || ''
}

function isSchoolInSelectedCountry(school, countryKey) {
  const expectedKey = getSchoolCountryKey(school?.name)
  return expectedKey === countryKey
}

function getTierForBands(schoolName, bands, currentBand) {
  const currentIndex = SCORE_BAND_ORDER.indexOf(currentBand)
  const bandIndexes = bands.map((band) => SCORE_BAND_ORDER.indexOf(band)).filter((index) => index >= 0)
  if (!bandIndexes.length || currentIndex < 0) return 'match'

  const minMatchBand = SCHOOL_MIN_MATCH_BANDS[normalizeSchoolNameForTier(schoolName)]
  const minMatchIndex = SCORE_BAND_ORDER.indexOf(minMatchBand)
  if (minMatchIndex >= 0) {
    if (currentIndex < minMatchIndex) return 'safety'
    if (currentIndex > minMatchIndex) return 'reach'
    return 'match'
  }

  if (bandIndexes.includes(currentIndex)) {
    const appearsInLowerScoreBand = bandIndexes.some((index) => index > currentIndex)
    const appearsInHigherScoreBand = bandIndexes.some((index) => index < currentIndex)
    if (appearsInLowerScoreBand && !appearsInHigherScoreBand) return 'safety'
    return 'match'
  }

  const highestRequirementIndex = Math.min(...bandIndexes)
  const lowestRequirementIndex = Math.max(...bandIndexes)
  if (lowestRequirementIndex < currentIndex) return 'reach'
  if (highestRequirementIndex > currentIndex) return 'safety'
  return 'match'
}

function makeScoreSchoolCard(countryKey, school, recommendedTier, currentBand, index) {
  const tierLabel = TIER_LABELS[recommendedTier] || TIER_LABELS.match
  const englishName = CHINESE_SCHOOL_EN_NAMES[school.name] || school.name
  return {
    id: `score-${countryKey}-${index}-${school.name}`,
    countryKey,
    icon: SCORE_CARD_ICONS[(index - 1) % SCORE_CARD_ICONS.length],
    isScoreDataCard: true,
    name: { zh: school.name, en: englishName },
    tag: { zh: `当前 ${currentBand} · ${tierLabel.zh}`, en: `Current ${currentBand} · ${tierLabel.en}` },
    recommendedTier,
    scoreBand: currentBand,
    sourceBands: school.bands,
    caseInfo: {
      zh: `来自 Y2 择校数据样本。该校出现分数段：${school.bands.join(' / ')}；当前分数段：${currentBand}。`,
      en: `From the Y2 school-choice data sample. School bands: ${school.bands.join(' / ')}; current band: ${currentBand}.`,
    },
  }
}

function getPrioritizedBands(currentBand) {
  const currentIndex = SCORE_BAND_ORDER.indexOf(currentBand)
  if (currentIndex < 0) return SCORE_BAND_ORDER

  const moreSelectiveBands = SCORE_BAND_ORDER.slice(0, currentIndex).reverse()
  const lessSelectiveBands = SCORE_BAND_ORDER.slice(currentIndex + 1)
  return [currentBand, ...moreSelectiveBands, ...lessSelectiveBands]
}

function getOrderedScoreSchools(countryKey, countrySchools, currentBand) {
  const schoolsByName = new Map(countrySchools.map((school) => [school.name, school]))
  const seenNames = new Set()
  const orderedSchools = []

  getPrioritizedBands(currentBand).forEach((band) => {
    const names = YEAR2_SCORE_SCHOOL_BANDS[countryKey]?.[band] || []
    names.forEach((name) => {
      const school = schoolsByName.get(name)
      if (!school || seenNames.has(name)) return
      seenNames.add(name)
      orderedSchools.push(school)
    })
  })

  countrySchools.forEach((school) => {
    if (seenNames.has(school.name)) return
    seenNames.add(school.name)
    orderedSchools.push(school)
  })

  return orderedSchools
}

export function getYear2ProfileScore(profile) {
  return getProfileScore(profile)
}

export function getYear2ScoreBand(profile) {
  return getScoreBand(getProfileScore(profile))
}

export function getYear2ScoreSchoolCards(countryKey, profile, options = {}) {
  const normalizedKey = normalizeCountryKey(countryKey)
  if (normalizedKey === 'niche') return []
  const schools = YEAR2_SCORE_SCHOOL_DATA[normalizedKey]
  if (!schools) return []
  const countrySchools = schools.filter((school) => isSchoolInSelectedCountry(school, normalizedKey))
  const currentBand = getYear2ScoreBand(profile)
  const orderedSchools = getOrderedScoreSchools(normalizedKey, countrySchools, currentBand)
  const visibleSchools = options.remaining ? orderedSchools.slice(10) : orderedSchools.slice(0, 10)

  return visibleSchools.map((school, index) => {
    const cardIndex = options.remaining ? index + 11 : index + 1
    return makeScoreSchoolCard(normalizedKey, school, getTierForBands(school.name, school.bands, currentBand), currentBand, cardIndex)
  })
}

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

export function getYear2CountrySchoolOptions() {
  return ['uk', 'us', 'australia', 'hk', 'sg', 'eu'].map((key) => YEAR2_COUNTRY_SCHOOLS[key])
}

export function getYear2SchoolCases(countryKey, profile) {
  return getYear2ScoreSchoolCards(countryKey, profile, { remaining: true })
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
