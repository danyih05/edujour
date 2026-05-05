<template>
  <div class="tier-game">
    <section class="balance-room">
      <div class="header">
        <h2><i class="fas fa-balance-scale-right"></i> {{ t('pages.y2_3.title') }}</h2>
        <p>{{ t('pages.y2_3.subtitle', { country: matchedCountryLabel, profile: profileSummary }) }}</p>
        <div class="user-profile">
          <i class="fas fa-user-graduate"></i> {{ profileSummary }}
        </div>
        <div class="matched-route">
          <span class="matched-route-icon">{{ countryConfig.icon }}</span>
          <span>{{ t('pages.y2_3.matchedRoute', { country: matchedCountryLabel }) }}</span>
        </div>
        <p v-if="usingFallbackCountry" class="fallback-copy">{{ t('pages.y2_3.fallbackCopy') }}</p>

        <section class="region-selector locked-region" aria-label="Matched region">
          <div class="region-selector-head">
            <div>
              <strong>{{ t('pages.y2_3.matchedRoute', { country: matchedCountryLabel }) }}</strong>
              <p>{{ t('pages.y2_3.regionSelector.copy') }}</p>
            </div>
          </div>
          <div v-if="!isAdviceOnlyCountry" class="region-school-preview">
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

        <section v-if="showSchoolSearch" class="school-search-panel" aria-label="School search">
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

      <section v-if="isAdviceOnlyCountry" class="niche-info-panel">
        <div class="niche-icon">{{ countryConfig.icon }}</div>
        <h3>{{ matchedCountryLabel }}</h3>
        <p>{{ specialRegionMessage }}</p>
        <button type="button" class="btn-complete" @click="completeWithResult">{{ t('pages.y2_3.seal') }}</button>
      </section>

      <div v-else class="card-deck" :class="{ selecting: selectedCardId }" @dragover.prevent @drop="dropOn('deck')">
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

      <div v-if="!isAdviceOnlyCountry" class="tiers">
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

      <div v-if="!isAdviceOnlyCountry" class="controls">
        <button type="button" class="btn-predict" @click="evaluateTiers">
          <i class="fas fa-crystal-ball"></i> {{ t('pages.y2_3.predict') }}
        </button>
      </div>

      <section v-if="!isAdviceOnlyCountry && feedback.length" class="feedback-panel">
        <div class="fb-title">
          <span><i class="fas fa-scroll"></i> {{ t('pages.y2_3.feedbackTitle') }}</span>
          <span class="fb-score">+{{ score }} <i class="fas fa-coins"></i></span>
        </div>

        <div v-for="item in renderedFeedback" :key="item.key || item.title" class="fb-item" :class="item.status">
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
  getYear2ProfileScore,
  getYear2ScoreBand,
  getYear2ScoreSchoolCards,
  getYear2SchoolCases,
  getYear2CountrySchoolConfig,
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
      h('div', { class: 'school-card-icon', 'aria-hidden': 'true' }, props.card.icon || '🎓'),
      h('div', { class: 'school-card-copy' }, [
        h('div', { class: 'school-name' }, props.card.name),
        props.card.displayTag ? h('div', { class: 'school-tag' }, props.card.displayTag) : null,
      ]),
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
const inheritedCountryKey = computed(() => profileMatchedCountryKey.value || persistedCountryKey.value || 'global')
const selectedCountryKey = ref(inheritedCountryKey.value)
const usingFallbackCountry = computed(() => selectedCountryKey.value === 'global')
const countryConfig = computed(() => getYear2CountrySchoolConfig(selectedCountryKey.value || 'global'))
const matchedCountryLabel = computed(() => localize(countryConfig.value.label))
const profileScore = computed(() => getYear2ProfileScore(store.travelerProfile))
const profileScoreBand = computed(() => getYear2ScoreBand(store.travelerProfile))
function scoreBandTag(school) {
  const scoreBand = school?.scoreBand || profileScoreBand.value
  if (!scoreBand) return ''
  return currentLanguage.value === 'en' ? `Current ${scoreBand}` : `当前 ${scoreBand}`
}

