<template>
  <div class="tier-game">
    <section class="balance-room">
      <div class="header">
        <h2><i class="fas fa-balance-scale-right"></i> {{ t('pages.y2_3.title') }}</h2>
        <p>{{ t('pages.y2_3.subtitle', { country: matchedCountryLabel }) }}</p>
        <div class="user-profile">
          <i class="fas fa-user-graduate"></i> {{ t('pages.y2_3.currentAvatar') }}
        </div>
        <div class="matched-route">
          <span class="matched-route-icon">{{ countryConfig.icon }}</span>
          <span>{{ t('pages.y2_3.matchedRoute', { country: matchedCountryLabel }) }}</span>
        </div>
        <p v-if="usingFallbackCountry" class="fallback-copy">{{ t('pages.y2_3.fallbackCopy') }}</p>

        <section class="region-selector" aria-label="Region selector">
          <div class="region-selector-head">
            <div>
              <strong>{{ t('pages.y2_3.regionSelector.title') }}</strong>
              <p>{{ t('pages.y2_3.regionSelector.copy') }}</p>
            </div>
          </div>
          <div class="region-options">
            <button
              v-for="option in countryOptions"
              :key="option.key"
              type="button"
              class="region-option"
              :class="{ active: selectedCountryKey === option.key }"
              @click="selectCountry(option.key)"
            >
              <span>{{ option.icon }}</span>
              <strong>{{ localize(option.label) }}</strong>
            </button>
          </div>
          <div class="region-school-preview">
            <span class="preview-label">{{ t('pages.y2_3.regionSelector.preview') }}</span>
            <span
              v-for="school in schoolCards"
              :key="school.id"
              class="preview-school"
            >
              {{ school.name }}
            </span>
          </div>
        </section>

        <section class="school-search-panel" aria-label="School search">
          <div class="school-search-head">
            <div>
              <strong>{{ t('pages.y2_3.schoolSearch.title') }}</strong>
              <p>{{ t('pages.y2_3.schoolSearch.copy') }}</p>
            </div>
          </div>
          <div class="school-search-controls">
            <input
              v-model.trim="schoolSearchQuery"
              class="school-search-input"
              type="search"
              :placeholder="t('pages.y2_3.schoolSearch.placeholder')"
            >
            <select v-model="selectedSchoolCaseId" class="school-search-select">
              <option value="">{{ t('pages.y2_3.schoolSearch.emptyOption') }}</option>
              <option
                v-for="school in filteredSchoolCases"
                :key="school.id"
                :value="school.id"
              >
                {{ school.name }} · {{ school.countryLabelText }}
              </option>
            </select>
          </div>
          <div v-if="selectedSchoolCase" class="school-case-card">
            <div class="school-case-main">
              <span class="school-case-icon">{{ selectedSchoolCase.icon }}</span>
              <div>
                <strong>{{ selectedSchoolCase.name }}</strong>
                <p>{{ selectedSchoolCase.caseInfo }}</p>
              </div>
            </div>
            <button
              type="button"
              class="btn-add-school"
              :disabled="isSelectedCaseInDeck"
              @click="addSelectedSchoolCase"
            >
              {{ isSelectedCaseInDeck ? t('pages.y2_3.schoolSearch.added') : t('pages.y2_3.schoolSearch.add') }}
            </button>
          </div>
        </section>
      </div>

      <KnowledgeGuidePanel
        :title="t('pages.y2_3.guide.button')"
        :body="t('pages.y2_3.guide.body')"
        :items="guideItems"
      />

      <div class="card-deck" :class="{ selecting: selectedCardId }" @dragover.prevent @drop="dropOn('deck')">
        <SchoolCard
          v-for="card in cardsIn('deck')"
          :key="card.id"
          :card="card"
          :selected="selectedCardId === card.id"
          draggable="true"
          @click="selectCard(card.id)"
          @dragstart="startDrag($event, card.id)"
          @dragend="draggingCardId = null"
        />
      </div>

      <div class="tiers">
        <section
          v-for="tier in tiers"
          :key="tier.id"
          class="tier-zone"
          :class="[tier.id, { active: selectedCardId }]"
          @click="placeSelected(tier.id)"
          @dragover.prevent
          @drop="dropOn(tier.id)"
        >
          <div class="tier-header"><i class="fas" :class="tier.icon"></i> {{ tier.label }}</div>
          <SchoolCard
            v-for="card in cardsIn(tier.id)"
            :key="card.id"
            :card="card"
            :selected="selectedCardId === card.id"
            compact
            draggable="true"
            @click.stop="selectCard(card.id)"
            @dragstart="startDrag($event, card.id)"
            @dragend="draggingCardId = null"
          />
        </section>
      </div>

      <div class="controls">
        <button type="button" class="btn-predict" @click="evaluateTiers">
          <i class="fas fa-crystal-ball"></i> {{ t('pages.y2_3.predict') }}
        </button>
      </div>

      <section v-if="feedback.length" class="feedback-panel">
        <div class="fb-title">
          <span><i class="fas fa-scroll"></i> {{ t('pages.y2_3.feedbackTitle') }}</span>
          <span class="fb-score">+{{ score }} <i class="fas fa-coins"></i></span>
        </div>

        <div v-for="item in feedback" :key="item.key || item.title" class="fb-item" :class="item.status">
          <div class="fb-icon"><i class="fas" :class="item.icon"></i></div>
          <div class="fb-text">
            <h4>{{ item.title }}</h4>
            <p>{{ item.text }}</p>
          </div>
        </div>

        <button type="button" class="btn-complete" @click="completeWithResult">{{ t('pages.y2_3.seal') }}</button>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, reactive, ref, watch } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'
