<template>
  <section class="completed-view">
    <div class="completed-card">
      <div class="status-mark">
        <i class="fas fa-check"></i>
      </div>
      <p class="eyebrow">{{ t('gameResult.completed') }}</p>
      <h2>{{ title || t('gameResult.passed') }}</h2>
      <p class="lead">{{ t('gameResult.alreadyCompleted') }}</p>

      <div class="meta-row">
        <span>{{ t('gameResult.completedAt') }}</span>
        <strong>{{ formattedTime }}</strong>
      </div>

      <div v-if="hasResultItems" class="result-panel">
        <div class="result-title">
          <i class="fas fa-scroll"></i>
          <span>{{ t('gameResult.previousResult') }}</span>
        </div>
        <dl class="result-grid">
          <template v-for="item in resultItems" :key="item.key">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </template>
        </dl>
      </div>

      <div v-else class="passed-panel">
        <i class="fas fa-medal"></i>
        <span>{{ t('gameResult.passed') }}</span>
      </div>

      <div class="actions">
        <button type="button" class="btn secondary" @click="$emit('back')">
          <i class="fas fa-map"></i>
          <span>{{ t('gameResult.backToMap') }}</span>
        </button>
        <button type="button" class="btn primary" @click="$emit('retry')">
          <i class="fas fa-rotate-left"></i>
          <span>{{ t('gameResult.tryAgain') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { localizeYear2SchoolName, normalizeCountryKey } from '@/config/year2CountrySchools'

const props = defineProps({
  result: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
})

defineEmits(['retry', 'back'])

const { currentLanguage, t, tm } = useAppI18n()

const countryLabels = {
  uk: { zh: '英国', en: 'United Kingdom' },
  us: { zh: '美国', en: 'United States' },
  australia: { zh: '澳大利亚', en: 'Australia' },
  eu: { zh: '其他欧洲', en: 'Other Europe' },
  europe: { zh: '其他欧洲', en: 'Other Europe' },
  'continental europe': { zh: '其他欧洲', en: 'Other Europe' },
  '欧洲大陆': { zh: '其他欧洲', en: 'Other Europe' },
  '欧陆': { zh: '其他欧洲', en: 'Other Europe' },
  sg: { zh: '新加坡', en: 'Singapore' },
  hk: { zh: '香港', en: 'Hong Kong' },
  jointProgram: { zh: '中外合作', en: 'Sino-foreign Cooperative Universities' },
  niche: { zh: '日韩等小众国家', en: 'Japan / Korea and other niche countries' },
}

const routeTitleMap = {
  'Route Result: Explorer of Albion': 'uk',
  'Route Result: Pioneer of the New World': 'us',
  'Route Result: Southern Cross Explorer': 'australia',
  'Route Result: Scholar of Continental Europe': 'eu',
  'Route Result: Scholar of Europe': 'eu',
  'Route Result: Strategist of the Lion City': 'sg',
  'Route Result: Navigator of the Orient': 'hk',
  'Route Result: Niche Region Explorer': 'niche',
  'Route Result: United Kingdom': 'uk',
  'Route Result: Other Europe': 'eu',
  'Route Result: United States': 'us',
  'Route Result: Australia': 'australia',
  'Route Result: Singapore': 'sg',
  'Route Result: Hong Kong': 'hk',
  'Route Result: Sino-foreign Cooperative Universities': 'jointProgram',
  'Route Result: Japan / Korea and other niche countries': 'niche',
}

const displayCountryLabels = {
  uk: { zh: '英国', en: 'United Kingdom' },
  us: { zh: '美国', en: 'United States' },
  australia: { zh: '澳大利亚', en: 'Australia' },
  eu: { zh: '其他欧洲', en: 'Other Europe' },
  europe: { zh: '其他欧洲', en: 'Other Europe' },
  'continental europe': { zh: '其他欧洲', en: 'Other Europe' },
  '欧洲大陆': { zh: '其他欧洲', en: 'Other Europe' },
  '欧陆': { zh: '其他欧洲', en: 'Other Europe' },
  sg: { zh: '新加坡', en: 'Singapore' },
  hk: { zh: '香港', en: 'Hong Kong' },
  jointProgram: { zh: '中外合作', en: 'Sino-foreign Cooperative Universities' },
  niche: { zh: '日韩等小众国家', en: 'Japan / Korea and other niche countries' },
}

const schoolNameMap = {
  'University of Sydney': '悉尼大学',
  'Australian National University': '澳大利亚国立大学',
  'University of Queensland': '昆士兰大学',
  'University of Melbourne': '墨尔本大学',
  'University of Adelaide': '阿德莱德大学',
  'University of Technology Sydney': '悉尼科技大学',
  'Macquarie University': '麦考瑞大学',
  'University of Auckland': '奥克兰大学',
  'Monash University': '莫纳什大学',
  'University of Leeds': '利兹大学',
  'University of New South Wales': '新南威尔士大学',
  'University of Bristol': '布里斯托大学',
  'University of Liverpool': '利物浦大学',
}

const tierNameMap = {
  reach: { zh: '冲刺 / 奇迹位', en: 'Reach / Miracle' },
  match: { zh: '主申 / 对抗位', en: 'Match / Battleground' },
  safety: { zh: '保底 / 安全位', en: 'Safety / Sanctuary' },
  'Reach / Miracle': { zh: '冲刺 / 奇迹位', en: 'Reach / Miracle' },
  'Match / Battleground': { zh: '主申 / 对抗位', en: 'Match / Battleground' },
  'Safety / Sanctuary': { zh: '保底 / 安全位', en: 'Safety / Sanctuary' },
  '冲刺 / 奇迹位': { zh: '冲刺 / 奇迹位', en: 'Reach / Miracle' },
  '主申 / 对抗位': { zh: '主申 / 对抗位', en: 'Match / Battleground' },
  '保底 / 安全位': { zh: '保底 / 安全位', en: 'Safety / Sanctuary' },
  冲刺: { zh: '冲刺', en: 'Reach' },
  主申: { zh: '主申', en: 'Match' },
  保底: { zh: '保底', en: 'Safety' },
}

const formattedTime = computed(() => {
  if (!props.result?.completedAt) return '-'
  const date = new Date(props.result.completedAt)
  if (Number.isNaN(date.getTime())) return props.result.completedAt
  return new Intl.DateTimeFormat(currentLanguage.value === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
})

const labelMap = computed(() => ({
  score: t('gameResult.fields.score'),
  correct: t('gameResult.fields.correct'),
  total: t('gameResult.fields.total'),
  passed: t('gameResult.fields.passed'),
  winner: t('gameResult.fields.recommendation'),
  matchedCountry: t('gameResult.fields.matchedCountry'),
  recommendedCountry: t('gameResult.fields.matchedCountry'),
  selectedCountry: t('gameResult.fields.matchedCountry'),
  schools: t('gameResult.fields.schools'),
  selectedSchools: t('gameResult.fields.schools'),
  tierBuckets: t('gameResult.fields.schoolTiers'),
  clearedStages: t('gameResult.fields.clearedStages'),
  gems: t('gameResult.fields.artifacts'),
  level: t('gameResult.fields.level'),
  finalNode: t('gameResult.fields.finalNode'),
  feedback: currentLanguage.value === 'en' ? 'Feedback' : '反馈',
  message: currentLanguage.value === 'en' ? 'Message' : '提示',
  scores: currentLanguage.value === 'en' ? 'Scores' : '分数',
  countryScores: currentLanguage.value === 'en' ? 'Region Scores' : '地区分数',
  answers: currentLanguage.value === 'en' ? 'Answers' : '作答记录',
  explanation: currentLanguage.value === 'en' ? 'Explanation' : '说明',
}))

function localizeCountryKey(value) {
  const rawValue = String(value || '')
  if (currentLanguage.value === 'en' && (rawValue.includes('日韩') || rawValue.includes('小众'))) {
    return 'Japan / Korea and other niche countries'
  }
  const key = normalizeCountryKey(value) || String(value || '').toLowerCase()
  return displayCountryLabels[key]?.[currentLanguage.value] || countryLabels[key]?.[currentLanguage.value] || normalizeLegacyRegionText(value)
}

function normalizeLegacyRegionText(value) {
  const replacement = currentLanguage.value === 'en' ? 'Other Europe' : '其他欧洲'
  return String(value || '')
    .replace(/continental europe/gi, replacement)
    .replace(/欧洲大陆|欧陆|其他欧洲/g, replacement)
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function routeKeyFromData(data) {
  return (
    String(data.winner || '').toLowerCase() ||
    routeTitleMap[data.recommendedCountry] ||
    String(data.matchedCountry || '').toLowerCase()
  )
}

function localizeResultValue(key, value, data) {
  const routeKey = routeKeyFromData(data)
  const routeResult = routeKey ? tm(`pages.y2_2.results.${routeKey}`) : null

  if (key === 'recommendedCountry' && routeResult?.title) return stripHtml(routeResult.title)
  if (key === 'matchedCountry' || key === 'winner' || key === 'selectedCountry') return localizeCountryKey(value)
  if (key === 'scores' || key === 'countryScores') return stringifyCountryScores(value)
  if (key === 'explanation' && routeResult?.analysis) return stripHtml(routeResult.analysis)
  if (key === 'answers') return stringifyAnswers(value)
  if (key === 'tierBuckets') return stringifyTierBuckets(value)
  if (key === 'feedback') return stringifyFeedback(value, data)
  if (key === 'message') return localizeMessage(value)
  return stringifyValue(value)
}

function localizeMessage(value) {
  const rawValue = String(value || '')
  if (currentLanguage.value === 'zh' && rawValue.includes('Sino-foreign cooperative university pathways')) {
    return '中外合作大学路径，请联系 DA 获取更适合你的升学建议。'
  }
  if (currentLanguage.value === 'zh' && rawValue.includes('Japan, Korea, and other niche countries')) {
    return '日韩等小众国家，请与老师面谈，获取更适合你的升学建议。'
  }
  if (currentLanguage.value === 'en' && rawValue.includes('中外合作')) {
    return 'For Sino-foreign cooperative university pathways, please contact your DA for more tailored study planning advice.'
  }
  if (currentLanguage.value === 'en' && (rawValue.includes('日韩等小众国家') || rawValue.includes('小众国家'))) {
    return 'For Japan, Korea, and other niche countries, please speak with your teacher for more tailored study planning advice.'
  }
  return stringifyValue(value)
}

function stringifyAnswers(value) {
  if (!Array.isArray(value)) return stringifyValue(value)
  return value
    .map((answer) => {
      const questionNumber = Number(answer?.questionIndex) + 1
      const choice = String(answer?.choiceId || '').toUpperCase()
      if (!Number.isFinite(questionNumber) || !choice) return ''
      return currentLanguage.value === 'en'
        ? `Q${questionNumber}: ${choice}`
        : `第 ${questionNumber} 题：选择 ${choice}`
    })
    .filter(Boolean)
    .join(' / ')
}

function localizeSchoolName(value) {
  if (value && typeof value === 'object') return localizeYear2SchoolName(value, currentLanguage.value)
  const rawValue = String(value || '')
  if (currentLanguage.value === 'en') return localizeYear2SchoolName(rawValue, 'en')
  return schoolNameMap[rawValue] || rawValue
}

function localizeTierName(value) {
  const rawValue = String(value || '')
  return tierNameMap[rawValue]?.[currentLanguage.value] || rawValue
}

function localizeFeedbackParams(params = {}, data = {}) {
  const localized = { ...params }
  const school = params.school || params.schoolName || params.schoolCard?.name
  if (school) {
    localized.school = localizeSchoolName(school)
  }

  if (params.countryKey) {
    localized.country = localizeCountryKey(params.countryKey)
  } else if (params.country) {
    localized.country = localizeCountryKey(params.country)
  } else {
    localized.country = localizeCountryKey(data?.matchedCountry || '')
  }

  if (params.targetTierId) {
    localized.targetTier = localizeTierName(params.targetTierId)
  } else if (params.targetTier) {
    localized.targetTier = localizeTierName(params.targetTier)
  }

  if (params.currentTierId) {
    localized.currentTier = localizeTierName(params.currentTierId)
  } else if (params.currentTier) {
    localized.currentTier = localizeTierName(params.currentTier)
  }

  if (params.tierId) {
    localized.tier = localizeTierName(params.tierId)
  } else if (params.tier) {
    localized.tier = localizeTierName(params.tier)
  }

  delete localized.schoolCard
  delete localized.countryKey
  delete localized.targetTierId
  delete localized.currentTierId
  delete localized.tierId
  return localized
}

function stringifyTierBuckets(value) {
  if (!value || typeof value !== 'object') return stringifyValue(value)
  return ['reach', 'match', 'safety']
    .map((tier) => {
      const schools = Array.isArray(value[tier]) ? value[tier] : []
      if (!schools.length) return ''
      return `${localizeTierName(tier)}: ${schools.map((school) => localizeSchoolName(school)).join(' / ')}`
    })
    .filter(Boolean)
    .join('; ')
}

function stringifyCountryScores(value) {
  if (!value || typeof value !== 'object') return stringifyValue(value)
  const keyOrder = ['uk', 'eu', 'us', 'sg', 'australia', 'hk', 'jointProgram', 'niche']
  return keyOrder
    .filter((key) => value[key] !== null && value[key] !== undefined && value[key] !== '')
    .map((key) => `${localizeCountryKey(key)}: ${value[key]}`)
    .join('; ')
}

function joinFeedback(title, text) {
  return [title, text].filter(Boolean).join('; ')
}

function translatedFeedback(key, params) {
  const title = t(`pages.y2_3.feedback.${key}.title`, params)
  const text = t(`pages.y2_3.feedback.${key}.text`, params)
  return joinFeedback(title, text)
}

function legacyFeedbackParams(baseParams = {}, data = {}) {
  return localizeFeedbackParams({
    country: data?.matchedCountry,
    ...baseParams,
  }, data)
}

function localizeFeedbackItem(item, data) {
  if (item?.titleKey || item?.textKey) {
    const params = localizeFeedbackParams(item.params, data)
    return joinFeedback(
      item.titleKey ? t(item.titleKey, params) : normalizeLegacyRegionText(item.title),
      item.textKey ? t(item.textKey, params) : normalizeLegacyRegionText(item.text),
    )
  }

  const title = normalizeLegacyRegionText(item?.title)
  const text = normalizeLegacyRegionText(item?.text)

  if (currentLanguage.value === 'en') {
    const tooSafeZh = title.match(/^(.+) 被放得太稳$/)
    if (tooSafeZh) {
      return translatedFeedback('tooSafe', legacyFeedbackParams({
        school: tooSafeZh[1],
        targetTier: text.match(/更接近\s*([^。]+)。/)?.[1]?.trim(),
        currentTier: text.match(/放进\s*([^，]+)，/)?.[1]?.trim(),
      }, data))
    }

    const tooHighZh = title.match(/^(.+) 被推得太高$/)
    if (tooHighZh) {
      return translatedFeedback('tooHigh', legacyFeedbackParams({
        school: tooHighZh[1],
        targetTier: text.match(/更适合放在\s*([^。]+)。/)?.[1]?.trim(),
        currentTier: text.match(/放进\s*([^，]+)，/)?.[1]?.trim(),
      }, data))
    }

    const correctReachZh = title.match(/^(.+) 的高位冲刺合理$/)
    if (correctReachZh) {
      return translatedFeedback('correctReach', legacyFeedbackParams({
        school: correctReachZh[1],
        tier: text.match(/放在\s*([^，]+)，/)?.[1]?.trim(),
      }, data))
    }

    const correctMatchZh = title.match(/^(.+) 的主申定位清晰$/)
    if (correctMatchZh) {
      return translatedFeedback('correctMatch', legacyFeedbackParams({
        school: correctMatchZh[1],
        tier: text.match(/放在\s*([^，]+)，/)?.[1]?.trim(),
      }, data))
    }

    const correctSafetyZh = title.match(/^(.+) 承担了真正的保底作用$/)
    if (correctSafetyZh) {
      return translatedFeedback('correctSafety', legacyFeedbackParams({
        school: correctSafetyZh[1],
        tier: text.match(/放在\s*([^，]+)，/)?.[1]?.trim(),
      }, data))
    }

    if (title === '结构仍需清晰') {
      return translatedFeedback('fallback', legacyFeedbackParams({}, data))
    }

    return joinFeedback(title, text)
  }

  const tooSafe = title.match(/^(.+) was placed too safely$/)
  if (tooSafe) {
    return translatedFeedback('tooSafe', legacyFeedbackParams({
      school: tooSafe[1],
      targetTier: text.match(/closer to ([^.]+)\./)?.[1],
      currentTier: text.match(/Putting it in ([^.]+) makes/)?.[1],
    }, data))
  }

  const tooHigh = title.match(/^(.+) was pushed too high$/)
  if (tooHigh) {
    return translatedFeedback('tooHigh', legacyFeedbackParams({
      school: tooHigh[1],
      targetTier: text.match(/fits ([^.]+) better/)?.[1],
      currentTier: text.match(/Putting it in ([^.]+) makes/)?.[1],
    }, data))
  }

  const correctReach = title.match(/^(.+) is a rational high reach$/)
  if (correctReach) {
    return translatedFeedback('correctReach', legacyFeedbackParams({
      school: correctReach[1],
      tier: text.match(/Placing .+ in (.+?) fits/)?.[1],
    }, data))
  }

  const correctMatch = title.match(/^(.+) anchors the match tier well$/)
  if (correctMatch) {
    return translatedFeedback('correctMatch', legacyFeedbackParams({
      school: correctMatch[1],
      tier: text.match(/Placing .+ in (.+?) keeps/)?.[1],
    }, data))
  }

  const correctSafety = title.match(/^(.+) is doing real safety work$/)
  if (correctSafety) {
    return translatedFeedback('correctSafety', legacyFeedbackParams({
      school: correctSafety[1],
      tier: text.match(/Placing .+ in (.+?) gives/)?.[1],
    }, data))
  }

  if (title === 'The Structure Still Needs Work') {
    return translatedFeedback('fallback', legacyFeedbackParams({}, data))
  }

  return joinFeedback(title, text)
}

function stringifyFeedback(value, data) {
  if (!Array.isArray(value)) return stringifyValue(value)
  return value.map((item) => localizeFeedbackItem(item, data)).filter(Boolean).join(' / ')
}

function stringifyValue(value) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'boolean') return value ? t('gameResult.yes') : t('gameResult.no')
  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).filter(Boolean).join(' / ')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== '')
      .slice(0, 8)
      .map(([key, entryValue]) => `${labelMap.value[key] || key}: ${stringifyValue(entryValue)}`)
    return entries.join('; ')
  }
  return normalizeLegacyRegionText(value)
}