const baseSchoolCards = computed(() => (countryConfig.value.schools || []).map((school, index) => ({
  ...school,
  id: school.id || `configured-${countryConfig.value.key}-${index + 1}`,
  rawName: school.name,
  name: localize(school.name),
  displayTag: scoreBandTag(school),
  countryKey: school.countryKey || countryConfig.value.key,
  countryLabel: school.countryLabel || countryConfig.value.label,
})))
const scoreSchoolCards = computed(() => (baseSchoolCards.value.length ? [] : getYear2ScoreSchoolCards(selectedCountryKey.value, store.travelerProfile).map((school) => ({
  ...school,
  rawName: school.name,
  name: localize(school.name),
  displayTag: scoreBandTag(school),
}))))
const isAdviceOnlyCountry = computed(() => Boolean(countryConfig.value.adviceMessage || countryConfig.value.nicheMessage))
const specialRegionMessage = computed(() => (
  localize(countryConfig.value.adviceMessage || countryConfig.value.nicheMessage) ||
  (countryConfig.value.key === 'jointProgram' ? t('pages.y2_3.jointProgramMessage') : t('pages.y2_3.nicheMessage'))
))
const addedSchoolIds = ref([])
const schoolCases = computed(() => (baseSchoolCards.value.length ? [] : getYear2SchoolCases(selectedCountryKey.value, store.travelerProfile).map((school) => ({
  ...school,
  rawName: school.name,
  name: localize(school.name),
  displayTag: scoreBandTag(school),
  countryLabelText: localize(school.countryLabel || getYear2CountrySchoolConfig(school.countryKey).label),
  caseInfo: localize(school.caseInfo),
}))))
const addedSchoolCards = computed(() => addedSchoolIds.value
  .map((id) => schoolCases.value.find((school) => school.id === id))
  .filter(Boolean))
const schoolCards = computed(() => {
  const baseCards = scoreSchoolCards.value.length ? scoreSchoolCards.value : baseSchoolCards.value
  const baseIds = new Set(baseCards.map((school) => school.id))
  return [
    ...baseCards,
    ...addedSchoolCards.value.filter((school) => !baseIds.has(school.id)),
  ]
})
const profileSummary = computed(() => {
  const profile = store.travelerProfile || {}
  const academicProfile = profile.academicProfile || {}
  const experiences = academicProfile.experiences || {}
  const experienceCount = Object.values(experiences).filter(Boolean).length
  const languageSummary = academicProfile.languageSummary && !String(academicProfile.languageSummary).includes('Pending')
    ? ` | ${academicProfile.languageSummary}`
    : ''
  const greSummary = academicProfile.greSummary && !String(academicProfile.greSummary).includes('Pending')
    ? ` | ${academicProfile.greSummary}`
    : ''
  const experienceCopy = currentLanguage.value === 'en'
    ? `${experienceCount} experience tag${experienceCount === 1 ? '' : 's'}`
    : `${experienceCount} 段经历标签`

  return currentLanguage.value === 'en'
    ? `Current profile: GPA ${profileScore.value}/100 (${profileScoreBand.value}) | STEM/CS track | ${experienceCopy}${languageSummary}${greSummary}`
    : `当前画像：GPA ${profileScore.value}/100（${profileScoreBand.value}）｜STEM/CS 方向｜${experienceCopy}${languageSummary}${greSummary}`
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
    school.displayTag.toLowerCase().includes(query)
  ))
})
const selectedSchoolCase = computed(() => (
  schoolCases.value.find((school) => school.id === selectedSchoolCaseId.value) ||
  (schoolSearchQuery.value ? filteredSchoolCases.value[0] : null)
))
const isSelectedCaseInDeck = computed(() => (
  Boolean(selectedSchoolCase.value && schoolCards.value.some((school) => school.id === selectedSchoolCase.value.id))
))
const showSchoolSearch = computed(() => !isAdviceOnlyCountry.value && schoolCases.value.length > 0)

const locations = reactive({})
const selectedCardId = ref('')
const draggingCardId = ref('')
const feedback = ref([])
const score = ref(50)

watch(inheritedCountryKey, (nextKey) => {
  if (!nextKey) return
  selectedCountryKey.value = nextKey
  addedSchoolIds.value = []
  selectedSchoolCaseId.value = ''
  schoolSearchQuery.value = ''
}, { immediate: true })

watch(() => schoolCards.value.map((card) => card.id).join('|'), () => {
  const currentIds = new Set(schoolCards.value.map((card) => card.id))

  Object.keys(locations).forEach((key) => {
    if (!currentIds.has(key)) {
      delete locations[key]
    }
  })

  schoolCards.value.forEach((card) => {
    if (!locations[card.id]) {
      locations[card.id] = 'deck'
    }
  })

  if (selectedCardId.value && !currentIds.has(selectedCardId.value)) {
    selectedCardId.value = ''
  }
  if (draggingCardId.value && !currentIds.has(draggingCardId.value)) {
    draggingCardId.value = ''
  }
  feedback.value = []
  score.value = 50
}, { immediate: true })

const guideItems = computed(() => {
  if (isAdviceOnlyCountry.value) {
    return [
      {
        title: matchedCountryLabel.value,
        text: specialRegionMessage.value,
      },
    ]
  }

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
  ]
})