import { useGameStore } from '@/stores/game'
import {
  getPersistedMatchedCountryKey,
  getTierBuckets,
  getYear2SchoolCases,
  getYear2CountrySchoolConfig,
  getYear2CountrySchoolOptions,
  persistMatchedCountryKey,
  resolveMatchedCountryKey,
} from '@/config/year2CountrySchools'

const emit = defineEmits(['complete', 'close'])
const { currentLanguage, t, localize } = useAppI18n()
const store = useGameStore()
const TIER_ORDER = ['reach', 'match', 'safety']

const SchoolCard = defineComponent({
  props: {
    card: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
  },
  emits: ['click', 'dragstart', 'dragend'],
  setup(props, { emit }) {
    return () => h('article', {
      class: ['school-card', { selected: props.selected, compact: props.compact }],
      draggable: true,
      onClick: () => emit('click'),
      onDragstart: (event) => emit('dragstart', event),
      onDragend: () => emit('dragend'),
    }, [
      h('div', { class: 'school-icon' }, props.card.icon),
      h('div', { class: 'school-name' }, props.card.name),
      h('div', { class: 'school-tag' }, props.card.tag),
    ])
  },
})

const tiers = computed(() => ([
  { id: 'reach', label: t('pages.y2_3.tiers.reach'), icon: 'fa-fire' },
  { id: 'match', label: t('pages.y2_3.tiers.match'), icon: 'fa-bullseye' },
  { id: 'safety', label: t('pages.y2_3.tiers.safety'), icon: 'fa-shield-alt' },
]))

const persistedCountryKey = ref(getPersistedMatchedCountryKey())
const profileMatchedCountryKey = computed(() => resolveMatchedCountryKey(store.travelerProfile))
const countryOptions = getYear2CountrySchoolOptions()
const selectedCountryKey = ref(persistedCountryKey.value || profileMatchedCountryKey.value || 'global')
const usingFallbackCountry = computed(() => selectedCountryKey.value === 'global')
const countryConfig = computed(() => getYear2CountrySchoolConfig(selectedCountryKey.value || 'global'))
const matchedCountryLabel = computed(() => localize(countryConfig.value.label))
const baseSchoolCards = computed(() => countryConfig.value.schools.map((school) => ({
  ...school,
  name: localize(school.name),
  tag: localize(school.tag),
})))
const addedSchoolIds = ref([])
const schoolCases = computed(() => getYear2SchoolCases().map((school) => ({
  ...school,
  name: localize(school.name),
  tag: localize(school.tag),
  countryLabelText: localize(school.countryLabel || getYear2CountrySchoolConfig(school.countryKey).label),
  caseInfo: localize(school.caseInfo),
})).filter((school) => school.countryKey === selectedCountryKey.value))
const addedSchoolCards = computed(() => addedSchoolIds.value
  .map((id) => schoolCases.value.find((school) => school.id === id))
  .filter(Boolean))
