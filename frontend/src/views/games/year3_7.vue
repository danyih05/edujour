<template>
  <div class="bog-sweeper-root">
    <div class="bubbles" aria-hidden="true">
      <div
        v-for="bubble in bubbles"
        :key="bubble.id"
        class="bubble"
        :style="bubble.style"
      />
    </div>
    <div class="damage-overlay" :class="{ active: overlayActive }"></div>

    <div class="game-container">
      <header class="header">
        <div class="title-box">
          <h2>{{ t('pages.y3_7.title') }}</h2>
          <p>{{ t('pages.y3_7.subtitle') }}</p>
        </div>

        <div class="status-box">
          <div class="status-label">{{ t('pages.y3_7.progressLabel') }}</div>
          <div class="progress-value">{{ progressCount }} / {{ mines.length }}</div>
          <div class="hp">{{ t('pages.y3_7.shieldPrefix') }} {{ shieldHearts }}</div>
        </div>
      </header>

      <main class="swamp-center">
        <article
          v-if="!finalShown"
          class="mine-orb"
          :class="{
            shake: orbState === 'shake',
            shatter: orbState === 'shatter',
          }"
        >
          <div class="mine-text">{{ displayedMineText }}</div>
        </article>

        <div class="toast" :class="{ show: dialog.show }">
          <h3 :style="{ color: toastTitleColor }">{{ toastTitle }}</h3>
          <p v-html="toastDesc"></p>
          <button class="next-btn" type="button" @click="handleToastAction">
            {{ toastButtonLabel }}
          </button>
        </div>
      </main>

      <section v-if="!finalShown" class="spell-panel">
        <button
          v-for="spell in spellButtons"
          :key="spell.type"
          class="spell-btn"
          :class="spell.className"
          :disabled="actionLocked"
          type="button"
          @click="castSpell(spell.type)"
        >
          <span class="spell-icon">{{ spell.icon }}</span>
          <span class="spell-name">{{ spell.name }}</span>
          <span class="spell-desc">{{ spell.desc }}</span>
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const maxHp = 6
const mineTypes = [
  'fatal',
  'severe',
  'fatal',
  'fatal',
  'fatal',
  'severe',
  'severe',
  'severe',
  'severe',
  'severe',
  'severe',
  'severe',
  'minor',
  'minor',
  'minor',
  'minor',
]
const spellOrder = ['fatal', 'severe', 'minor']
const spellIcons = {
  fatal: '\u{1F534}',
  severe: '\u{1F7E1}',
  minor: '\u{1F7E2}',
}
const spellClasses = {
  fatal: 'btn-fatal',
  severe: 'btn-severe',
  minor: 'btn-minor',
}

const bubbles = Array.from({ length: 15 }, (_, index) => ({
  id: `bubble-${index}`,
  style: {
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 40 + 20}px`,
    height: `${Math.random() * 40 + 20}px`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${Math.random() * 3 + 3}s`,
  },
}))

const currentIndex = ref(0)
const hp = ref(maxHp)
const ready = ref(false)
const isAnimating = ref(false)
const overlayActive = ref(false)
const transientWrongSpell = ref('')
const orbState = ref('idle')
const dialog = reactive({
  show: false,
  kind: 'success',
})
const timers = new Set()

const mines = computed(() => {
  const localizedMines = tm('pages.y3_7.mines') || []
  return localizedMines.map((mine, index) => ({
    ...mine,
    type: mineTypes[index],
  }))
})

const currentMine = computed(() => mines.value[currentIndex.value] || null)
const finalShown = computed(() => dialog.show && dialog.kind === 'final')
const actionLocked = computed(() => !ready.value || isAnimating.value || dialog.show)
const progressCount = computed(() => Math.min(currentIndex.value, mines.value.length))
const shieldHearts = computed(() => `${'\u2764\uFE0F'.repeat(hp.value)}${'\u{1F5A4}'.repeat(maxHp - hp.value)}`)

const displayedMineText = computed(() => {
  if (!ready.value) return t('pages.y3_7.awaitingManifestation')
  if (transientWrongSpell.value) {
    return t('pages.y3_7.wrongOrbText', { spell: spellName(transientWrongSpell.value) })
  }
  return currentMine.value?.text || ''
})

