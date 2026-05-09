<template>
  <div class="crossroads-game">
    <div class="header">
      <h2><i class="fas fa-compass"></i> {{ t('pages.y2_2.title') }}</h2>
      <p>{{ t('pages.y2_2.subtitle') }}</p>
    </div>

    <KnowledgeGuidePanel
      :title="t('pages.y2_2.guide.button')"
      :body="t('pages.y2_2.guide.body')"
      :items="guideItems"
    />

    <div class="crossroads-layout">
      <aside class="region-column">
        <div class="region-header">
          <h3>{{ t('pages.y2_2.regionsTitle') }}</h3>
          <p>{{ t('pages.y2_2.regionsCopy') }}</p>
        </div>
        <div class="region-list">
          <div
            v-for="route in routes"
            :key="route.id"
            class="route-card"
            :class="[route.id, portalClass(route.id), { selected: highlightedRoutes.includes(route.id), winner: showResult && winner === route.id }]"
          >
            <div class="route-icon">{{ route.icon }}</div>
            <div class="route-label">{{ route.label }}</div>
            <div class="route-keywords">{{ route.keywords.join(' · ') }}</div>
          </div>
        </div>
      </aside>

      <section v-if="!showResult" class="question-panel">
        <div class="question-top">
          <span class="question-count">{{ t('pages.y2_2.questionCount', { current: currentQ + 1, total: questions.length }) }}</span>
          <div class="question-text">“{{ question.q }}”</div>
        </div>
        <div class="choices">
          <button
            v-for="choice in question.choices"
            :key="choice.id"
            type="button"
            class="btn-choice"
            :class="{
              answered: selectedChoice !== null,
              selected: selectedChoice === choice.id,
              unselected: selectedChoice !== null && selectedChoice !== choice.id,
              correct: choice.correct === true,
              wrong: selectedChoice === choice.id && choice.correct === false,
            }"
            @click="answerQuestion(choice.id)"
          >
            <span class="choice-badge">{{ choice.id }}</span>
            <span>{{ choice.text }}</span>
          </button>
        </div>
        <!-- 回溯导航按钮 -->
        <div v-if="questions.length > 0 && !showResult" class="nav-buttons">
          <button
            type="button"
            class="btn-nav"
            :disabled="currentQ === 0"
            @click="goToPrevQuestion"
          >
            ← {{ t('common.labels.previous') || '上一题' }}
          </button>
          <button
            type="button"
            class="btn-nav"
            :disabled="currentQ === questions.length - 1"
            @click="goToNextQuestion"
          >
            {{ t('common.labels.next') || '下一题' }} →
          </button>
        </div>
      </section>
    </div>

    <div v-if="showResult" class="result-overlay">
      <div class="tarot-card" :class="`tarot-${selectedResultKey}`">
        <div class="tarot-title">{{ result.title }}</div>
        <div class="tarot-icon">{{ result.icon }}</div>
        <div class="tarot-desc" v-html="result.desc"></div>
        <div v-if="result.analysis" class="result-analysis" v-html="result.analysis"></div>
        <div class="manual-region-panel">
          <div class="manual-region-title">{{ t('pages.y2_2.manualRegion.title') }}</div>
          <p>{{ t('pages.y2_2.manualRegion.copy') }}</p>
          <label class="manual-region-select-label" for="manual-region-select">
            {{ t('pages.y2_2.manualRegion.selectLabel') }}
          </label>
          <select
            id="manual-region-select"
            v-model="selectedResultKey"
            class="manual-region-select"
          >
            <option
              v-for="route in routes"
              :key="route.id"
              :value="route.id"
            >
              {{ routeRegionLabel(route) }}
            </option>
          </select>
        </div>
        <div class="reward-badge">
          🎉 +30 {{ t('common.labels.coins') }}
        </div>

        <div class="result-actions">
          <button type="button" class="btn-claim" @click="completeWithReward">
            ✅ {{ t('pages.y2_2.claim') }}
          </button>
          <button type="button" class="btn-retry" @click="resetGame">
            🔄 {{ t('pages.y2_2.retry') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'
import {
  getYear2CountrySchoolConfig,
  persistMatchedCountryKey,
} from '@/config/year2CountrySchools'

const emit = defineEmits(['complete', 'close'])
const { currentLanguage, t, tm, localize } = useAppI18n()

const RESULT_PRIORITY = ['uk', 'eu', 'us', 'sg', 'australia', 'hk', 'jointProgram', 'niche']
const RESULT_ICONS = {
  uk: '🏰',
  eu: '🏛️',
  us: '🗽',
  sg: '🌏',
  australia: '🦘',
  hk: '🏙️',
  jointProgram: '🏫',
  niche: '🧭',
}

const questionWeights = [
  {
    a: { uk: 2, eu: 0, us: 1, sg: 2, australia: 1, hk: 2, jointProgram: 0, niche: 1 },
    b: { uk: 0, eu: 2, us: 1, sg: 0, australia: 1, hk: 0, jointProgram: 2, niche: 1 },
  },
  {
    a: { uk: 1, eu: 0, us: 2, sg: 2, australia: 1, hk: 2, jointProgram: 0, niche: 1 },
    b: { uk: 1, eu: 2, us: 0, sg: 0, australia: 1, hk: 0, jointProgram: 2, niche: 2 },
  },
  {
    a: { uk: 2, eu: 0, us: 2, sg: 2, australia: 2, hk: 1, jointProgram: 1, niche: 0 },
    b: { uk: 0, eu: 2, us: 0, sg: 0, australia: 0, hk: 1, jointProgram: 1, niche: 2 },
  },
  {
    a: { uk: 2, eu: 0, us: 1, sg: 2, australia: 1, hk: 2, jointProgram: 1, niche: 1 },
    b: { uk: 0, eu: 2, us: 1, sg: 0, australia: 1, hk: 0, jointProgram: 1, niche: 2 },
  },
  {
    a: { uk: 1, eu: 1, us: 0, sg: 1, australia: 0, hk: 2, jointProgram: 2, niche: 2 },
    b: { uk: 1, eu: 1, us: 2, sg: 1, australia: 2, hk: 0, jointProgram: 0, niche: 0 },
  },
  {
    a: { uk: 0, eu: 1, us: 2, sg: 2, australia: 2, hk: 1, jointProgram: 0, niche: 0 },
    b: { uk: 2, eu: 1, us: 0, sg: 0, australia: 0, hk: 1, jointProgram: 2, niche: 2 },
  },
  {
    a: { uk: 1, eu: 0, us: 2, sg: 2, australia: 1, hk: 2, jointProgram: 0, niche: 1 },
    b: { uk: 1, eu: 2, us: 0, sg: 0, australia: 1, hk: 0, jointProgram: 2, niche: 2 },
  },
  {
    a: { uk: 2, eu: 1, us: 0, sg: 2, australia: 2, hk: 1, jointProgram: 2, niche: 1 },
    b: { uk: 0, eu: 1, us: 2, sg: 0, australia: 0, hk: 1, jointProgram: 0, niche: 2 },
  },
  {
    a: { uk: 2, eu: 0, us: 2, sg: 1, australia: 1, hk: 2, jointProgram: 2, niche: 1 },
    b: { uk: 0, eu: 2, us: 0, sg: 1, australia: 1, hk: 0, jointProgram: 0, niche: 2 },
  },
  {
    a: { uk: 0, eu: 0, us: 0, sg: 0, australia: 0, hk: 0, jointProgram: 2, niche: 0 },
    b: { uk: 1, eu: 1, us: 1, sg: 1, australia: 1, hk: 1, jointProgram: 0, niche: 1 },
  },
]

const localizedQuestions = computed(() => tm('pages.y2_2.questions') || [])

const questions = computed(() => {
  const list = localizedQuestions.value
  if (!list.length) return []
  return list.map((item, index) => ({
    q: item.q,
    choices: [
      { id: 'a', text: item.choices[0], weights: questionWeights[index]?.a || {} },
      { id: 'b', text: item.choices[1], weights: questionWeights[index]?.b || {} },
    ],
  }))
})

const currentQ = ref(0)
const selectedChoice = ref(null)
const showResult = ref(false)
const winner = ref('uk')
const selectedResultKey = ref('uk')
const highlightedRoutes = ref([])

// 记录每一次作答：{ questionIndex: number, choiceId: 'a'|'b' }
const answersHistory = ref([])

// 基于回答历史动态计算八个地区的当前得分
const scores = computed(() => {
  const totals = Object.fromEntries(RESULT_PRIORITY.map((key) => [key, 0]))
  answersHistory.value.forEach((h) => {
    const q = questions.value[h.questionIndex]
    if (!q) return
    const choice = q.choices.find((c) => c.id === h.choiceId)
    if (!choice) return
    Object.entries(choice.weights).forEach(([key, val]) => {
      totals[key] = (totals[key] || 0) + val
    })
  })
  return totals
})


const question = computed(() => questions.value[currentQ.value] || null)
const routes = computed(() => [
  { id: 'uk', icon: '🏰', label: t('pages.y2_2.routes.uk'), keywords: [t('pages.y2_2.routeKeywords.uk.0'), t('pages.y2_2.routeKeywords.uk.1')] },
  { id: 'eu', icon: '🏛️', label: t('pages.y2_2.routes.eu'), keywords: [t('pages.y2_2.routeKeywords.eu.0'), t('pages.y2_2.routeKeywords.eu.1')] },
  { id: 'us', icon: '🗽', label: t('pages.y2_2.routes.us'), keywords: [t('pages.y2_2.routeKeywords.us.0'), t('pages.y2_2.routeKeywords.us.1')] },
  { id: 'sg', icon: '🌏', label: t('pages.y2_2.routes.sg'), keywords: [t('pages.y2_2.routeKeywords.sg.0'), t('pages.y2_2.routeKeywords.sg.1')] },
  { id: 'australia', icon: '🦘', label: t('pages.y2_2.routes.australia'), keywords: [t('pages.y2_2.routeKeywords.australia.0'), t('pages.y2_2.routeKeywords.australia.1')] },
  { id: 'hk', icon: '🏙️', label: t('pages.y2_2.routes.hk'), keywords: [t('pages.y2_2.routeKeywords.hk.0'), t('pages.y2_2.routeKeywords.hk.1')] },
  { id: 'jointProgram', icon: '🏫', label: t('pages.y2_2.routes.jointProgram'), keywords: [t('pages.y2_2.routeKeywords.jointProgram.0'), t('pages.y2_2.routeKeywords.jointProgram.1')] },
  { id: 'niche', icon: '🧭', label: t('pages.y2_2.routes.niche'), keywords: [t('pages.y2_2.routeKeywords.niche.0'), t('pages.y2_2.routeKeywords.niche.1')] },
])
const guideItems = computed(() => tm('pages.y2_2.guide.items') || [])

const result = computed(() => {
  const resultKey = selectedResultKey.value || winner.value
  const localizedResult = tm(`pages.y2_2.results.${resultKey}`) || {}
  return {
    title: localizedResult.title || '',
    icon: localizedResult.icon || RESULT_ICONS[resultKey] || '🧭',
    desc: localizedResult.desc || '',
    analysis: localizedResult.analysis || '',
  }
})

const winnerCountryConfig = computed(() => getYear2CountrySchoolConfig(winner.value))
const selectedCountryConfig = computed(() => getYear2CountrySchoolConfig(selectedResultKey.value))

function portalClass(type) {
  const value = scores.value[type] || 0
  const strength = value ? Math.min(Math.floor(value / 2) + 1, 3) : 0
  return strength ? `active-${strength}` : ''
}

function pickWinner(scoreMap) {
  return RESULT_PRIORITY.reduce((bestKey, currentKey) => {
    if (!bestKey) return currentKey
    return (scoreMap[currentKey] || 0) > (scoreMap[bestKey] || 0) ? currentKey : bestKey
  }, '')
}

function answerQuestion(choiceId) {
  if (!question.value) return
  const qIndex = currentQ.value

  // 如果当前题目已经答过，则替换并删除之后的所有作答
  const existingIdx = answersHistory.value.findIndex((h) => h.questionIndex === qIndex)
  if (existingIdx >= 0) {
    answersHistory.value.splice(existingIdx, answersHistory.value.length - existingIdx, {
      questionIndex: qIndex,
      choiceId,
    })
  } else {
    answersHistory.value.push({ questionIndex: qIndex, choiceId })
  }

  selectedChoice.value = choiceId

  // 高亮刚刚获得分数的路线
  const choice = question.value.choices.find((c) => c.id === choiceId)
  highlightedRoutes.value = Object.keys(choice.weights).filter((r) => choice.weights[r] > 0)
  setTimeout(() => { highlightedRoutes.value = [] }, 1000)

  // 所有题目都已作答 → 显示结果
  if (answersHistory.value.length === questions.value.length) {
    const final = scores.value
    winner.value = pickWinner(final) || 'uk'
    selectedResultKey.value = winner.value
    showResult.value = true
    nextTick(() => {
      setTimeout(() => {
        const el = document.querySelector('.result-overlay')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })
    return
  }

  // 自动前进到下一题
  currentQ.value = qIndex + 1
  const next = answersHistory.value.find((h) => h.questionIndex === currentQ.value)
  selectedChoice.value = next ? next.choiceId : null
}

function goToPrevQuestion() {
  if (currentQ.value <= 0) return
  currentQ.value--
  const prev = answersHistory.value.find((h) => h.questionIndex === currentQ.value)
  selectedChoice.value = prev ? prev.choiceId : null
}

function goToNextQuestion() {
  if (currentQ.value >= questions.value.length - 1) return
  currentQ.value++
  const next = answersHistory.value.find((h) => h.questionIndex === currentQ.value)
  selectedChoice.value = next ? next.choiceId : null
}

function resetGame() {
  currentQ.value = 0
  selectedChoice.value = null
  answersHistory.value = []
  showResult.value = false
  winner.value = 'uk'
  selectedResultKey.value = 'uk'
}

function routeRegionLabel(route) {
  const label = String(route?.label || '')
  return label.match(/[（(]([^）)]+)[）)]/)?.[1] || label
}

function completeWithReward() {
  const matchedCountryKey = selectedCountryConfig.value.key || winnerCountryConfig.value.key
  persistMatchedCountryKey(matchedCountryKey)
  const countryScores = { ...scores.value }

  emit('complete', {
    rewardCoins: 30,
    resultType: 'result',
    resultData: {
      recommendedCountry: result.value.title,
      recommendedCountryKey: matchedCountryKey,
      matchedCountry: selectedCountryConfig.value.canonicalName || winnerCountryConfig.value.canonicalName,
      matchedCountryZh: selectedCountryConfig.value.label?.zh || winnerCountryConfig.value.label?.zh,
      matchedCountryEn: selectedCountryConfig.value.label?.en || winnerCountryConfig.value.label?.en,
      winner: matchedCountryKey,
      scores: countryScores,
      countryScores,
      answers: answersHistory.value.map((answer) => ({ ...answer })),
      explanation: result.value.analysis || result.value.desc,
    },
    language: currentLanguage.value,
    profile: {
      matchedCountryKey,
      matchedCountry: selectedCountryConfig.value.canonicalName || winnerCountryConfig.value.canonicalName,
      matchedCountryZh: selectedCountryConfig.value.label?.zh || winnerCountryConfig.value.label?.zh,
      matchedCountryEn: selectedCountryConfig.value.label?.en || winnerCountryConfig.value.label?.en,
      countryScores,
    },
  })
}
</script>

<style scoped>
.reward-badge {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
  margin: 16px 0 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.btn-retry {
  width: 100%;
  padding: 14px 20px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s;
  text-align: center;
}

.btn-retry:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.btn-claim {
  width: 100%;
  padding: 14px 20px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #000;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s;
  text-align: center;
}

.btn-claim:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* ---- 回溯导航按钮 ---- */
.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.btn-nav {
  padding: 8px 18px;
  border: 2px solid rgba(249, 217, 118, 0.55);
  border-radius: 999px;
  background: rgba(11, 19, 26, 0.7);
  color: #f9d976;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: 0.25s ease;
  backdrop-filter: blur(4px);
}

.btn-nav:hover:not(:disabled) {
  background: rgba(249, 217, 118, 0.15);
  border-color: #f9d976;
  transform: translateY(-1px);
  box-shadow: 0 0 14px rgba(249, 217, 118, 0.25);
}

.btn-nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.15);
  color: #8a99b0;
}

.crossroads-game {
  min-height: 100%;
  padding: 38px 20px 56px;
  color: #e0e6ed;
  background: radial-gradient(circle at center, #1a2a3a 0%, #0a0f14 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  will-change: transform;
  transform: translateZ(0);
}

.header {
  text-align: center;
  margin-bottom: 28px;
}

.header h2 {
  margin: 0;
  font-size: 2.1rem;
  color: #f9d976;
  text-shadow: 0 0 15px rgba(249, 217, 118, 0.45);
  font-family: Georgia, serif;
}

.header p {
  color: #9aa8bd;
  line-height: 1.55;
}

.portals {
  width: min(760px, 100%);
  display: flex;
  justify-content: space-around;
  gap: 24px;
  flex-wrap: wrap;
}

.portal {
  width: min(220px, 42vw);
  aspect-ratio: 0.63;
  min-width: 170px;
  border-radius: 110px 110px 0 0;
  background: #0b131a;
  border: 4px solid #2c3e50;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.62;
  filter: grayscale(0.8);
  transition: 0.45s ease;
}

.portal-icon {
  font-size: 4rem;
  opacity: 0.58;
  transition: 0.45s ease;
}

.portal-name {
  margin-top: 18px;
  text-align: center;
  line-height: 1.4;
  font-weight: 900;
  opacity: 0.65;
}

.portal-keywords {
  margin-top: 10px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.68);
  letter-spacing: 0.01em;
}

.portal-uk .portal-name { color: #82b1ff; }
.portal-us .portal-name { color: #7ed0ff; }
.portal-eu .portal-name { color: #c6e6ff; }
.portal-sg .portal-name { color: #99ffcc; }
.portal-hk .portal-name { color: #ffd700; }

.crossroads-layout {
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(420px, 1.2fr);
  gap: 24px;
  margin: 18px 0 26px;
  align-items: start;
}

.region-column {
  background: rgba(11, 19, 26, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

.region-header {
  margin-bottom: 18px;
}

.region-header h3 {
  margin: 0 0 8px;
  color: #f9d976;
  font-size: 1.1rem;
}

.region-header p {
  margin: 0;
  color: #9aa8bd;
  line-height: 1.6;
  font-size: 0.95rem;
}

.region-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.region-list::-webkit-scrollbar {
  width: 8px;
}

.region-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}

.route-card {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  gap: 6px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  min-height: 110px;
  min-height: auto; 
}

.route-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 217, 118, 0.35);
}

.route-card.selected,
.route-card.winner {
  background: rgba(249, 217, 118, 0.14);
  border-color: rgba(249, 217, 118, 0.35);
  box-shadow: 0 12px 24px rgba(249, 217, 118, 0.12);
}

.route-icon {
  font-size: 2rem;
}

.route-label {
  font-size: 1rem;
  font-weight: 900;
  color: #eef5ff;
}

.route-keywords {
  color: #cbd5e1;
  font-size: 0.88rem;
  line-height: 1.4;
}

.question-panel {
  width: min(760px, 100%);
  background: rgba(14, 28, 42, 0.92);
  overflow-y: auto;
  max-height: calc(100vh - 220px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
  padding: 28px;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(3, 13, 27, 0.45);
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  /* 移除 backdrop-filter，用更轻量的背景色替代 */
  backdrop-filter: none;
}

.question-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.question-count {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #d6e8ff;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.question-text {
  flex: 1 1 100%;
  font-size: 1.05rem;
  line-height: 1.65;
  color: #eef5ff;
  font-weight: 700;
}

.choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.btn-choice {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: flex-start;
  padding: 18px 20px;
  min-height: 110px;
  border: 2px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  color: #eef5ff;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.btn-choice:hover,
.btn-choice.selected {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
}

.choice-badge {
  min-width: 42px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 900;
}

@media (max-width: 860px) {
  .choices {
    grid-template-columns: 1fr;
  }
}

.portal.active-1,
.portal.active-2,
.portal.active-3 {
  opacity: 1;
  filter: grayscale(0);
}

.portal-uk.active-1,
.portal-uk.active-2,
.portal-uk.active-3 {
  border-color: #82b1ff;
  background: radial-gradient(circle at bottom, #1a3673, #0b131a);
  box-shadow: 0 0 55px rgba(65, 105, 225, 0.62), inset 0 0 45px rgba(65, 105, 225, 0.45);
}

.portal-hk.active-1,
.portal-hk.active-2,
.portal-hk.active-3 {
  border-color: #ffe066;
  background: radial-gradient(circle at bottom, #5c4716, #0b131a);
  box-shadow: 0 0 55px rgba(218, 165, 32, 0.62), inset 0 0 45px rgba(218, 165, 32, 0.45);
}

.portal.highlighted {
  opacity: 1;
  filter: none;
  border-color: #f9d976;
  box-shadow: 0 0 20px rgba(249, 217, 118, 0.5);
  animation: highlightPulse 1s ease-out;
}

@keyframes highlightPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.scroll-board {
  width: min(570px, 100%);
  margin-top: 38px;
  padding: 34px;
  border: 3px solid #c8a165;
  border-radius: 12px;
  background: linear-gradient(135deg, #fdf5e6, #f3e5ab);
  color: #3e2723;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);
  text-align: center;
}

.owl-guide { font-size: 3.3rem; }
.question-text {
  margin: 10px 0 24px;
  font-size: 1.12rem;
  line-height: 1.5;
  font-family: Georgia, serif;
  font-weight: 900;
}

.choices {
  display: grid;
  gap: 14px;
}

.btn-choice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 15px 18px;
  border: 2px solid #c8a165;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.64);
  color: #5d4037;
  font-weight: 900;
  text-align: left;
  line-height: 1.42;
  cursor: pointer;
}

.btn-choice:hover {
  background: #fff;
  transform: scale(1.015);
}

.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 18px;
  backdrop-filter: none;
  background: rgba(0, 0, 0, 0.85);
  will-change: opacity;
}

.tarot-card {
  width: min(380px, 94vw);
  min-height: 520px;
  padding: 38px 25px;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: card-reveal 0.45s ease;
}

.tarot-uk { background: linear-gradient(135deg, #1a3673, #0b131a); border: 4px solid #82b1ff; color: #e0ebff; }
.tarot-hk { background: linear-gradient(135deg, #5c4716, #0b131a); border: 4px solid #ffe066; color: #fff3cc; }
.tarot-us { background: linear-gradient(135deg, #12395f, #0b131a); border: 4px solid #7ed0ff; color: #e0f5ff; }
.tarot-australia { background: linear-gradient(135deg, #22543d, #0b131a); border: 4px solid #86efac; color: #dcfce7; }
.tarot-eu { background: linear-gradient(135deg, #334155, #0b131a); border: 4px solid #c6e6ff; color: #eef6ff; }
.tarot-sg { background: linear-gradient(135deg, #064e3b, #0b131a); border: 4px solid #99ffcc; color: #dcfce7; }
.tarot-jointProgram { background: linear-gradient(135deg, #4b5563, #0b131a); border: 4px solid #fcd34d; color: #fff7d6; }
.tarot-niche { background: linear-gradient(135deg, #4c1d95, #0b131a); border: 4px solid #c4b5fd; color: #f5f3ff; }

.tarot-title {
  width: 100%;
  padding-bottom: 12px;
  border-bottom: 2px dashed currentColor;
  font-size: 1.35rem;
  font-weight: 900;
  font-family: Georgia, serif;
}

.tarot-icon { margin: 24px 0; font-size: 5rem; }
.tarot-desc {
  padding: 20px;
  background: rgba(0, 0, 0, 0.28);
  border-radius: 10px;
  text-align: left;
  line-height: 1.6;
  font-family: Georgia, serif;
}

.result-analysis {
  margin-top: 16px;
  padding: 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #f8f3dc;
  font-size: 0.95rem;
  line-height: 1.7;
}

.manual-region-panel {
  width: 100%;
  margin-top: 16px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  text-align: left;
}

.manual-region-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
}

.manual-region-panel p {
  margin: 6px 0 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.86rem;
  line-height: 1.45;
}

.manual-region-select-label {
  display: block;
  margin-bottom: 7px;
  color: #f9d976;
  font-size: 0.78rem;
  font-weight: 900;
}

.manual-region-select {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(249, 217, 118, 0.46);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.34);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.manual-region-select:focus {
  outline: 3px solid rgba(249, 217, 118, 0.18);
  border-color: #f9d976;
}

.manual-region-select option {
  background: #111827;
  color: #fff;
}

.btn-claim {
  margin-top: 28px;
  padding: 12px 34px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #000;
  font-weight: 900;
  cursor: pointer;
}
@media (max-width: 768px) {
  .crossroads-game {
    padding: 16px 12px 32px;
  }

  .header {
    margin-bottom: 12px;
  }
  .header h2 {
    font-size: 1.3rem;
  }
  .header p {
    font-size: 0.82rem;
    margin-top: 4px;
  }

  .crossroads-layout {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* 左侧地区列表压缩 */
  .region-column {
    padding: 12px;
    min-height: auto;
  }
  .region-header h3 {
    font-size: 0.9rem;
  }
  .region-header p {
    font-size: 0.78rem;
    display: none;  /* 介绍文字暂时隐藏 */
  }
  .region-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .route-card {
    padding: 8px;
    min-height: auto;
    gap: 2px;
  }
  .route-icon { font-size: 1.5rem; }
  .route-label { font-size: 0.75rem; }
  .route-keywords { font-size: 0.65rem; }

  /* 右侧问答区放大 */
  .question-panel {
    padding: 14px;
    max-height: none;
  }
  .question-count {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  .question-text {
    font-size: 0.92rem;
  }
  .choices {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .btn-choice {
    padding: 12px 14px;
    min-height: 60px;
  }
  .nav-buttons {
    gap: 8px;
    margin-top: 12px;
  }
  .btn-nav {
    padding: 10px 14px;
    font-size: 0.82rem;
    min-height: 44px;
  }

  /* 结果卡片适配 */
  .result-overlay {
    padding: 10px;
  }
  .tarot-card {
    width: 100%;
    padding: 20px 14px;
    min-height: auto;
  }
  .tarot-title {
    font-size: 1.1rem;
  }
  .tarot-icon {
    font-size: 3rem;
    margin: 12px 0;
  }
  .manual-region-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
@keyframes card-reveal {
  from { opacity: 0; transform: scale(0.86) rotateY(30deg); }
  to { opacity: 1; transform: scale(1) rotateY(0); }
}

/* Year 2 第二关选项状态：放在末尾覆盖前面重复的 .btn-choice 定义 */
.question-panel .btn-choice {
  border-color: rgba(249, 217, 118, 0.28);
  background: rgba(11, 19, 26, 0.88);
  color: #f4f7fb;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.question-panel .btn-choice .choice-badge {
  background: rgba(249, 217, 118, 0.18);
  border: 1px solid rgba(249, 217, 118, 0.55);
  color: #ffe8a3;
}

.question-panel .btn-choice:hover:not(:disabled) {
  background: rgba(249, 217, 118, 0.16);
  border-color: rgba(249, 217, 118, 0.72);
  color: #fff8df;
  transform: translateY(-1px);
}

.question-panel .btn-choice:hover:not(:disabled) .choice-badge {
  background: rgba(249, 217, 118, 0.28);
  border-color: #f9d976;
  color: #fff6d6;
}

.question-panel .btn-choice.answered:not(.selected):not(.correct):not(.wrong),
.question-panel .btn-choice.unselected:not(.correct):not(.wrong) {
  background: rgba(11, 19, 26, 0.92);
  border-color: rgba(255, 255, 255, 0.2);
  color: #e7edf6;
}

.question-panel .btn-choice.answered:not(.selected):not(.correct):not(.wrong) .choice-badge,
.question-panel .btn-choice.unselected:not(.correct):not(.wrong) .choice-badge {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(231, 237, 246, 0.42);
  color: #f4f7fb;
}

.question-panel .btn-choice.selected:not(.correct):not(.wrong) {
  background: linear-gradient(135deg, #fff3c4, #f4d47b);
  border-color: #d6a72f;
  color: #1f2933;
  box-shadow: 0 10px 24px rgba(249, 217, 118, 0.24), inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.question-panel .btn-choice.selected:not(.correct):not(.wrong) .choice-badge {
  background: #7c4a03;
  border-color: #4f2f02;
  color: #fff6d6;
}

.question-panel .btn-choice.correct {
  background: linear-gradient(135deg, #15803d, #16a34a);
  border-color: #86efac;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.24);
}

.question-panel .btn-choice.correct .choice-badge {
  background: #ffffff;
  border-color: #dcfce7;
  color: #166534;
}

.question-panel .btn-choice.wrong {
  background: linear-gradient(135deg, #b91c1c, #dc2626);
  border-color: #fecaca;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(239, 68, 68, 0.24);
}

.question-panel .btn-choice.wrong .choice-badge {
  background: #ffffff;
  border-color: #fee2e2;
  color: #991b1b;
}

.question-panel .btn-choice:disabled {
  cursor: not-allowed;
  opacity: 0.82;
}

.question-panel .btn-choice:disabled:hover {
  transform: none;
}
</style>
