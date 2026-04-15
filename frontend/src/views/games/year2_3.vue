<template>
  <div class="tier-game">
    <section class="balance-room">
      <div class="header">
        <h2><i class="fas fa-balance-scale-right"></i> {{ t('pages.y2_3.title') }}</h2>
        <p>{{ t('pages.y2_3.subtitle') }}</p>
        <div class="user-profile">
          <i class="fas fa-user-graduate"></i> {{ t('pages.y2_3.currentAvatar') }}
        </div>
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

        <div v-for="item in feedback" :key="item.title" class="fb-item" :class="item.status">
          <div class="fb-icon"><i class="fas" :class="item.icon"></i></div>
          <div class="fb-text">
            <h4>{{ item.title }}</h4>
            <p>{{ item.text }}</p>
          </div>
        </div>

        <button type="button" class="btn-complete" @click="emit('complete')">{{ t('pages.y2_3.seal') }}</button>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

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

const schoolCardDefs = [
  { id: 'ic', icon: '👑' },
  { id: 'ucl', icon: '🏛️' },
  { id: 'kcl', icon: '🦁' },
  { id: 'soton', icon: '⚓' },
  { id: 'cardiff', icon: '🐉' },
]

const schoolCards = computed(() => schoolCardDefs.map((card) => ({
  ...card,
  name: t(`pages.y2_3.cards.${card.id}.name`),
  tag: t(`pages.y2_3.cards.${card.id}.tag`),
})))

const tiers = computed(() => ([
  { id: 'reach', label: t('pages.y2_3.tiers.reach'), icon: 'fa-fire' },
  { id: 'match', label: t('pages.y2_3.tiers.match'), icon: 'fa-bullseye' },
  { id: 'safety', label: t('pages.y2_3.tiers.safety'), icon: 'fa-shield-alt' },
]))

const locations = reactive(Object.fromEntries(schoolCardDefs.map((card) => [card.id, 'deck'])))
const selectedCardId = ref('')
const draggingCardId = ref('')
const feedback = ref([])
const score = ref(50)

const guideItems = computed(() => tm('pages.y2_3.guide.items') || [])

const cardById = computed(() => Object.fromEntries(schoolCards.value.map((card) => [card.id, card])))

function cardsIn(location) {
  return schoolCards.value.filter((card) => locations[card.id] === location)
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

function addFeedback(status, icon, title, text) {
  feedback.value.push({ status, icon, title, text })
}

function evaluateTiers() {
  if (cardsIn('deck').length) {
    window.alert(t('pages.y2_3.alertCompleteDeck'))
    return
  }

  feedback.value = []
  score.value = 50
  const reaches = idsIn('reach')
  const matches = idsIn('match')
  const safeties = idsIn('safety')

  if (matches.includes('ic') || safeties.includes('ic')) {
    addFeedback('danger', 'fa-skull-crossbones', t('pages.y2_3.feedback.icLow.title'), t('pages.y2_3.feedback.icLow.text'))
    score.value -= 10
  }

  if (matches.includes('ucl') || safeties.includes('ucl')) {
    addFeedback('danger', 'fa-exclamation-triangle', t('pages.y2_3.feedback.uclLow.title'), t('pages.y2_3.feedback.uclLow.text'))
    score.value -= 10
  } else if (reaches.includes('ucl')) {
    addFeedback('perfect', 'fa-check-circle', t('pages.y2_3.feedback.uclReach.title'), t('pages.y2_3.feedback.uclReach.text'))
  }

  if (reaches.includes('kcl') || reaches.includes('soton')) {
    addFeedback('waste', 'fa-arrow-down', t('pages.y2_3.feedback.kclSotonTooHigh.title'), t('pages.y2_3.feedback.kclSotonTooHigh.text'))
    score.value -= 10
  } else if (safeties.includes('kcl')) {
    addFeedback('danger', 'fa-exclamation', t('pages.y2_3.feedback.kclSafety.title'), t('pages.y2_3.feedback.kclSafety.text'))
  }

  if (reaches.includes('cardiff') || matches.includes('cardiff')) {
    addFeedback('waste', 'fa-arrow-down', t('pages.y2_3.feedback.cardiffTooHigh.title'), t('pages.y2_3.feedback.cardiffTooHigh.text'))
    score.value -= 10
  } else if (safeties.includes('cardiff')) {
    addFeedback('perfect', 'fa-shield-alt', t('pages.y2_3.feedback.cardiffSafety.title'), t('pages.y2_3.feedback.cardiffSafety.text'))
  }

  if (!feedback.value.length) {
    addFeedback('waste', 'fa-question-circle', t('pages.y2_3.feedback.fallback.title'), t('pages.y2_3.feedback.fallback.text'))
  }

  score.value = Math.max(10, score.value)

  nextTick(() => {
    const feedbackPanel = document.querySelector('.feedback-panel')
    if (feedbackPanel) {
      feedbackPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
  .tiers { grid-template-columns: 1fr; }
  .tier-zone { min-height: 170px; }
}
</style>
