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
    label: { zh: '澳洲', en: 'Australia' },
    schools: [
      { id: 'au-melbourne', icon: '🎓', name: { zh: '墨尔本大学', en: 'University of Melbourne' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'au-anu', icon: '🦉', name: { zh: '澳大利亚国立大学', en: 'Australian National University' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'au-sydney', icon: '🏛️', name: { zh: '悉尼大学', en: 'University of Sydney' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach' },
      { id: 'au-unsw', icon: '🌊', name: { zh: '新南威尔士大学', en: 'University of New South Wales' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'au-uq', icon: '🌿', name: { zh: '昆士兰大学', en: 'University of Queensland' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'au-monash', icon: '🧪', name: { zh: '莫纳什大学', en: 'Monash University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match' },
      { id: 'au-adelaide', icon: '🍇', name: { zh: '阿德莱德大学', en: 'University of Adelaide' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
      { id: 'au-uts', icon: '🏙️', name: { zh: '悉尼科技大学', en: 'University of Technology Sydney' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
      { id: 'au-macquarie', icon: '🧭', name: { zh: '麦考瑞大学', en: 'Macquarie University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety' },
    ],
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

const EXTRA_SCHOOL_CASES = Object.freeze([
  { id: 'case-uk-manchester', countryKey: 'uk', icon: '🏭', name: { zh: '曼彻斯特大学', en: 'University of Manchester' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合想要英国大城市资源、工科/商科项目选择较多的学生。', en: 'Useful for students who want a large UK city, broad engineering/business options, and strong employer visibility.' } },
  { id: 'case-uk-edinburgh', countryKey: 'uk', icon: '🏰', name: { zh: '爱丁堡大学', en: 'University of Edinburgh' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach', caseInfo: { zh: '适合学术背景较强、希望兼顾综合排名和研究氛围的申请者。', en: 'A strong reference for applicants with solid academics who value ranking and research culture.' } },
  { id: 'case-uk-warwick', countryKey: 'uk', icon: '🛡️', name: { zh: '华威大学', en: 'University of Warwick' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合看重商科、数据和就业信号，希望主申层更扎实的学生。', en: 'A practical match case for business, data, and employability-focused applicants.' } },
  { id: 'case-uk-bristol', countryKey: 'uk', icon: '🌉', name: { zh: '布里斯托大学', en: 'University of Bristol' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合想兼顾英国综合声誉、城市体验和项目选择的申请者。', en: 'Useful for applicants balancing UK reputation, city experience, and program choice.' } },
  { id: 'case-uk-leeds', countryKey: 'uk', icon: '🌿', name: { zh: '利兹大学', en: 'University of Leeds' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合给英国方案增加更稳层级，同时保留大校资源的学生。', en: 'A steadier UK option that still keeps large-university resources in the list.' } },
  { id: 'case-us-nyu', countryKey: 'us', icon: '🌃', name: { zh: '纽约大学', en: 'New York University' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach', caseInfo: { zh: '适合目标明确、想把城市资源和职业叙事结合起来的学生。', en: 'Good for students who can connect city resources, projects, and career storytelling.' } },
  { id: 'case-us-uci', countryKey: 'us', icon: '🌴', name: { zh: '加州大学欧文分校', en: 'UC Irvine' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合关注美国科技就业环境、希望名单中段更稳的申请者。', en: 'A practical mid-list option for applicants targeting the US tech ecosystem.' } },
  { id: 'case-us-ucsd', countryKey: 'us', icon: '🔬', name: { zh: '加州大学圣地亚哥分校', en: 'UC San Diego' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach', caseInfo: { zh: '适合理工背景较强、希望冲刺美国科研和科技资源的学生。', en: 'A reach case for strong STEM applicants targeting US research and tech resources.' } },
  { id: 'case-us-wisconsin', countryKey: 'us', icon: '🦡', name: { zh: '威斯康星大学麦迪逊分校', en: 'University of Wisconsin-Madison' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合希望主申层兼具学术声誉和大校资源的申请者。', en: 'A balanced match option with academic reputation and large-university resources.' } },
  { id: 'case-us-pittsburgh', countryKey: 'us', icon: '🌉', name: { zh: '匹兹堡大学', en: 'University of Pittsburgh' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合给美国名单增加更稳选择，降低整体申请风险。', en: 'A steadier US option to reduce overall list risk.' } },
  { id: 'case-au-sydney', countryKey: 'australia', icon: '🌊', name: { zh: '悉尼大学', en: 'University of Sydney' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach', caseInfo: { zh: '适合看重澳洲名校声誉、城市资源和跨专业选择的学生。', en: 'A useful case for applicants prioritizing Australian reputation, city access, and broad program choice.' } },
  { id: 'case-au-anu', countryKey: 'australia', icon: '⭐', name: { zh: '澳大利亚国立大学', en: 'Australian National University' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach', caseInfo: { zh: '适合偏研究导向、希望强调学术潜力和严肃项目匹配的学生。', en: 'Best framed for research-oriented students with a serious academic-fit narrative.' } },
  { id: 'case-au-adelaide', countryKey: 'australia', icon: '🍇', name: { zh: '阿德莱德大学', en: 'University of Adelaide' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合希望澳洲八大背景，同时让主申层更稳的学生。', en: 'A match case for applicants wanting Group of Eight context with steadier risk.' } },
  { id: 'case-au-rmit', countryKey: 'australia', icon: '🏙️', name: { zh: '皇家墨尔本理工大学', en: 'RMIT University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合强调实践、设计、技术应用和城市就业资源的学生。', en: 'Good for practice, design, applied tech, and city-employment narratives.' } },
  { id: 'case-au-macquarie', countryKey: 'australia', icon: '🧭', name: { zh: '麦考瑞大学', en: 'Macquarie University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合给澳洲方向补充更稳保底层，保持申请节奏可控。', en: 'A calmer Australian safety layer for a more controlled application plan.' } },
  { id: 'case-hk-polyu', countryKey: 'hk', icon: '🧭', name: { zh: '香港理工大学', en: 'Hong Kong Polytechnic University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合重视应用导向、就业连接和香港城市资源的申请者。', en: 'A strong applied option for applicants who value employability and Hong Kong industry links.' } },
  { id: 'case-hk-lingnan', countryKey: 'hk', icon: '📚', name: { zh: '岭南大学', en: 'Lingnan University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合想给香港方向增加更稳保底层的学生。', en: 'Useful when adding a calmer Hong Kong safety layer to the list.' } },
  { id: 'case-hk-hkmu', countryKey: 'hk', icon: '📖', name: { zh: '香港都会大学', en: 'Hong Kong Metropolitan University' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合希望保留香港城市路径，同时需要更稳录取空间的学生。', en: 'A safer Hong Kong city-path option for students needing more admission room.' } },
  { id: 'case-hk-eduhk', countryKey: 'hk', icon: '🍎', name: { zh: '香港教育大学', en: 'The Education University of Hong Kong' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合教育、语言、社会科学等方向更明确的申请者。', en: 'Useful for applicants with clear education, language, or social-science interests.' } },
  { id: 'case-hk-hsuhk', countryKey: 'hk', icon: '💼', name: { zh: '香港恒生大学', en: 'The Hang Seng University of Hong Kong' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合给香港名单补充更稳层级，尤其关注商科和应用方向。', en: 'A steadier Hong Kong case, especially for business and applied tracks.' } },
  { id: 'case-sg-suss', countryKey: 'sg', icon: '🧩', name: { zh: '新加坡社科大学', en: 'Singapore University of Social Sciences' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合希望保留新加坡路径、同时让名单风险更可控的申请者。', en: 'A steadier Singapore case for applicants who need controlled list risk.' } },
  { id: 'case-sg-sit', countryKey: 'sg', icon: '🔧', name: { zh: '新加坡理工大学', en: 'Singapore Institute of Technology' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合强调实践能力、项目经历和应用型职业目标的学生。', en: 'Good for practice-oriented applicants with project evidence and applied career goals.' } },
  { id: 'case-sg-lasalle', countryKey: 'sg', icon: '🎨', name: { zh: '拉萨尔艺术学院', en: 'LASALLE College of the Arts' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合艺术、设计、创意产业方向更清晰的学生。', en: 'A case for applicants with clearer art, design, and creative-industry goals.' } },
  { id: 'case-sg-nafa', countryKey: 'sg', icon: '🎭', name: { zh: '南洋艺术学院', en: 'Nanyang Academy of Fine Arts' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合艺术类申请中需要补充更稳新加坡选择的学生。', en: 'A steadier Singapore choice for art-focused application lists.' } },
  { id: 'case-sg-curtin', countryKey: 'sg', icon: '🌐', name: { zh: '科廷大学新加坡校区', en: 'Curtin Singapore' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合希望保留新加坡学习体验，同时追求更稳申请结果的学生。', en: 'A safer Singapore study-experience option with more controlled risk.' } },
  { id: 'case-eu-tum', countryKey: 'eu', icon: '⚙️', name: { zh: '慕尼黑工业大学', en: 'Technical University of Munich' }, tag: { zh: '冲刺参考', en: 'Reach tier' }, recommendedTier: 'reach', caseInfo: { zh: '适合理工背景强、能应对欧陆项目要求和语言/材料细节的学生。', en: 'A reach case for strong STEM applicants ready for detailed European requirements.' } },
  { id: 'case-eu-lund', countryKey: 'eu', icon: '🌲', name: { zh: '隆德大学', en: 'Lund University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合希望在欧洲大陆方案中加入北欧稳定选择的学生。', en: 'A balanced Nordic reference for applicants building a continental Europe list.' } },
  { id: 'case-eu-helsinki', countryKey: 'eu', icon: '❄️', name: { zh: '赫尔辛基大学', en: 'University of Helsinki' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合希望欧陆名单兼顾北欧学术氛围和稳定性的学生。', en: 'A Nordic match case for academic atmosphere and list stability.' } },
  { id: 'case-eu-maastricht', countryKey: 'eu', icon: '🧠', name: { zh: '马斯特里赫特大学', en: 'Maastricht University' }, tag: { zh: '主申参考', en: 'Match tier' }, recommendedTier: 'match', caseInfo: { zh: '适合喜欢问题导向学习、希望欧陆方案更具体的申请者。', en: 'Good for applicants who like problem-based learning and a focused Europe plan.' } },
  { id: 'case-eu-vienna', countryKey: 'eu', icon: '🎻', name: { zh: '维也纳大学', en: 'University of Vienna' }, tag: { zh: '保底参考', en: 'Safety tier' }, recommendedTier: 'safety', caseInfo: { zh: '适合给欧陆名单加入文化氛围强、风险更稳的选择。', en: 'A calmer Europe option with strong cultural context and lower list risk.' } },
])

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

export function getYear2SchoolCases() {
  return EXTRA_SCHOOL_CASES
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