const schoolCards = computed(() => {
  const baseIds = new Set(baseSchoolCards.value.map((school) => school.id))
  return [
    ...baseSchoolCards.value,
    ...addedSchoolCards.value.filter((school) => !baseIds.has(school.id)),
  ]
})
const schoolSearchQuery = ref('')
const selectedSchoolCaseId = ref('')
const filteredSchoolCases = computed(() => {
  const query = schoolSearchQuery.value.trim().toLowerCase()
  const list = schoolCases.value
  if (!query) return list
  return list.filter((school) => (
    school.name.toLowerCase().includes(query) ||
    school.countryLabelText.toLowerCase().includes(query) ||
    school.tag.toLowerCase().includes(query)
  ))
})
const selectedSchoolCase = computed(() => (
  schoolCases.value.find((school) => school.id === selectedSchoolCaseId.value) ||
  (schoolSearchQuery.value ? filteredSchoolCases.value[0] : null)
))
const isSelectedCaseInDeck = computed(() => (
  Boolean(selectedSchoolCase.value && schoolCards.value.some((school) => school.id === selectedSchoolCase.value.id))
))

const locations = reactive({})
const selectedCardId = ref('')
const draggingCardId = ref('')
const feedback = ref([])
const score = ref(50)

watch(profileMatchedCountryKey, (nextKey) => {
  if (!nextKey) return
  if (!persistedCountryKey.value || selectedCountryKey.value === 'global') {
    selectedCountryKey.value = nextKey
    addedSchoolIds.value = []
    selectedSchoolCaseId.value = ''
    schoolSearchQuery.value = ''
  }
  persistMatchedCountryKey(nextKey)
}, { immediate: true })

watch(() => schoolCards.value.map((card) => card.id).join('|'), () => {
  Object.keys(locations).forEach((key) => {
    delete locations[key]
  })
  schoolCards.value.forEach((card) => {
    locations[card.id] = 'deck'
  })
  selectedCardId.value = ''
  draggingCardId.value = ''
  feedback.value = []
  score.value = 50
}, { immediate: true })

const guideItems = computed(() => {
  const tierBuckets = getTierBuckets(schoolCards.value)
  const joinNames = (items) => items.map((item) => item.name).join(' / ')
  const reachExamples = joinNames(tierBuckets.reach)
  const matchExamples = joinNames(tierBuckets.match)
  const safetyExamples = joinNames(tierBuckets.safety)
  const topSchool = tierBuckets.reach[0]?.name || ''
  const safeSchool = tierBuckets.safety[0]?.name || ''

  return [
    {
      title: t('pages.y2_3.guide.items.reach.title'),
      text: t('pages.y2_3.guide.items.reach.text'),
    },
    {
      title: t('pages.y2_3.guide.items.match.title'),
      text: t('pages.y2_3.guide.items.match.text'),
    },
    {
      title: t('pages.y2_3.guide.items.safety.title'),
      text: t('pages.y2_3.guide.items.safety.text'),
    },
    {
      title: t('pages.y2_3.guide.items.reference.title', { country: matchedCountryLabel.value }),
      text: t('pages.y2_3.guide.items.reference.text', {
        country: matchedCountryLabel.value,
        reachSchools: reachExamples,
        matchSchools: matchExamples,
        safetySchools: safetyExamples,
      }),
    },
    {
      title: t('pages.y2_3.guide.items.warning.title'),
      text: t('pages.y2_3.guide.items.warning.text', {
        topSchool,
        safeSchool,
      }),
    },
  ]
})

function cardsIn(location) {
  return schoolCards.value.filter((card) => locations[card.id] === location)
}

function selectCountry(countryKey) {
  selectedCountryKey.value = countryKey
  persistedCountryKey.value = countryKey
  persistMatchedCountryKey(countryKey)
  addedSchoolIds.value = []
  selectedSchoolCaseId.value = ''
  schoolSearchQuery.value = ''
}

function addSelectedSchoolCase() {
  const school = selectedSchoolCase.value
  if (!school || isSelectedCaseInDeck.value) return
  addedSchoolIds.value = [...addedSchoolIds.value, school.id]
}

function selectCard(cardId) {
  selectedCardId.value = selectedCardId.value === cardId ? '' : cardId
}

function moveCard(cardId, location) {
  if (!cardId) return
  locations[cardId] = location
  selectedCardId.value = ''
  feedback.value = []
}