const spellButtons = computed(() => spellOrder.map((type) => ({
  type,
  icon: spellIcons[type],
  className: spellClasses[type],
  name: t(`pages.y3_7.spells.${type}.name`),
  desc: t(`pages.y3_7.spells.${type}.desc`),
})))

const toastTitle = computed(() => {
  if (dialog.kind === 'failure') return t('pages.y3_7.shieldBrokenTitle')
  if (dialog.kind === 'final') return t('pages.y3_7.finalWinTitle')
  return currentMine.value?.title || ''
})

const toastDesc = computed(() => {
  if (dialog.kind === 'failure') return t('pages.y3_7.shieldBrokenDesc')
  if (dialog.kind === 'final') return t('pages.y3_7.finalWinDesc')
  return currentMine.value?.desc || ''
})

const toastButtonLabel = computed(() => {
  if (dialog.kind === 'failure') return t('pages.y3_7.retryTrial')
  if (dialog.kind === 'final') return t('pages.y3_7.proceedToCoronation')
  return t('pages.y3_7.continuePurging')
})

const toastTitleColor = computed(() => {
  if (dialog.kind === 'failure') return '#fb7185'
  if (dialog.kind === 'final') return '#fbbf24'
  return '#34d399'
})

function spellName(type) {
  return t(`pages.y3_7.spells.${type}.name`)
}

function schedule(callback, delay) {
  const timerId = window.setTimeout(() => {
    timers.delete(timerId)
    callback()
  }, delay)
  timers.add(timerId)
  return timerId
}

function clearTimers() {
  timers.forEach((timerId) => window.clearTimeout(timerId))
  timers.clear()
}

function resetTransientState() {
  isAnimating.value = false
  overlayActive.value = false
  transientWrongSpell.value = ''
  orbState.value = 'idle'
}

function castSpell(spellType) {
  if (!currentMine.value || actionLocked.value) return

  if (spellType === currentMine.value.type) {
    isAnimating.value = true
    orbState.value = 'shatter'

    schedule(() => {
      isAnimating.value = false
      dialog.kind = 'success'
      dialog.show = true
    }, 400)
    return
  }

  isAnimating.value = true
  hp.value = Math.max(0, hp.value - 1)
  transientWrongSpell.value = spellType
  orbState.value = 'shake'
  overlayActive.value = true

  schedule(() => {
    orbState.value = 'idle'
    overlayActive.value = false
    isAnimating.value = false

    if (hp.value <= 0) {
      dialog.kind = 'failure'
      dialog.show = true
    }
  }, 500)

  if (hp.value > 0) {
    schedule(() => {
      if (!dialog.show) {
        transientWrongSpell.value = ''
      }
    }, 1200)
  }
}

function handleToastAction() {
  if (!dialog.show) return

  if (dialog.kind === 'failure') {
    dialog.show = false
    currentIndex.value = 0
    hp.value = maxHp
    resetTransientState()
    ready.value = true
    return
  }

  if (dialog.kind === 'success') {
    dialog.show = false
    resetTransientState()
    currentIndex.value += 1

    if (currentIndex.value >= mines.value.length) {
      dialog.kind = 'final'
      dialog.show = true
    }
    return
  }

  emit('complete', {
    year: 'y3',
    nodeId: 7,
    game: 'bog-sweeper-casting',
    hpLeft: hp.value,
  })
}

onMounted(() => {
  schedule(() => {
    ready.value = true
  }, 500)
})

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.bog-sweeper-root {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  color: #fff;
  background: radial-gradient(circle at 50% 100%, #064e3b 0%, #0f172a 60%, #020617 100%);
}

.bubbles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bubble {
  position: absolute;
  bottom: -50px;
  border-radius: 50%;
  opacity: 0;
  background: radial-gradient(circle at 30% 30%, rgba(52, 211, 153, 0.4), rgba(6, 78, 59, 0.8));
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  animation: rise 4s infinite ease-in;
}

@keyframes rise {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 0;
  }

  20% {
    opacity: 0.8;
  }

  100% {
    transform: translateY(-80vh) scale(1.5);
    opacity: 0;
  }
}

