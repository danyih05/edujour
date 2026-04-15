<template>
  <div class="astral-coronation-root">
    <button class="close-btn" type="button" @click="$emit('close')">
      {{ t('pages.y3_8.back') }}
    </button>

    <section class="room">
      <h2>{{ crownIcon }} {{ t('pages.y3_8.title') }}</h2>

      <article class="certificate">
        <div class="cert-header">{{ t('pages.y3_8.certHeader') }}</div>

        <div class="cert-body">
          {{ t('pages.y3_8.certIntro') }}<br>
          <span class="cert-name">{{ playerName }}</span><br><br>
          {{ t('pages.y3_8.certBody') }}<br><br>
          {{ t('pages.y3_8.titleGrant') }}<br>
          {{ t('pages.y3_8.certBlessing') }}
        </div>

        <div class="wax-seal">
          <span class="seal-icon">{{ sealIcon }}</span>
          <span>{{ t('pages.y3_8.sealTop') }}</span>
          <span class="seal-bottom">{{ t('pages.y3_8.sealBottom') }}</span>
        </div>
      </article>

      <div class="rewards">
        <div v-for="reward in rewards" :key="reward.label" class="reward-item">
          <span class="reward-icon">{{ reward.icon }}</span>
          <span>{{ reward.label }}</span>
        </div>
      </div>

      <button class="complete-btn" type="button" @click="$emit('complete', { game: 'astral-coronation' })">
        {{ t('pages.y3_8.complete') }}
      </button>
    </section>
  </div>
</template>

<script setup>
import confetti from 'canvas-confetti'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { useGameStore } from '@/stores/game'

defineEmits(['complete', 'close'])

const store = useGameStore()
const { t, tm } = useAppI18n()

const fallbackName = ref('')
const crownIcon = '\u{1F451}'
const sealIcon = '\u{1F3DB}'
const rewardIcons = ['\u{1F3AB}', '\u{1F4AC}', '\u2709\uFE0F', '\u{1F528}']

let confettiFrameId = 0

const playerName = computed(() => (
  store.travelerProfile?.name || fallbackName.value || t('pages.y3_8.defaultPlayerName')
))

const rewards = computed(() => {
  const items = tm('pages.y3_8.rewards') || []
  return items.map((label, index) => ({
    label,
    icon: rewardIcons[index] || '\u2728',
  }))
})

function startConfettiBurst() {
  const duration = 6000
  const endTime = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: ['#fde047', '#f59e0b', '#38bdf8', '#d8b4fe'],
    })
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: ['#fde047', '#f59e0b', '#38bdf8', '#d8b4fe'],
    })

    if (Date.now() < endTime) {
      confettiFrameId = window.requestAnimationFrame(frame)
    }
  }

  frame()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    fallbackName.value = window.localStorage.getItem('userName') || ''
    startConfettiBurst()
  }
})

onBeforeUnmount(() => {
  if (confettiFrameId) {
    window.cancelAnimationFrame(confettiFrameId)
  }
})
</script>

<style scoped>
.astral-coronation-root {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  color: #fff;
  background: radial-gradient(circle at center, #2c1e4a 0%, #0d0914 100%);
}

.close-btn {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 10;
  padding: 10px 16px;
  border: 1px solid rgba(253, 224, 71, 0.35);
  border-radius: 999px;
  color: #fde68a;
  background: rgba(13, 9, 20, 0.72);
  backdrop-filter: blur(12px);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.room {
  width: min(850px, 100%);
  text-align: center;
}

h2 {
  margin: 0 0 30px;
  color: #fde047;
  font-family: Georgia, serif;
  font-size: clamp(2rem, 5vw, 2.5rem);
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(253, 224, 71, 0.6);
}

.certificate {
  position: relative;
  margin-bottom: 40px;
  padding: clamp(34px, 6vw, 60px) clamp(26px, 5vw, 50px);
  border: 8px double #c8a165;
  border-radius: 5px;
  color: #2c1e16;
  background:
    repeating-linear-gradient(
      135deg,
      rgba(139, 90, 43, 0.04) 0,
      rgba(139, 90, 43, 0.04) 2px,
      transparent 2px,
      transparent 14px
    ),
    linear-gradient(135deg, #fffcf2, #f5ecd5);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.cert-header {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #8b5a2b;
  color: #8b5a2b;
  font-family: Georgia, serif;
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cert-body {
  font-family: "Times New Roman", Times, serif;
  font-size: clamp(1.05rem, 2.4vw, 1.25rem);
  line-height: 1.8;
}

.cert-name {
  display: inline-block;
  margin: 0 10px;
  color: #b22222;
  border-bottom: 2px dotted #b22222;
  font-family: Georgia, serif;
  font-size: clamp(1.8rem, 5vw, 2.2rem);
  font-weight: 700;
}

.wax-seal {
  position: absolute;
  right: 45px;
  bottom: 35px;
  width: 90px;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 3px double #800000;
  border-radius: 50%;
  color: #fff;
  background: #b22222;
  box-shadow: 2px 4px 15px rgba(0, 0, 0, 0.5);
  transform: rotate(-15deg);
  font-family: "Times New Roman", serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.1;
}

.seal-icon {
  margin-bottom: 4px;
  font-size: 1.5rem;
}

.seal-bottom {
  margin-top: 3px;
  opacity: 0.82;
  font-size: 0.62rem;
}

.rewards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  border: 1px solid #fde047;
  border-radius: 12px;
  color: #fde047;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  font-size: 1.05rem;
  font-weight: 700;
  cursor: default;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.reward-item:hover {
  transform: translateY(-5px);
  background: rgba(253, 224, 71, 0.15);
  box-shadow: 0 10px 20px rgba(253, 224, 71, 0.3);
}

.reward-icon {
  font-size: 1.5rem;
  flex: 0 0 auto;
}

.complete-btn {
  margin-top: 28px;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  color: #2c1e4a;
  background: linear-gradient(135deg, #fde047, #f59e0b);
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.28);
  font: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(245, 158, 11, 0.34);
}

@media (max-width: 760px) {
  .astral-coronation-root {
    align-items: flex-start;
    padding-top: 86px;
  }

  .rewards {
    grid-template-columns: 1fr;
  }

  .reward-item {
    font-size: 0.98rem;
  }

  .wax-seal {
    position: static;
    margin: 28px auto 0;
    transform: rotate(-10deg);
  }
}
</style>