function placeSelected(location) {
  moveCard(selectedCardId.value, location)
}

function startDrag(event, cardId) {
  draggingCardId.value = cardId
  selectedCardId.value = cardId
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', cardId)
}

function dropOn(location) {
  moveCard(draggingCardId.value || selectedCardId.value, location)
  draggingCardId.value = null
}

function idsIn(location) {
  return Object.keys(locations).filter((id) => locations[id] === location)
}

function tierLabel(tierId) {
  return tiers.value.find((tier) => tier.id === tierId)?.label || tierId
}

function tierIndex(tierId) {
  return TIER_ORDER.indexOf(tierId)
}

function addFeedback(key, status, icon, title, text) {
  feedback.value.push({ key, status, icon, title, text })
}

function evaluateTiers() {
  if (cardsIn('deck').length) {
    window.alert(t('pages.y2_3.alertCompleteDeck'))
    return
  }

  feedback.value = []
  score.value = 50
  const tierBuckets = {
    reach: idsIn('reach'),
    match: idsIn('match'),
    safety: idsIn('safety'),
  }
  const exactMatches = {
    reach: [],
    match: [],
    safety: [],
  }

  schoolCards.value.forEach((card) => {
    const currentTier = TIER_ORDER.find((tier) => tierBuckets[tier].includes(card.id)) || 'deck'
    const targetTier = card.recommendedTier

    if (currentTier === targetTier) {
      exactMatches[targetTier].push(card)
      return
    }

    const placedTooSafe = tierIndex(currentTier) > tierIndex(targetTier)
    if (placedTooSafe) {
      addFeedback(
        `${card.id}-too-safe`,
        'danger',
        targetTier === 'reach' ? 'fa-skull-crossbones' : 'fa-exclamation-triangle',
        t('pages.y2_3.feedback.tooSafe.title', { school: card.name }),
        t('pages.y2_3.feedback.tooSafe.text', {
          school: card.name,
          country: matchedCountryLabel.value,
          targetTier: tierLabel(targetTier),
          currentTier: tierLabel(currentTier),
        }),
      )
    } else {
      addFeedback(
        `${card.id}-too-high`,
        targetTier === 'safety' ? 'waste' : 'danger',
        targetTier === 'safety' ? 'fa-arrow-down' : 'fa-exclamation-triangle',
        t('pages.y2_3.feedback.tooHigh.title', { school: card.name }),
        t('pages.y2_3.feedback.tooHigh.text', {
          school: card.name,
          country: matchedCountryLabel.value,
          targetTier: tierLabel(targetTier),
          currentTier: tierLabel(currentTier),
        }),
      )
    }

    score.value -= 10
  })

  if (!feedback.value.length) {
    if (exactMatches.reach[0]) {
      addFeedback(
        `${exactMatches.reach[0].id}-perfect-reach`,
        'perfect',
        'fa-check-circle',
        t('pages.y2_3.feedback.correctReach.title', { school: exactMatches.reach[0].name }),
        t('pages.y2_3.feedback.correctReach.text', {
          school: exactMatches.reach[0].name,
          country: matchedCountryLabel.value,
          tier: tierLabel('reach'),
        }),
      )
    }

    if (exactMatches.match[0]) {
      addFeedback(
        `${exactMatches.match[0].id}-perfect-match`,
        'perfect',
        'fa-bullseye',
        t('pages.y2_3.feedback.correctMatch.title', { school: exactMatches.match[0].name }),
        t('pages.y2_3.feedback.correctMatch.text', {
          school: exactMatches.match[0].name,
          country: matchedCountryLabel.value,
          tier: tierLabel('match'),
        }),
      )
    }

    if (exactMatches.safety[0]) {
      addFeedback(
        `${exactMatches.safety[0].id}-perfect-safety`,
        'perfect',
        'fa-shield-alt',
        t('pages.y2_3.feedback.correctSafety.title', { school: exactMatches.safety[0].name }),
        t('pages.y2_3.feedback.correctSafety.text', {
          school: exactMatches.safety[0].name,
          country: matchedCountryLabel.value,
          tier: tierLabel('safety'),
        }),
      )
    }
  }

  if (!feedback.value.length) {
    addFeedback(
      'fallback',
      'waste',
      'fa-question-circle',
      t('pages.y2_3.feedback.fallback.title'),
      t('pages.y2_3.feedback.fallback.text', { country: matchedCountryLabel.value }),
    )
  }

  score.value = Math.max(10, score.value)

  nextTick(() => {
    const feedbackPanel = document.querySelector('.feedback-panel')
    if (feedbackPanel) {
      feedbackPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function completeWithResult() {
  const tierBuckets = {
    reach: cardsIn('reach').map((card) => card.name),
    match: cardsIn('match').map((card) => card.name),
    safety: cardsIn('safety').map((card) => card.name),
  }

  emit('complete', {
    completed: true,
    passed: true,
    resultType: 'summary',
    resultData: {
      matchedCountry: matchedCountryLabel.value,
      tierBuckets,
      score: score.value,
      feedback: feedback.value.map((item) => ({
        status: item.status,
        title: item.title,
        text: item.text,
      })),
    },
    language: currentLanguage.value,
  })
}
</script>

<style scoped>
.tier-game {
  min-height: 100%;
  padding: 24px;
  color: #e2e8f0;
  background: radial-gradient(circle at top, #1c2331 0%, #0b0f19 100%);
  display: grid;
  place-items: start center;
  overflow: auto;
}

.balance-room {
  width: min(1050px, 100%);
  padding: 30px;
  background: rgba(15, 23, 42, 0.78);
  border: 2px solid #3b82f6;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.18);
}

.header {
  text-align: center;
  margin-bottom: 25px;
}

.header h2 {
  margin: 0;
  color: #60a5fa;
  font-size: 2.1rem;
  font-family: Georgia, serif;
}

.header p {
  color: #a9b6ca;
  line-height: 1.55;
  font-family: Georgia, serif;
}

.user-profile {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 18px;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.5), rgba(17, 24, 39, 0.5));
  color: #fbbf24;
  font-weight: 900;
}

.matched-route {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  border: 1px solid rgba(147, 197, 253, 0.3);
  color: #dbeafe;
  font-weight: 800;
}

.matched-route-icon {
  font-size: 1.1rem;
}

.fallback-copy {
  max-width: 680px;
  margin: 12px auto 0;
  color: #fcd34d;
  font-size: 0.92rem;
}

.region-selector {
  width: min(820px, 100%);
  margin: 18px auto 0;
  padding: 16px;
  border: 1px solid rgba(147, 197, 253, 0.26);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.62);
  text-align: left;
}

.region-selector-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.region-selector-head strong {
  color: #dbeafe;
  font-size: 1rem;
}

.region-selector-head p {
  margin: 4px 0 0;
  color: #a9b6ca;
  font-size: 0.88rem;
  line-height: 1.45;
}

.region-options {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.region-option {
  min-height: 58px;
  padding: 8px 6px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.88);
  color: #dbeafe;
  cursor: pointer;
  display: grid;
  place-items: center;
  gap: 3px;
  font-weight: 900;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.region-option span {
  font-size: 1.25rem;
}

.region-option strong {
  font-size: 0.78rem;
  line-height: 1.1;
  text-align: center;
}

.region-option:hover,
.region-option.active {
  transform: translateY(-2px);
  border-color: #fbbf24;
  background: rgba(30, 64, 175, 0.58);
  box-shadow: 0 8px 18px rgba(30, 64, 175, 0.24);
}

.region-school-preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.preview-label {
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 900;
}

.preview-school {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  color: #dbeafe;
  font-size: 0.76rem;
  font-weight: 800;
}

.school-search-panel {
  width: min(820px, 100%);
  margin: 12px auto 0;
  padding: 16px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 16px;
  background: rgba(6, 78, 59, 0.22);
  text-align: left;
}

.school-search-head strong {
  color: #d1fae5;
  font-size: 1rem;
}

.school-search-head p {
  margin: 4px 0 12px;
  color: #a9b6ca;
  font-size: 0.88rem;
  line-height: 1.45;
}

.school-search-controls {
  display: grid;
  grid-template-columns: minmax(180px, 0.85fr) minmax(260px, 1.15fr);
  gap: 10px;
}

.school-search-input,
.school-search-select {
  width: 100%;
  min-height: 42px;
  border: 1px solid rgba(125, 211, 252, 0.5);
  border-radius: 10px;
  background: #f8fafc;
  color: #172033;
  padding: 0 12px;
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(8, 47, 73, 0.18);
}

.school-search-input::placeholder {
  color: #64748b;
}

.school-search-input:focus,
.school-search-select:focus {
  outline: 3px solid rgba(56, 189, 248, 0.28);
  border-color: #38bdf8;
}

.school-search-select option {
  background: #f8fafc;
  color: #172033;
  font-weight: 800;
}

.school-case-card {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.74);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.school-case-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.school-case-icon {
  font-size: 2rem;
}

.school-case-main strong {
  color: #f8fafc;
  font-size: 0.98rem;
}

.school-case-main p {
  margin: 4px 0 0;
  color: #cbd5e1;
  font-size: 0.82rem;
  line-height: 1.45;
}

.btn-add-school {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #10b981, #047857);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn-add-school:disabled {
  background: rgba(148, 163, 184, 0.48);
  cursor: not-allowed;
}

.card-deck,
.tier-zone {
  border: 2px dashed #475569;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.36);
}

.card-deck {
  min-height: 125px;
  padding: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.tiers {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.tier-zone {
  min-height: 270px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  transition: 0.2s;
}

.tier-zone.active {
  box-shadow: inset 0 0 24px rgba(255, 255, 255, 0.07);
}

.tier-header {
  margin-bottom: 8px;
  font-size: 1rem;
  font-weight: 900;
  text-transform: uppercase;
}

.reach { border-color: #ef4444; }
.reach .tier-header { color: #fca5a5; }
.match { border-color: #3b82f6; }
.match .tier-header { color: #93c5fd; }
.safety { border-color: #10b981; }
.safety .tier-header { color: #6ee7b7; }

.school-card {
  width: 140px;
  min-height: 126px;
  padding: 14px 10px;
  text-align: center;
  cursor: grab;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 2px solid #64748b;
  border-radius: 12px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
}

.school-card:hover,
.school-card.selected {
  transform: translateY(-4px);
  border-color: #fbbf24;
  box-shadow: 0 10px 20px rgba(251, 191, 36, 0.28);
}

.school-card.compact {
  width: 100%;
  min-height: 78px;
  padding: 9px;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: "icon name" "icon tag";
  column-gap: 10px;
  align-items: center;
  text-align: left;
}

.school-icon {
  grid-area: icon;
  font-size: 2rem;
}

.school-name {
  grid-area: name;
  color: #f8fafc;
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.2;
}

.school-tag {
  grid-area: tag;
  margin-top: 6px;
  color: #cbd5e1;
  font-size: 0.72rem;
  background: #334155;
  padding: 2px 7px;
  border-radius: 999px;
  justify-self: start;
}

.controls {
  margin-top: 28px;
  text-align: center;
}

.btn-predict,
.btn-complete {
  border: 0;
  border-radius: 999px;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn-predict {
  padding: 15px 38px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  font-size: 1.08rem;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.32);
}

.feedback-panel {
  margin-top: 24px;
  padding: 25px;
  background: rgba(15, 23, 42, 0.92);
  border: 2px solid #8b5cf6;
  border-radius: 16px;
}

.fb-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  margin-bottom: 15px;
  border-bottom: 1px dashed #6d28d9;
  color: #c4b5fd;
  font-size: 1.25rem;
  font-weight: 900;
}

.fb-score { color: #f59e0b; white-space: nowrap; }

.fb-item {
  margin-bottom: 13px;
  padding: 13px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.055);
  display: flex;
  gap: 12px;
}

.fb-icon { font-size: 1.45rem; }
.fb-item.danger { border-left: 4px solid #ef4444; }
.fb-item.waste { border-left: 4px solid #f59e0b; }
.fb-item.perfect { border-left: 4px solid #10b981; }

.fb-text h4 {
  margin: 0 0 5px;
  color: #f1f5f9;
  font-family: Georgia, serif;
}

.fb-text p {
  margin: 0;
  color: #a9b6ca;
  line-height: 1.55;
  font-family: Georgia, serif;
}

.btn-complete {
  width: 100%;
  margin-top: 16px;
  padding: 13px 18px;
  background: linear-gradient(135deg, #22c55e, #15803d);
}

@media (max-width: 820px) {
  .region-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .school-search-controls { grid-template-columns: 1fr; }
  .school-case-card { align-items: stretch; flex-direction: column; }
  .tiers { grid-template-columns: 1fr; }
  .tier-zone { min-height: 170px; }
}
</style>
