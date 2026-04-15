<template>
  <div class="archive-game">
    <div class="header">
      <h2><i class="fas fa-scroll"></i> {{ t('pages.y2_4.title') }}</h2>
      <p>{{ t('pages.y2_4.intro') }}</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-text">{{ Math.min(currentCaseIndex + 1, cases.length) }} / {{ cases.length }}</div>
    </div>

    <section class="case-arena">
      <KnowledgeGuidePanel
        :title="t('pages.y2_4.guide.button')"
        :body="t('pages.y2_4.guide.body')"
        :items="guideItems"
      />
      <!-- 当前卡片 -->
      <div v-if="currentCase" class="case-card" :class="{ 'reveal-correct': feedbackCorrect, 'reveal-wrong': feedbackWrong }">
        <div class="portrait">{{ currentCase.icon }}</div>
        <div class="profile-data">
          <div class="profile-row">
            <span class="label">{{ currentCase.label }}:</span>
            <span class="value">{{ currentCase.track }}</span>
          </div>
          <div class="profile-row">
            <span class="label">{{ t('pages.y2_4.labels.gpa') }}:</span>
            <span class="value" :class="currentCase.gpaClass">{{ currentCase.gpa }}</span>
          </div>
          <div class="profile-row">
            <span class="label">{{ t('pages.y2_4.labels.evidence') }}:</span>
            <span class="value evidence">{{ currentCase.evidence }}</span>
          </div>
        </div>

        <!-- 选择按钮（未回答） -->
        <div v-if="!answered" class="choices">
          <button v-for="(choice, index) in currentCase.choices" :key="index" type="button" class="btn-choice" @click="judgeCase(index)">
            {{ choice }}
          </button>
        </div>

        <!-- 反馈显示（已回答） -->
        <div v-else ref="resultRef" class="feedback-box" :class="{ correct: feedbackCorrect, wrong: feedbackWrong }">
          <div v-if="feedbackCorrect" class="feedback">
            <i class="fas fa-check-circle"></i>
            <div class="truth-title">{{ currentCase.truthTitle }}</div>
            <div class="truth-text">{{ currentCase.truth }}</div>
          </div>
          <div v-else class="feedback">
            <i class="fas fa-times-circle"></i>
            <div class="error-title">{{ t('pages.y2_4.wrongAnswer') }}</div>
            <div class="truth-text">{{ currentCase.truthTitle }}: {{ currentCase.truth }}</div>
          </div>

          <!-- 下一个或完成按钮 -->
          <button v-if="currentCaseIndex < cases.length - 1" type="button" class="btn-next" @click="nextCase">
            <i class="fas fa-arrow-right"></i> {{ t('common.actions.next') }}
          </button>
          <button v-else type="button" class="btn-complete" @click="completeArchive">
            <i class="fas fa-check"></i> {{ t('pages.y2_4.complete') }}
          </button>
        </div>
      </div>

      <!-- 完成画面 -->
      <div v-else class="completion-screen">
        <div class="completion-icon">✨</div>
        <h3>{{ t('pages.y2_4.completionTitle') }}</h3>
        <p>{{ completedCorrect }} / {{ cases.length }} {{ t('pages.y2_4.correctLabel') }}</p>
        <p class="completion-copy">{{ t('pages.y2_4.completionCopy') }}</p>
        <div class="completion-actions">
          <button type="button" class="btn-retry" @click="retryGame">
            {{ t('common.actions.retry') }}
          </button>
          <button type="button" class="btn-claim" @click="emit('complete', { rewardCoins })">
            {{ t('pages.y2_4.claimAndContinue', { coins: rewardCoins }) }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const rewardCoins = 30
const emit = defineEmits(['complete', 'close'])
const { tm, t } = useAppI18n()

const caseMeta = [
  { id: 1, icon: '🧑‍💻', gpaClass: 'danger', truthClass: 'success' },
  { id: 2, icon: '👩‍🎓', gpaClass: 'gold', truthClass: 'danger' },
  { id: 3, icon: '👨‍💼', gpaClass: 'warning', truthClass: 'success' },
  { id: 4, icon: '👩‍🔬', gpaClass: 'success', truthClass: 'success' },
  { id: 5, icon: '🧑‍🎨', gpaClass: 'gold', truthClass: 'success' },
]

const cases = computed(() => {
  const localizedCases = tm('pages.y2_4.cases') || []
  return caseMeta.map((meta, index) => ({
    ...meta,
    ...(localizedCases[index] || {}),
  }))
})

const currentCaseIndex = ref(0)
const answered = ref(false)
const feedbackCorrect = ref(false)
const feedbackWrong = ref(false)
const completedCorrect = ref(0)
const resultRef = ref(null)
const guideItems = computed(() => tm('pages.y2_4.guide.items') || [])

const currentCase = computed(() => {
  return cases.value[currentCaseIndex.value] || null
})

const progressPercent = computed(() => {
  if (cases.value.length === 0) return 0
  const current = Math.min(currentCaseIndex.value + 1, cases.value.length)
  return (current / cases.value.length) * 100
})

function judgeCase(choiceIndex) {
  answered.value = true
  const correctIndex = currentCase.value?.correctIndex ?? 0
  const isCorrect = choiceIndex === correctIndex
  feedbackCorrect.value = isCorrect
  feedbackWrong.value = !isCorrect
  if (isCorrect) {
    completedCorrect.value += 1
  }
  nextTick(() => {
    resultRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function nextCase() {
  currentCaseIndex.value += 1
  answered.value = false
  feedbackCorrect.value = false
  feedbackWrong.value = false
}

function completeArchive() {
  // 清空数据显示完成画面
  currentCaseIndex.value = cases.value.length
}

function retryGame() {
  currentCaseIndex.value = 0
  answered.value = false
  feedbackCorrect.value = false
  feedbackWrong.value = false
  completedCorrect.value = 0
}
</script>

<style scoped>
.archive-game {
  min-height: 100%;
  padding: 26px;
  color: #e8e6e3;
  background: radial-gradient(circle at center, #1e2022 0%, #000 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  width: 100%;
  max-width: 600px;
  text-align: center;
  margin-bottom: 32px;
}

.header h2 {
  margin: 0 0 10px;
  color: #f9d976;
  font-size: 2.1rem;
  font-family: Georgia, serif;
}

.header p {
  margin: 0 0 24px;
  color: #a6b1c3;
  line-height: 1.6;
  font-family: Georgia, serif;
  font-style: italic;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fde68a);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #9ca3af;
  font-weight: 700;
}

.case-arena {
  width: min(620px, 100%);
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-card {
  width: 100%;
  padding: 40px 32px;
  background: linear-gradient(135deg, #2a2d34, #1b1c20);
  border: 2px solid #4a4d55;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  animation: card-slide-in 0.4s ease;
}

.case-card.reveal-correct {
  border-color: #2ecc71;
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(39, 174, 96, 0.1));
  box-shadow: 0 0 30px rgba(46, 204, 113, 0.3), inset 0 0 20px rgba(46, 204, 113, 0.05);
}

.case-card.reveal-wrong {
  border-color: #e74c3c;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(192, 57, 43, 0.1));
  box-shadow: 0 0 30px rgba(231, 76, 60, 0.3), inset 0 0 20px rgba(231, 76, 60, 0.05);
}

.portrait {
  margin-bottom: 20px;
  font-size: 4rem;
  animation: bounce-in 0.5s ease;
}

.profile-data {
  margin: 24px 0;
  padding: 20px;
  border: 1px dashed #4a4d55;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  text-align: left;
}

.profile-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  line-height: 1.6;
}

.profile-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 700;
  min-width: 100px;
  color: #d1b896;
}

.value {
  flex: 1;
  color: #c6c1bc;
}

.value.evidence {
  color: #f9d976;
  font-weight: 900;
}

.gold { color: #f9d976; }
.danger { color: #e74c3c; }
.warning { color: #f39c12; }
.success { color: #2ecc71; }

.choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.btn-choice {
  padding: 15px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #e8edf9;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.btn-choice:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.btn-choice:active {
  transform: translateY(0);
}

.feedback-box {
  margin-top: 28px;
  padding: 24px;
  border-radius: 14px;
  background: rgba(46, 204, 113, 0.08);
  border: 1px solid rgba(46, 204, 113, 0.3);
  animation: fade-in-scale 0.4s ease;
}

.feedback-box.wrong {
  background: rgba(231, 76, 60, 0.08);
  border-color: rgba(231, 76, 60, 0.3);
}

.feedback {
  text-align: center;
}

.feedback i {
  font-size: 2.2rem;
  margin-bottom: 10px;
  display: block;
}

.feedback-box.correct .feedback i {
  color: #2ecc71;
}

.feedback-box.wrong .feedback i {
  color: #e74c3c;
}

.truth-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: #f9d976;
  margin-bottom: 10px;
}

.error-title {
  font-size: 1rem;
  font-weight: 900;
  color: #e74c3c;
  margin-bottom: 10px;
}

.truth-text {
  color: #c6c1bc;
  line-height: 1.6;
  font-style: italic;
}

.btn-next,
.btn-complete {
  width: 100%;
  max-width: 300px;
  margin: 20px auto 0;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-next:hover,
.btn-complete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(46, 204, 113, 0.3);
}

.completion-screen {
  width: 100%;
  text-align: center;
  padding: 40px;
}

.completion-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
  animation: rotate-scale 0.6s ease;
}

.completion-screen h3 {
  color: #f9d976;
  font-size: 1.8rem;
  margin-bottom: 12px;
}

.completion-screen p {
  color: #a6b1c3;
  font-size: 1.1rem;
  margin-bottom: 12px;
  font-weight: 700;
}

.completion-copy {
  color: #d1c7a1;
  font-size: 0.95rem;
  margin-bottom: 24px;
  line-height: 1.6;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-retry {
  min-width: 130px;
  padding: 12px 18px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 900;
}

.btn-retry:hover {
  background: rgba(255, 255, 255, 0.14);
}

.btn-claim {
  width: 200px;
  margin: 0 auto;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9d976, #e3be73);
  color: #2c5a6e;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s;
}

.btn-claim:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(249, 217, 118, 0.3);
}

@keyframes card-slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounce-in {
  0% { transform: scale(0.3); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fade-in-scale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes rotate-scale {
  from {
    transform: rotate(-10deg) scale(0.5);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .case-card {
    padding: 24px;
  }

  .portrait {
    font-size: 3rem;
  }

  .profile-data {
    padding: 16px;
  }

  .choices {
    grid-template-columns: 1fr;
  }
}
</style>