function cardsIn(location) {
  return schoolCards.value.filter((card) => locations[card.id] === location)
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

function localizedSchoolName(card) {
  return localize(card.rawName || card.name)
}

function resolveFeedbackParams(params = {}) {
  const resolved = { ...params }
  if (params.schoolCard) {
    resolved.school = localizedSchoolName(params.schoolCard)
  }
  if (params.countryKey) {
    resolved.country = localize(getYear2CountrySchoolConfig(params.countryKey).label)
  } else if (params.country) {
    resolved.country = params.country
  } else {
    resolved.country = matchedCountryLabel.value
  }
  if (params.targetTierId) {
    resolved.targetTier = tierLabel(params.targetTierId)
  }
  if (params.currentTierId) {
    resolved.currentTier = tierLabel(params.currentTierId)
  }
  if (params.tierId) {
    resolved.tier = tierLabel(params.tierId)
  }
  delete resolved.schoolCard
  delete resolved.countryKey
  delete resolved.targetTierId
  delete resolved.currentTierId
  delete resolved.tierId
  return resolved
}

function addFeedback(key, status, icon, titleKey, textKey, params = {}) {
  feedback.value.push({ key, status, icon, titleKey, textKey, params })
}

const renderedFeedback = computed(() => feedback.value.map((item) => {
  const params = resolveFeedbackParams(item.params)
  return {
    ...item,
    title: item.titleKey ? t(item.titleKey, params) : item.title,
    text: item.textKey ? t(item.textKey, params) : item.text,
  }
}))

function serializeFeedbackParams(params = {}) {
  const serialized = { ...params }
  if (params.schoolCard) {
    serialized.school = params.schoolCard.rawName || params.schoolCard.name
  }
  delete serialized.schoolCard
  return serialized
}

function serializeFeedbackItem(item) {
  const resolvedParams = resolveFeedbackParams(item.params)
  return {
    status: item.status,
    titleKey: item.titleKey,
    textKey: item.textKey,
    params: serializeFeedbackParams(item.params),
    title: item.titleKey ? t(item.titleKey, resolvedParams) : item.title,
    text: item.textKey ? t(item.textKey, resolvedParams) : item.text,
  }
}

function evaluateTiers() {
  if (isAdviceOnlyCountry.value) return

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
        'pages.y2_3.feedback.tooSafe.title',
        'pages.y2_3.feedback.tooSafe.text',
        {
          schoolCard: card,
          countryKey: selectedCountryKey.value,
          targetTierId: targetTier,
          currentTierId: currentTier,
        },
      )
    } else {
      addFeedback(
        `${card.id}-too-high`,
        targetTier === 'safety' ? 'waste' : 'danger',
        targetTier === 'safety' ? 'fa-arrow-down' : 'fa-exclamation-triangle',
        'pages.y2_3.feedback.tooHigh.title',
        'pages.y2_3.feedback.tooHigh.text',
        {
          schoolCard: card,
          countryKey: selectedCountryKey.value,
          targetTierId: targetTier,
          currentTierId: currentTier,
        },
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
        'pages.y2_3.feedback.correctReach.title',
        'pages.y2_3.feedback.correctReach.text',
        {
          schoolCard: exactMatches.reach[0],
          countryKey: selectedCountryKey.value,
          tierId: 'reach',
        },
      )
    }

    if (exactMatches.match[0]) {
      addFeedback(
        `${exactMatches.match[0].id}-perfect-match`,
        'perfect',
        'fa-bullseye',
        'pages.y2_3.feedback.correctMatch.title',
        'pages.y2_3.feedback.correctMatch.text',
        {
          schoolCard: exactMatches.match[0],
          countryKey: selectedCountryKey.value,
          tierId: 'match',
        },
      )
    }

    if (exactMatches.safety[0]) {
      addFeedback(
        `${exactMatches.safety[0].id}-perfect-safety`,
        'perfect',
        'fa-shield-alt',
        'pages.y2_3.feedback.correctSafety.title',
        'pages.y2_3.feedback.correctSafety.text',
        {
          schoolCard: exactMatches.safety[0],
          countryKey: selectedCountryKey.value,
          tierId: 'safety',
        },
      )
    }
  }

  if (!feedback.value.length) {
    addFeedback(
      'fallback',
      'waste',
      'fa-question-circle',
      'pages.y2_3.feedback.fallback.title',
      'pages.y2_3.feedback.fallback.text',
      { countryKey: selectedCountryKey.value },
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
  if (isAdviceOnlyCountry.value) {
    emit('complete', {
      completed: true,
      passed: true,
      resultType: 'summary',
      resultData: {
        matchedCountry: matchedCountryLabel.value,
        selectedCountry: countryConfig.value.key,
        message: specialRegionMessage.value,
      },
      language: currentLanguage.value,
    })
    return
  }

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
      feedback: feedback.value.map((item) => serializeFeedbackItem(item)),
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

.niche-info-panel {
  margin-top: 10px;
  padding: 28px;
  border: 2px dashed #475569;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.36);
  text-align: center;
  box-shadow: inset 0 0 24px rgba(96, 165, 250, 0.08);
}

.niche-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.18);
  border: 1px solid rgba(147, 197, 253, 0.32);
  font-size: 2rem;
}