.damage-overlay {
  position: absolute;
  inset: 0;
  z-index: 18;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(circle, transparent 50%, rgba(239, 68, 68, 0.4) 100%);
  transition: opacity 0.2s ease;
}

.damage-overlay.active {
  opacity: 1;
}

.game-container {
  position: relative;
  z-index: 10;
  width: min(700px, 100%);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 28px 20px 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 40px;
}

.title-box h2 {
  margin: 0 0 5px;
  color: #34d399;
  font-family: Georgia, serif;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
}

.title-box p {
  margin: 0;
  color: #94a3b8;
  font-family: Georgia, serif;
  font-size: 1rem;
  font-style: italic;
  line-height: 1.5;
}

.status-box {
  min-width: 180px;
  padding: 10px 15px;
  border: 1px solid #1e293b;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.5);
  text-align: right;
}

.status-label {
  margin-bottom: 4px;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 700;
}

.progress-value {
  color: #34d399;
  font-size: 1.1rem;
  font-weight: 700;
}

.hp {
  margin-top: 6px;
  color: #fb7185;
  font-size: 1.05rem;
  font-weight: 700;
}

.swamp-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 330px;
}

.mine-orb {
  position: relative;
  width: min(280px, 74vw);
  height: min(280px, 74vw);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 2px solid #475569;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #1e293b, #0f172a);
  box-shadow:
    0 0 40px rgba(0, 0, 0, 0.8),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  text-align: center;
  animation: float 3s ease-in-out infinite;
  transition: 0.3s;
}

.mine-orb::before {
  content: "\26A0\FE0F";
  margin-bottom: 10px;
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.mine-text {
  color: #f8fafc;
  font-size: clamp(0.95rem, 2.2vw, 1.2rem);
  font-weight: 900;
  line-height: 1.35;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }
}

.shake {
  border-color: #ef4444 !important;
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.6) !important;
  animation: shakeError 0.4s ease-in-out;
}

@keyframes shakeError {
  0%,
  100% {
    transform: translateX(0);
  }

  20%,
  60% {
    transform: translateX(-15px) rotate(-5deg);
  }

  40%,
  80% {
    transform: translateX(15px) rotate(5deg);
  }
}

.shatter {
  animation: shatterAnim 0.5s forwards;
}

@keyframes shatterAnim {
  0% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1);
  }

  50% {
    transform: scale(1.3);
    opacity: 0.8;
    filter: brightness(2);
  }

  100% {
    transform: scale(0);
    opacity: 0;
    filter: brightness(3);
  }
}

.spell-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 20px;
  border: 1px solid #1e293b;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(10px);
}

.spell-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 10px;
  border: 2px solid transparent;
  border-radius: 12px;
  color: #fff;
  background: #1e293b;
  font: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.spell-btn:hover:enabled {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.spell-btn:active:enabled {
  transform: scale(0.95);
}

.spell-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.spell-icon {
  font-size: 1.8rem;
}

.spell-name {
  font-family: Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
}

.spell-desc {
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1.2;
  text-align: center;
}

.btn-fatal:hover:enabled {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.btn-severe:hover:enabled {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.btn-minor:hover:enabled {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.toast {
  position: absolute;
  top: 40%;
  left: 50%;
  z-index: 50;
  display: none;
  width: min(450px, 90%);
  padding: 25px;
  border: 2px solid #34d399;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  text-align: center;
  transform: translate(-50%, -50%);
}

.toast.show {
  display: block;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% {
    transform: translate(-50%, -40%) scale(0.8);
    opacity: 0;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.toast h3 {
  margin: 0 0 15px;
  font-family: Georgia, serif;
  font-size: 1.6rem;
}

.toast p {
  margin: 0 0 20px;
  color: #cbd5e1;
  font-family: Georgia, serif;
  font-size: 1.05rem;
  line-height: 1.6;
}

.next-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 999px;
  color: #022c22;
  background: #34d399;
  font: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.next-btn:hover {
  transform: translateY(-2px);
  background: #10b981;
}

@media (max-width: 760px) {
  .game-container {
    padding-top: 20px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 28px;
  }

  .status-box {
    text-align: left;
  }

  .swamp-center {
    min-height: 280px;
  }

  .spell-panel {
    grid-template-columns: 1fr;
  }
}
</style>
