<template>
  <div class="ultimate-trial-page">
    <KnowledgeGuidePanel
      class="guide-panel"
      :title="t('pages.y2_7.guide.title')"
      :body="t('pages.y2_7.guide.body')"
      :items="guideItems"
    />
    <div class="room">
      <h2 class="header-title"><i class="fas fa-star"></i> {{ t('pages.y2_7.title') }}</h2>

      

      <div v-if="!quizPassed" class="question-box">
        <p class="question-desc">{{ t('pages.y2_7.question') }}</p>

        <button
          v-for="answer in answers"
          :key="answer.key"
          class="btn-ans"
          type="button"
          @click="checkAnswer(answer.correct)"
        >
          {{ answer.label }}
        </button>

        <div v-if="errorMessage" class="error-msg" :class="{ shaking: errorShake }">
          {{ errorMessage }}
        </div>
      </div>

      <div v-else class="success-box">
        <h3 class="success-title">
          <span class="success-mark">✅</span>
          {{ t('pages.y2_7.successTitle') }}
          <br>
          {{ t('pages.y2_7.successPrompt') }}
        </h3>

        <button
          v-show="machineVisible"
          class="gacha"
          :class="{ shaking: isSpinning }"
          type="button"
          :disabled="isSpinning || ticketOpen"
          @click="playGacha"
        >
          🎰
        </button>
      </div>
    </div>

    <div class="overlay" :class="{ active: ticketOpen }"></div>

    <div class="golden-ticket" :class="{ active: ticketOpen }" :aria-hidden="(!ticketOpen).toString()">
      <div class="ticket-title">{{ t('pages.y2_7.ticketTitle') }}</div>
      <div class="ticket-subtitle">{{ t('pages.y2_7.ticketSubtitle') }}</div>

      <div class="reward-content">
        <i class="fas fa-gem" aria-hidden="true"></i>{{ t('pages.y2_7.rewardBox') }}
      </div>

      <p class="lore-text" v-html="t('pages.y2_7.ticketCopy')"></p>
      <button class="btn-claim" type="button" @click="claimTicket">
        {{ t('pages.y2_7.claim') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const quizPassed = ref(false)
const machineVisible = ref(false)
const errorMessage = ref('')
const errorShake = ref(false)
const isSpinning = ref(false)
const ticketOpen = ref(false)

let machineRevealTimer = 0
let spinTimer = 0

const guideItems = computed(() => tm('pages.y2_7.guide.items') || [])

const answers = computed(() => ([
  { key: 'a', label: t('pages.y2_7.answers.a'), correct: false },
  { key: 'b', label: t('pages.y2_7.answers.b'), correct: true },
  { key: 'c', label: t('pages.y2_7.answers.c'), correct: false },
]))

function clearTimers() {
  if (machineRevealTimer) {
    window.clearTimeout(machineRevealTimer)
    machineRevealTimer = 0
  }

  if (spinTimer) {
    window.clearTimeout(spinTimer)
    spinTimer = 0
  }
}

function checkAnswer(isCorrect) {
  if (isCorrect) {
    quizPassed.value = true
    errorMessage.value = ''
    errorShake.value = false
    machineVisible.value = false
    clearTimers()
    machineRevealTimer = window.setTimeout(() => {
      machineVisible.value = true
    }, 100)
    return
  }

  errorMessage.value = t('pages.y2_7.error')
  errorShake.value = false
  window.requestAnimationFrame(() => {
    errorShake.value = true
  })
}

function playGacha() {
  if (isSpinning.value || ticketOpen.value) return

  isSpinning.value = true
  clearTimers()
  spinTimer = window.setTimeout(() => {
    isSpinning.value = false
    ticketOpen.value = true
  }, 1500)
}

function claimTicket() {
  ticketOpen.value = false
  emit('complete', { game: 'golden-ticket', reward: 'prophecy-consultation' })
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.ultimate-trial-page {
  min-height: 100%;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  background: radial-gradient(circle, #2b1b3d 0%, #0a0a0a 100%);
  position: relative;
  overflow: hidden;
}

.room {
  width: min(600px, 100%);
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 40px;
  border-radius: 20px;
  border: 2px dashed #f9d976;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
}

.header-title {
  margin: 0 0 20px;
  color: #f9d976;
  font-family: Georgia, serif;
  letter-spacing: 1px;
  font-size: 2.2rem;
}

.question-desc {
  margin: 0 0 25px;
  font-size: 1.15rem;
  color: #e0e6ed;
  line-height: 1.5;
  font-family: Georgia, serif;
}

.btn-ans {
  width: 100%;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  font-size: 1.05rem;
  font-weight: 700;
  text-align: left;
  line-height: 1.4;
  background: transparent;
  color: #f9d976;
  border: 1px solid #f9d976;
}

.btn-ans:hover {
  background: #f9d976;
  color: #000;
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(249, 217, 118, 0.4);
}

.error-msg {
  margin-top: 15px;
  color: #e74c3c;
  font-weight: 700;
  line-height: 1.45;
}

.success-box {
  min-height: 220px;
}

.success-title {
  margin: 0;
  color: #2ecc71;
  font-family: Georgia, serif;
  line-height: 1.5;
  font-size: 1.3rem;
}

.success-mark {
  margin-right: 6px;
}

.gacha {
  display: block;
  margin: 20px auto 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 6rem;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 0 20px rgba(249, 217, 118, 0.5));
}

.gacha:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 30px rgba(249, 217, 118, 0.8));
}

.gacha:disabled {
  cursor: default;
}

.shaking {
  animation: shake 0.5s infinite;
  pointer-events: none;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  z-index: 90;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.golden-ticket {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: min(500px, calc(100% - 32px));
  z-index: 100;
  background: linear-gradient(135deg, #ffd700 0%, #fdb931 50%, #996515 100%);
  padding: 40px;
  border-radius: 15px;
  border: 4px dashed #fff;
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.5);
  text-align: center;
  color: #5c3a00;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.golden-ticket.active {
  transform: translate(-50%, -50%) scale(1);
}

.ticket-title {
  font-size: 2.2rem;
  font-weight: 900;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
  font-family: Georgia, serif;
}

.ticket-subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 25px;
  border-bottom: 2px solid #5c3a00;
  padding-bottom: 15px;
}

.reward-content {
  background: rgba(255, 255, 255, 0.3);
  padding: 20px;
  border-radius: 10px;
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.reward-content i {
  color: #d4af37;
  margin-right: 10px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
}

.lore-text {
  font-size: 1rem;
  margin: 0 0 20px;
  line-height: 1.6;
  font-weight: 600;
  font-family: Georgia, serif;
}

.btn-claim {
  width: 100%;
  background: #5c3a00;
  color: #ffd700;
  border: none;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 5px 15px rgba(92, 58, 0, 0.5);
}

.btn-claim:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(92, 58, 0, 0.7);
  background: #3d2600;
}

.shaking.error-msg,
.error-msg.shaking {
  animation: error-shake 0.3s ease;
}

@keyframes error-shake {
  0% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0) scale(1.1);
  }
  25% {
    transform: rotate(15deg) scale(1.1);
  }
  75% {
    transform: rotate(-15deg) scale(1.1);
  }
}

@media (max-width: 640px) {
  .ultimate-trial-page {
    padding: 14px;
  }

  .room {
    padding: 24px 18px;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .question-desc {
    font-size: 1rem;
  }

  .golden-ticket {
    padding: 28px 20px;
  }

  .ticket-title {
    font-size: 1.7rem;
  }

  .reward-content {
    font-size: 1.1rem;
  }
  .guide-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }
}
</style>
