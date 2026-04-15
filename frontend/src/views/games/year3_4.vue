<template>
  <div class="star-root">
    <button class="close-btn" type="button" @click="$emit('close')">
      <i class="fas fa-arrow-left"></i>
      {{ t('pages.y3_4.back') }}
    </button>

    <button class="guide-btn" type="button" @click="showGuide = true">
      <i class="fas fa-book-open"></i>
      {{ t('pages.y3_4.guide.button') }}
    </button>

    <div class="star-room">
      <div class="header">
        <h2><i class="fas fa-project-diagram"></i> {{ t('pages.y3_4.title') }}</h2>
        <p>
          {{ t('pages.y3_4.intro') }}
          <span class="hint-text">{{ t('pages.y3_4.hint') }}</span>
        </p>
        <div class="status-row">
          <span>{{ t('pages.y3_4.statusLabel') }}</span>
          <strong>{{ selectedOrder.length }}/{{ stars.length }}</strong>
        </div>
        <div v-if="selectedLabels.length" class="order-row">
          <span>{{ t('pages.y3_4.orderLabel') }}</span>
          <div class="order-tags">
            <span v-for="(label, index) in selectedLabels" :key="`${label}-${index}`" class="order-tag">
              {{ label }}
            </span>
          </div>
        </div>
      </div>

      <div class="sky-canvas" :class="canvasState" id="skyCanvas">
        <svg class="svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline class="magic-line" :points="linePoints" />
        </svg>

        <button
          v-for="star in stars"
          :key="star.id"
          class="star-node"
          :id="`node-${star.id}`"
          :class="{ active: selectedOrder.includes(star.id) }"
          :style="{ left: `${star.x}%`, top: `${star.y}%` }"
          type="button"
          @click="clickStar(star.id)"
        >
          <div class="star-core">
            <i :class="star.icon"></i>
            <div class="order-badge">{{ orderIndex(star.id) }}</div>
          </div>
          <div class="star-label">
            <div class="star-title">{{ star.title }}</div>
            <div class="star-desc">{{ star.desc }}</div>
          </div>
        </button>
      </div>

      <div class="modal-overlay" :class="{ show: result.show }" id="resultModal">
        <div class="feedback-card" :class="result.type">
          <div class="fb-icon"><i :class="result.icon"></i></div>
          <div class="fb-title">{{ result.title }}</div>
          <div class="fb-desc" v-html="result.desc"></div>
          <div class="modal-actions">
            <button class="btn-reset" type="button" @click="resetStars">{{ t('pages.y3_4.reset') }}</button>
            <button
              class="btn-next"
              type="button"
              v-if="result.type === 'success'"
              @click="completeNode"
            >
              {{ t('pages.y3_4.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="guide-modal" :class="{ show: showGuide }">
      <div class="guide-card">
        <div class="guide-title">{{ t('pages.y3_4.guide.title') }}</div>
        <p class="guide-intro">{{ t('pages.y3_4.guide.intro') }}</p>
        <ul class="guide-list">
          <li v-for="(item, index) in guideItems" :key="index">{{ item }}</li>
        </ul>
        <button class="guide-close" type="button" @click="showGuide = false">
          {{ t('pages.y3_4.guide.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const starLayout = [
  { id: 'motive', x: 20, y: 20, icon: 'fas fa-seedling' },
  { id: 'incident', x: 10, y: 55, icon: 'fas fa-bolt' },
  { id: 'action', x: 50, y: 80, icon: 'fas fa-hammer' },
  { id: 'match', x: 90, y: 55, icon: 'fas fa-university' },
  { id: 'goal', x: 80, y: 20, icon: 'fas fa-flag-checkered' },
]

const localizedStars = computed(() => tm('pages.y3_4.stars') || [])
const stars = computed(() => {
  const map = new Map(localizedStars.value.map((star) => [star.id, star]))
  return starLayout.map((star) => ({
    ...star,
    ...(map.get(star.id) || {}),
  }))
})

const selectedOrder = ref([])
const canvasState = ref('')
const showGuide = ref(false)
const guideItems = computed(() => tm('pages.y3_4.guide.items') || [])

const result = reactive({
  show: false,
  type: 'error',
  title: '',
  desc: '',
  icon: ''
})

const linePoints = computed(() => selectedOrder.value
  .map((id) => stars.value.find((star) => star.id === id))
  .filter(Boolean)
  .map((star) => `${star.x},${star.y}`)
  .join(' '))

const selectedLabels = computed(() => selectedOrder.value
  .map((id) => stars.value.find((star) => star.id === id))
  .filter(Boolean)
  .map((star) => star.title))

function orderIndex(id) {
  const idx = selectedOrder.value.indexOf(id)
  return idx === -1 ? '' : idx + 1
}

function clickStar(id) {
  const index = selectedOrder.value.indexOf(id)
  if (index !== -1) {
    selectedOrder.value = selectedOrder.value.slice(0, index + 1)
    updateState()
    return
  }

  if (selectedOrder.value.length < stars.value.length) {
    selectedOrder.value = [...selectedOrder.value, id]
    updateState()

    if (selectedOrder.value.length === stars.value.length) {
      setTimeout(validateConstellation, 400)
    }
  }
}

function updateState() {
  canvasState.value = ''
  result.show = false
}

function resetStars() {
  selectedOrder.value = []
  canvasState.value = ''
  result.show = false
}

function validateConstellation() {
  const order = selectedOrder.value

  if (order[0] === 'match') {
    return showResult('error', t('pages.y3_4.results.templateWarning.title'), t('pages.y3_4.results.templateWarning.desc'))
  }

  if (order.indexOf('goal') < order.indexOf('action') || order.indexOf('match') < order.indexOf('action')) {
    return showResult('error', t('pages.y3_4.results.logicalCollapse.title'), t('pages.y3_4.results.logicalCollapse.desc'))
  }

  if (order.indexOf('motive') > order.indexOf('action')) {
    return showResult('error', t('pages.y3_4.results.narrativeRisk.title'), t('pages.y3_4.results.narrativeRisk.desc'))
  }

  const orthodox = ['motive', 'incident', 'action', 'match', 'goal']
  const hook = ['incident', 'motive', 'action', 'match', 'goal']
  const isOrthodox = orthodox.every((id, index) => order[index] === id)
  const isHook = hook.every((id, index) => order[index] === id)

  if (isOrthodox || isHook) {
    return showResult(
      'success',
      isHook ? t('pages.y3_4.results.suspenseHook.title') : t('pages.y3_4.results.heroJourney.title'),
      isHook ? t('pages.y3_4.results.suspenseHook.desc') : t('pages.y3_4.results.heroJourney.desc'),
    )
  }

  return showResult('error', t('pages.y3_4.results.fallback.title'), t('pages.y3_4.results.fallback.desc'))
}

function showResult(type, title, desc) {
  result.type = type
  result.title = title
  result.desc = desc
  result.icon = type === 'success' ? 'fas fa-crown' : 'fas fa-skull-crossbones'
  result.show = true
  canvasState.value = type
}

function completeNode() {
  result.show = false
  canvasState.value = ''
  emit('complete', { game: 'ps-story-weaving', order: selectedOrder.value })
}
</script>

<style scoped>
.star-root {
  min-height: 100%;
  padding: clamp(18px, 4vw, 64px);
  color: #e2e8f0;
  background: radial-gradient(circle at center, #1e103c 0%, #0a0410 100%);
  position: relative;
}

.close-btn,
.guide-btn {
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
}

.close-btn {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 20;
  padding: 8px 14px;
  color: #e9d5ff;
  background: rgba(10, 4, 16, 0.85);
  border: 1px solid rgba(216, 180, 254, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.guide-btn {
  position: fixed;
  top: 68px;
  right: 18px;
  z-index: 20;
  padding: 8px 14px;
  color: #e9d5ff;
  background: rgba(10, 4, 16, 0.85);
  border: 1px solid rgba(216, 180, 254, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.star-room {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  background: rgba(20, 10, 35, 0.4);
  border: 1px solid #6b21a8;
  border-radius: 24px;
  padding: 40px 20px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(168, 85, 247, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  z-index: 10;
}

.header h2 {
  margin: 0 0 10px 0;
  font-size: 2.2rem;
  color: #e9d5ff;
  text-shadow: 0 0 15px rgba(216, 180, 254, 0.6);
  letter-spacing: 1px;
  font-family: Georgia, serif;
}

.header p {
  color: #a8b2d1;
  font-size: 1.05rem;
  margin: 0;
  line-height: 1.6;
  font-family: Georgia, serif;
  font-style: italic;
}

.hint-text {
  color: #fde047;
  font-weight: bold;
  font-size: 1.1rem;
  margin-left: 6px;
  animation: pulse 2s infinite;
  display: inline-block;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; text-shadow: 0 0 10px #fde047; }
}

.status-row {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(253, 224, 71, 0.4);
  color: #fde047;
  font-weight: 700;
}

.order-row {
  margin-top: 10px;
  display: grid;
  gap: 8px;
  justify-content: center;
  color: #cbd5e1;
}

.order-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.order-tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(253, 224, 71, 0.15);
  border: 1px solid rgba(253, 224, 71, 0.4);
  font-size: 0.85rem;
}

.sky-canvas {
  position: relative;
  width: 100%;
  height: 450px;
  margin: 0 auto;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 60%);
}

.svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.magic-line {
  fill: none;
  stroke: #d8b4fe;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px #a855f7);
  transition: all 0.3s ease;
}

.sky-canvas.success .magic-line {
  stroke: #fde047;
  filter: drop-shadow(0 0 15px #fde047);
}

.sky-canvas.error .magic-line {
  stroke: #ef4444;
  filter: drop-shadow(0 0 15px #ef4444);
  stroke-dasharray: 10 10;
}

.star-node {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: 0.3s;
  background: transparent;
  border: none;
}

.star-core {
  width: 55px;
  height: 55px;
  background: radial-gradient(circle, #f3e8ff, #7e22ce);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: #fff;
  box-shadow: 0 0 20px rgba(126, 34, 206, 0.6);
  border: 2px solid transparent;
  transition: 0.3s;
  position: relative;
}

.star-node:hover .star-core {
  transform: scale(1.15);
  box-shadow: 0 0 30px rgba(216, 180, 254, 0.8);
}

.star-label {
  margin-top: 12px;
  text-align: center;
  background: rgba(15, 23, 42, 0.85);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #4c1d95;
  pointer-events: none;
  width: 145px;
}

.star-title {
  font-weight: bold;
  color: #e9d5ff;
  font-size: 0.9rem;
  margin-bottom: 4px;
  line-height: 1.2;
  font-family: Georgia, serif;
}

.star-desc {
  font-size: 0.7rem;
  color: #94a3b8;
  line-height: 1.3;
}

.star-node.active .star-core {
  background: radial-gradient(circle, #fff, #ca8a04);
  border-color: #fde047;
  box-shadow: 0 0 30px rgba(253, 224, 71, 0.8);
  transform: scale(1.1);
}

.star-node.active .star-label {
  border-color: #ca8a04;
}

.star-node.active .star-title {
  color: #fde047;
}

.order-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #0f172a;
  color: #fde047;
  border: 2px solid #fde047;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: bold;
  opacity: 0;
  transform: scale(0);
  transition: 0.3s;
}

.star-node.active .order-badge {
  opacity: 1;
  transform: scale(1);
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: 0.3s;
  border-radius: 24px;
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.feedback-card {
  background: linear-gradient(180deg, #1e1b4b, #0f172a);
  border: 2px solid;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  transform: translateY(20px);
  transition: 0.3s;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
}

.modal-overlay.show .feedback-card {
  transform: translateY(0);
}

.fb-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.fb-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  font-family: Georgia, serif;
}

.fb-desc {
  color: #cbd5e1;
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 25px;
  text-align: left;
  font-family: Georgia, serif;
}

.fb-desc b {
  color: #fde047;
}

.btn-reset {
  background: transparent;
  border: 2px solid #94a3b8;
  color: #f8fafc;
  padding: 10px 25px;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

.btn-next {
  background: linear-gradient(135deg, #ca8a04, #a16207);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
  margin-left: 10px;
}

.btn-next:hover {
  box-shadow: 0 0 20px rgba(253, 224, 71, 0.5);
  transform: translateY(-2px);
}

.feedback-card.error {
  border-color: #ef4444;
}

.feedback-card.error .fb-icon,
.feedback-card.error .fb-title {
  color: #ef4444;
}

.feedback-card.success {
  border-color: #fde047;
}

.feedback-card.success .fb-icon,
.feedback-card.success .fb-title {
  color: #fde047;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.guide-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: none;
  place-items: center;
  z-index: 110;
}

.guide-modal.show {
  display: grid;
}

.guide-card {
  width: min(560px, 92vw);
  background: #0f172a;
  border: 2px solid rgba(216, 180, 254, 0.45);
  border-radius: 16px;
  padding: 28px;
  color: #e9d5ff;
}

.guide-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.guide-intro {
  color: #cbd5e1;
  margin-bottom: 14px;
  line-height: 1.5;
}

.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.guide-close {
  margin-top: 18px;
  padding: 10px 18px;
  background: #fde047;
  color: #1e1b4b;
  border: none;
  font-weight: 700;
  border-radius: 999px;
}

@media (max-width: 900px) {
  .star-room {
    padding-top: 70px;
  }

  .close-btn,
  .guide-btn {
    position: static;
    margin-bottom: 12px;
  }

  .sky-canvas {
    height: 520px;
  }
}

@media (max-width: 720px) {
  .sky-canvas {
    height: auto;
    display: grid;
    gap: 12px;
    padding: 16px 0;
  }

  .svg-layer {
    display: none;
  }

  .star-node {
    position: static;
    transform: none;
  }
}
</style>
