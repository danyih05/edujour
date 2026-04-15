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
            :class="{ selected: selectedChoice === choice.id }"
            @click="answerQuestion(choice.id)"
          >
            <span class="choice-badge">{{ choice.id }}</span>
            <span>{{ choice.text }}</span>
          </button>
        </div>
      </section>
    </div>

    <div v-if="showResult" class="result-overlay">
      <div class="tarot-card" :class="`tarot-${winner}`">
        <div class="tarot-title">{{ result.title }}</div>
        <div class="tarot-icon">{{ result.icon }}</div>
        <div class="tarot-desc" v-html="result.desc"></div>
        <div v-if="result.analysis" class="result-analysis" v-html="result.analysis"></div>
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

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const questionWeights = [
  {
    a: { hk: 2, sg: 2, us: 1, uk: 0, eu: 0 },
    b: { uk: 2, eu: 2, us: 1, hk: 0, sg: 0 },
  },
  {
    a: { hk: 2, sg: 1, eu: 1, uk: 0, us: 0 },
    b: { us: 2, uk: 1, eu: 1, hk: 0, sg: 0 },
  },
  {
    a: { hk: 2, sg: 2, uk: 0, us: 1, eu: 0 },
    b: { uk: 2, eu: 2, us: 0, hk: 0, sg: 0 },
  },
  {
    a: { sg: 2, hk: 1, eu: 1, uk: 0, us: 0 },
    b: { us: 2, uk: 1, eu: 1, hk: 0, sg: 0 },
  },
  {
    a: { hk: 2, sg: 2, us: 0, uk: 0, eu: 0 },
    b: { uk: 2, eu: 2, us: 0, hk: 0, sg: 0 },
  },
  {
    a: { sg: 2, hk: 1, eu: 1, uk: 0, us: 0 },
    b: { us: 2, uk: 1, eu: 1, hk: 0, sg: 0 },
  },
  {
    a: { hk: 2, sg: 1, us: 1, uk: 0, eu: 0 },
    b: { uk: 2, eu: 1, us: 0, hk: 0, sg: 0 },
  },
  {
    a: { uk: 2, eu: 2, hk: 0, sg: 0, us: 0 },
    b: { us: 2, sg: 2, hk: 0, uk: 0, eu: 0 },
  },
  {
    a: { hk: 2, sg: 2, uk: 0, us: 0, eu: 0 },
    b: { us: 2, eu: 2, hk: 0, sg: 0, uk: 0 },
  },
  {
    a: { uk: 2, eu: 2, sg: 0, hk: 0, us: 0 },
    b: { us: 2, hk: 2, sg: 0, uk: 0, eu: 0 },
  },
]

const localizedQuestions = tm('pages.y2_2.questions') || []
const questions = computed(() => {
  return localizedQuestions.map((item, index) => ({
    q: item.q,
    choices: [
      { id: 'a', text: item.choices[0], weights: questionWeights[index]?.a || {} },
      { id: 'b', text: item.choices[1], weights: questionWeights[index]?.b || {} },
    ],
  }))
})

const currentQ = ref(0)
const selectedChoice = ref(null)
const scores = reactive({ uk: 0, hk: 0, sg: 0, us: 0, eu: 0 })
const showResult = ref(false)
const winner = ref('uk')
const highlightedRoutes = ref([])

const question = computed(() => questions.value[currentQ.value] || null)
const routes = computed(() => [
  { id: 'uk', icon: '🏰', label: t('pages.y2_2.routes.uk'), keywords: [t('pages.y2_2.routeKeywords.uk.0'), t('pages.y2_2.routeKeywords.uk.1')] },
  { id: 'us', icon: '🗽', label: t('pages.y2_2.routes.us'), keywords: [t('pages.y2_2.routeKeywords.us.0'), t('pages.y2_2.routeKeywords.us.1')] },
  { id: 'eu', icon: '🏛️', label: t('pages.y2_2.routes.eu'), keywords: [t('pages.y2_2.routeKeywords.eu.0'), t('pages.y2_2.routeKeywords.eu.1')] },
  { id: 'sg', icon: '🌏', label: t('pages.y2_2.routes.sg'), keywords: [t('pages.y2_2.routeKeywords.sg.0'), t('pages.y2_2.routeKeywords.sg.1')] },
  { id: 'hk', icon: '🏙️', label: t('pages.y2_2.routes.hk'), keywords: [t('pages.y2_2.routeKeywords.hk.0'), t('pages.y2_2.routeKeywords.hk.1')] },
])

const guideItems = computed(() => tm('pages.y2_2.guide.items') || [])

const result = computed(() => {
  const localizedResult = tm(`pages.y2_2.results.${winner.value}`) || {}
  return {
    title: localizedResult.title || '',
    icon: localizedResult.icon || (winner.value === 'uk' ? '🏰' : winner.value === 'hk' ? '🏙️' : winner.value === 'us' ? '🗽' : winner.value === 'sg' ? '🌏' : '🏛️'),
    desc: localizedResult.desc || '',
    analysis: localizedResult.analysis || '',
  }
})

function portalClass(type) {
  const value = scores[type] || 0
  const strength = value ? Math.min(Math.floor(value / 2) + 1, 3) : 0
  return strength ? `active-${strength}` : ''
}

function answerQuestion(choiceId) {
  if (!question.value) return
  selectedChoice.value = choiceId
  const choice = question.value.choices.find((item) => item.id === choiceId)
  if (!choice) return

  Object.entries(choice.weights).forEach(([route, value]) => {
    scores[route] += value
  })

  // Highlight routes that gained points
  highlightedRoutes.value = Object.keys(choice.weights).filter(route => choice.weights[route] > 0)

  // Clear highlight after a short delay
  setTimeout(() => {
    highlightedRoutes.value = []
  }, 1000)

  currentQ.value += 1
  selectedChoice.value = null

  if (currentQ.value >= questions.value.length) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    winner.value = sorted[0]?.[0] || 'uk'
    showResult.value = true
    nextTick(() => {
      document.querySelector('.result-overlay')?.scrollIntoView({ behavior: 'smooth' })
    })
  }
}

function resetGame() {
  currentQ.value = 0
  selectedChoice.value = null
  scores.uk = 0
  scores.hk = 0
  scores.sg = 0
  scores.us = 0
  scores.eu = 0
  showResult.value = false
  winner.value = 'uk'
}

function completeWithReward() {
  emit('complete', { rewardCoins: 30 })
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

.crossroads-game {
  min-height: 100%;
  padding: 38px 20px 56px;
  color: #e0e6ed;
  background: radial-gradient(circle at center, #1a2a3a 0%, #0a0f14 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
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
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 18px;
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

@keyframes card-reveal {
  from { opacity: 0; transform: scale(0.86) rotateY(30deg); }
  to { opacity: 1; transform: scale(1) rotateY(0); }
}
</style>