.niche-info-panel h3 {
  margin: 0 0 10px;
  color: #dbeafe;
  font-size: 1.3rem;
}

.niche-info-panel p {
  max-width: 620px;
  margin: 0 auto 20px;
  color: #fcd34d;
  font-weight: 800;
  line-height: 1.65;
}

.tiers {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.tier-zone {
  min-height: 270px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
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
  padding: 12px 10px 14px;
  text-align: center;
  cursor: grab;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 2px solid #64748b;
  border-radius: 12px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.school-card:hover,
.school-card.selected {
  transform: translateY(-4px);
  border-color: #fbbf24;
  box-shadow: 0 10px 20px rgba(251, 191, 36, 0.28);
}

.school-card.compact {
  width: 100%;
  min-height: 54px;
  padding: 8px 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.school-card-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.38);
  box-shadow: inset 0 0 14px rgba(251, 191, 36, 0.08), 0 6px 12px rgba(0, 0, 0, 0.22);
  font-size: 1.35rem;
  line-height: 1;
  flex: 0 0 auto;
}

.school-card.compact .school-card-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  font-size: 1.05rem;
}

.school-card-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  width: 100%;
}

.school-card.compact .school-card-copy {
  align-items: flex-start;
  flex: 1 1 auto;
}

.school-name {
  grid-area: name;
  color: #f8fafc;
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.2;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.school-tag {
  grid-area: tag;
  margin-top: 3px;
  color: #cbd5e1;
  font-size: 0.72rem;
  background: #334155;
  padding: 2px 7px;
  border-radius: 999px;
  justify-self: start;
}

.school-card.compact .school-name {
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.school-card.compact .school-tag {
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.school-card.compact .school-name,
.school-card.compact .school-tag {
  min-width: 0;
}

.school-card.compact .school-name {
  margin-bottom: 3px;
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

@media (max-width: 768px) {
  .tier-game {
    padding: 10px;
  }

  .balance-room {
    padding: 12px;
    border-radius: 16px;
  }

  .header {
    margin-bottom: 10px;
  }
  .header h2 {
    font-size: 1.25rem;
  }
  .header p {
    font-size: 0.75rem;
    margin-top: 4px;
  }
  .user-profile,
  .matched-route {
    padding: 5px 8px;
    font-size: 0.7rem;
    margin-top: 6px;
  }
  .fallback-copy {
    font-size: 0.72rem;
    margin-top: 6px;
  }

  /* 地区选择器 → 3列紧凑 */
  .region-selector {
    padding: 10px;
    margin-top: 10px;
  }
  .region-options {
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
  }
  .region-option {
    min-height: 44px;
    padding: 5px 3px;
  }
  .region-option span {
    font-size: 0.95rem;
  }
  .region-option strong {
    font-size: 0.6rem;
  }
  .region-school-preview {
    margin-top: 8px;
    gap: 4px;
  }
  .preview-school {
    font-size: 0.66rem;
    padding: 2px 6px;
  }

  /* 学校搜索面板 */
  .school-search-panel {
    padding: 10px;
    margin-top: 8px;
  }
  .school-search-controls {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .school-search-input,
  .school-search-select {
    min-height: 44px;
    font-size: 0.85rem;
  }
  .school-case-card {
    flex-direction: column;
    align-items: stretch;
    padding: 10px;
  }
  .btn-add-school {
    width: 100%;
    min-height: 44px;
  }

  /* 卡牌区 */
  .card-deck {
    padding: 10px;
    gap: 8px;
    min-height: 80px;
  }
  .school-card {
    width: 100px;
    min-height: 78px;
    padding: 8px 6px;
  }
  .school-name {
    font-size: 0.72rem;
  }
  .school-tag {
    font-size: 0.62rem;
    padding: 2px 5px;
  }
  /* 选校层级 → 单列 */
  .tiers {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .tier-zone {
    min-height: 100px;
    padding: 10px;
  }
  .tier-header {
    font-size: 0.85rem;
  }

  .btn-predict {
    padding: 12px 24px;
    font-size: 0.95rem;
    min-height: 48px;
  }

  .feedback-panel {
    padding: 14px;
  }
  .fb-title {
    font-size: 1rem;
  }
  .fb-text h4 {
    font-size: 0.85rem;
  }
  .fb-text p {
    font-size: 0.78rem;
  }
  .btn-complete {
    min-height: 48px;
  }

  /* 特殊路径面板 */
  .niche-info-panel {
    padding: 14px;
  }
  .niche-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
  .niche-info-panel h3 {
    font-size: 1.1rem;
  }
  .niche-info-panel p {
    font-size: 0.82rem;
  }
}
</style>