const resultItems = computed(() => {
  const data = props.result?.resultData || {}
  const hiddenKeys = new Set(['recommendedCountryKey', 'matchedCountryZh', 'matchedCountryEn', 'countryScores'])
  return Object.entries(data)
    .filter(([key]) => !hiddenKeys.has(key))
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .slice(0, 10)
    .map(([key, value]) => ({
      key,
      label: labelMap.value[key] || key,
      value: localizeResultValue(key, value, data),
    }))
    .filter((item) => item.value)
})

const hasResultItems = computed(() => resultItems.value.length > 0 && props.result?.resultType !== 'passed')
</script>

<style scoped>
.completed-view {
  min-height: max(680px, calc(100vh - 190px));
  display: grid;
  place-items: center;
  padding: 28px 16px;
  background:
    radial-gradient(circle at 18% 18%, rgba(99, 102, 241, 0.16), transparent 24%),
    radial-gradient(circle at 82% 18%, rgba(245, 158, 11, 0.14), transparent 22%),
    linear-gradient(160deg, #101827, #182338 52%, #0d1422);
  border-radius: 18px;
}

.completed-card {
  width: min(720px, 100%);
  padding: clamp(24px, 4vw, 42px);
  border: 3px solid #e2bc7c;
  border-radius: 24px;
  background: #fffcf3;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.28);
  text-align: center;
  color: #27364b;
}

.status-mark {
  width: 76px;
  height: 76px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 2.2rem;
  box-shadow: 0 14px 28px rgba(22, 163, 74, 0.28);
}

.eyebrow {
  margin: 0 0 8px;
  color: #b45309;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #1e3a5f;
  font-family: Georgia, serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}

.lead {
  margin: 12px auto 20px;
  max-width: 520px;
  color: #526174;
  line-height: 1.65;
  font-weight: 700;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  margin: 0 auto 18px;
  max-width: 520px;
  border-radius: 14px;
  background: #f3ead8;
  color: #5b6472;
  font-weight: 800;
}

.result-panel,
.passed-panel {
  max-width: 560px;
  margin: 0 auto 24px;
  border-radius: 18px;
  background: #ffffff;
  border: 2px solid #ead6ae;
  box-shadow: 0 12px 26px rgba(30, 58, 95, 0.08);
}

.result-panel {
  padding: 18px;
  text-align: left;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: #2d5a6e;
  font-weight: 900;
}

.result-grid {
  display: grid;
  grid-template-columns: minmax(120px, 0.42fr) 1fr;
  gap: 10px 14px;
  margin: 0;
}

dt {
  color: #8a5f18;
  font-weight: 900;
}

dd {
  margin: 0;
  color: #324052;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.passed-panel {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  color: #166534;
  font-weight: 900;
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  min-height: 46px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 12px 24px rgba(217, 119, 6, 0.22);
}

.btn.secondary {
  background: #e8eef7;
  color: #284461;
}

@media (max-width: 620px) {
  .completed-view {
    min-height: max(620px, calc(100vh - 150px));
    padding: 16px 10px;
  }

  .meta-row,
  .result-grid {
    grid-template-columns: 1fr;
  }

  .meta-row {
    flex-direction: column;
    text-align: left;
  }

  .actions,
  .btn {
    width: 100%;
  }
}
</style>
