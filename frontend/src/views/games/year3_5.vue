<template>
  <div class="wildcat-root">
    <KnowledgeGuidePanel
      :title="t('pages.y3_5.guide.title')"
      :body="t('pages.y3_5.guide.body')"
      :items="guideItems"
    />

    <div class="game-screen">
      <div class="status-bar">
        <div><i class="fas fa-paw" style="color:#f5b342;"></i> {{ pageCopy.statusLabel }}</div>
        <div class="hearts">{{ currentNode.hearts }}</div>
      </div>

      <div class="character-stage">
        <div class="cat-avatar" :class="catMoodClass">{{ currentNode.emoji }}</div>
      </div>

      <div class="dialogue-box">
        <div class="speaker-name">{{ pageCopy.speakerName }}</div>
        <div class="text-content" v-html="currentNode.text"></div>
        <div class="choices-area">
          <button
            v-for="(choice, index) in currentNode.choices"
            :key="`${currentNodeId}-${index}`"
            class="choice-btn"
            type="button"
            v-html="choice.text"
            @click="renderNode(choice.nextId)"
          />
        </div>
      </div>
    </div>
    <!-- 自定义完成模态框 -->
    <Transition name="modal-fade">
      <div v-if="showCompleteModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-icon">
            <i class="fas fa-crown"></i>
          </div>
          <h3 class="modal-title">{{ t('pages.y3_5.modal.title') }}</h3>
          <p class="modal-message">{{ t('pages.y3_5.modal.message', { coins: rewardAmount }) }}</p>
          <div class="modal-actions">
            <button class="modal-btn restart" @click="restartGame">
              {{ t('pages.y3_5.modal.restart') }}
            </button>
            <button class="modal-btn confirm" @click="confirmComplete">
              {{ t('pages.y3_5.modal.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { YEAR3_RECOMMENDATION_ROUTES } from '@/config/year3RecommendationQuestions'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const emit = defineEmits(['complete'])
const { currentLanguage, t, tm, localize } = useAppI18n()

const previousTitle = ref(typeof document !== 'undefined' ? document.title : '')
const showCompleteModal = ref(false)
const rewardAmount = ref(50)   // 与原有奖励值一致
const pageCopy = computed(() => tm('pages.y3_5') || {})
const guideItems = computed(() => tm('pages.y3_5.guide.items') || [])
const routes = computed(() => YEAR3_RECOMMENDATION_ROUTES)
const selectedRouteId = ref('')
const currentQuestionIndex = ref(0)
const selectedOptionIndex = ref(null)
const answerHistory = ref([])

const selectedRoute = computed(() => routes.value.find((route) => route.id === selectedRouteId.value) || null)
const currentQuestion = computed(() => selectedRoute.value?.questions?.[currentQuestionIndex.value] || null)
const selectedOption = computed(() => {
  if (selectedOptionIndex.value === null || !currentQuestion.value) return null
  return currentQuestion.value.options[selectedOptionIndex.value] || null
})
const correctCount = computed(() => answerHistory.value.filter((answer) => answer.correct).length)
const currentNodeId = computed(() => (
  selectedRoute.value ? `${selectedRoute.value.id}-${currentQuestionIndex.value}` : 'start'
))

function asHtml(value) {
  return String(value || '').replace(/\n/g, '<br>')
}

function copyValue(key, fallback) {
  return pageCopy.value[key] || fallback
}

function makeRouteChoice(route) {
  return {
    nextId: `route:${route.id}`,
    text: `<strong>${localize(route.title)}</strong><br><span>${localize(route.subtitle)}</span>`,
  }
}

function makeAnswerChoice(option, index) {
  return {
    nextId: `answer:${index}`,
    text: asHtml(localize(option)),
  }
}

const currentNode = computed(() => {
  if (!selectedRoute.value) {
    return {
      text: `<strong>${copyValue('introTitle', 'Recommendation Request Adventure')}</strong><br>${copyValue('intro', 'Choose a scenario and practice the recommendation request wording.')}`,
      emoji: '🐶',
      mood: 'normal',
      hearts: copyValue('chooseRoute', 'Choose a route'),
      choices: routes.value.map((route) => makeRouteChoice(route)),
    }
  }

  const question = currentQuestion.value
  if (!question) {
    return {
      text: copyValue('emptyQuestion', 'No question available.'),
      emoji: '🐾',
      mood: 'normal',
      hearts: '',
      choices: [{ text: copyValue('restart', 'Restart'), nextId: 'start' }],
    }
  }

  const answered = selectedOption.value !== null
  const answerIsCorrect = Boolean(selectedOption.value?.correct)
  const answerCopy = answered
    ? `<div class="answer-result ${answerIsCorrect ? 'correct' : 'wrong'}">${answerIsCorrect ? copyValue('correctPrefix', '正确！') : copyValue('wrongPrefix', '还差一点')}</div><div class="answer-explanation"><strong>${copyValue('explanationLabel', '解析')}</strong><br>${asHtml(localize(question.explanation))}</div>`
    : ''

  return {
    text: `<strong>${localize(question.title)}</strong><br>${asHtml(localize(question.prompt))}${answerCopy}`,
    emoji: answered ? (answerIsCorrect ? '😻' : '😾') : selectedRoute.value.emoji,
    mood: answered ? (answerIsCorrect ? 'happy' : 'angry') : 'normal',
    hearts: `${copyValue('progressLabel', '进度')} ${currentQuestionIndex.value + 1}/${selectedRoute.value.questions.length} · ${copyValue('scoreLabel', '答对')} ${correctCount.value}/${answerHistory.value.length}`,
    choices: answered
      ? [{
          text: currentQuestionIndex.value === selectedRoute.value.questions.length - 1
            ? copyValue('finishRoute', '完成路线')
            : copyValue('nextQuestion', '下一题'),
          nextId: currentQuestionIndex.value === selectedRoute.value.questions.length - 1 ? 'exit' : 'next',
        }]
      : question.options.map((option, index) => makeAnswerChoice(option, index)),
  }
})
const catMoodClass = computed(() => ({
  'angry-shake': currentNode.value.mood === 'angry',
  'happy-bounce': currentNode.value.mood === 'happy',
}))

function restartGame() {
  showCompleteModal.value = false
  selectedRouteId.value = ''
  currentQuestionIndex.value = 0
  selectedOptionIndex.value = null
  answerHistory.value = []
}

function renderNode(nodeId) {
  if (nodeId === 'start') {
    restartGame()
    return
  }

  if (nodeId === 'next') {
    currentQuestionIndex.value += 1
    selectedOptionIndex.value = null
    return
  }

  if (nodeId.startsWith('route:')) {
    selectedRouteId.value = nodeId.replace('route:', '')
    currentQuestionIndex.value = 0
    selectedOptionIndex.value = null
    answerHistory.value = []
    return
  }

  if (nodeId.startsWith('answer:')) {
    if (!currentQuestion.value || selectedOptionIndex.value !== null) return
    const choiceIndex = Number(nodeId.replace('answer:', ''))
    const option = currentQuestion.value.options[choiceIndex]
    if (!option) return
    selectedOptionIndex.value = choiceIndex
    answerHistory.value.push({
      routeId: selectedRoute.value?.id || '',
      questionId: currentQuestion.value.id,
      question: localize(currentQuestion.value.title),
      answer: localize(option),
      correct: Boolean(option.correct),
    })
    return
  }

  if (nodeId === 'exit') {
    showCompleteModal.value = true   // 弹出模态框，不再 alert
  }
}

function confirmComplete() {
  showCompleteModal.value = false
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'gradquest:node-complete',
      payload: { year: 'y3', nodeId: 5, rewardCoins: rewardAmount.value },
    }, '*')
  }
  emit('complete', {
    year: 'y3',
    nodeId: 5,
    rewardCoins: rewardAmount.value,
    resultType: 'summary',
    resultData: {
      routeId: selectedRoute.value?.id || '',
      route: selectedRoute.value?.title || '',
      correct: correctCount.value,
      total: selectedRoute.value?.questions?.length || 0,
      answers: answerHistory.value.map((answer, index) => ({
        index: index + 1,
        question: answer.question,
        answer: answer.answer,
        correct: answer.correct,
      })),
      rewardCoins: rewardAmount.value,
    },
    language: currentLanguage.value,
  })
}

function closeModal() {
  showCompleteModal.value = false
}

onMounted(() => {
  restartGame()
})

watchEffect(() => {
  document.title = t('pages.y3_5.documentTitle')
})

onBeforeUnmount(() => {
  if (previousTitle.value) {
    document.title = previousTitle.value
  }
})
</script>

<style scoped>
.wildcat-root,
.wildcat-root * {
  box-sizing: border-box;
}

.wildcat-root {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #2b2b2b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-screen {
  background: linear-gradient(to bottom, #4a6984, #2a3b4c);
  width: 100%;
  max-width: 800px;
  min-height: 680px;
  border-radius: 20px;
  border: 4px solid #f5b342;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: rgba(0, 0, 0, 0.4);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  border-bottom: 2px dashed rgba(255, 255, 255, 0.2);
  z-index: 10;
}

.hearts {
  color: #fde68a;
  letter-spacing: 0;
  transition: 0.3s;
  text-align: right;
}

.character-stage {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.cat-avatar {
  font-size: 8.5rem;
  filter: drop-shadow(0 15px 15px rgba(0, 0, 0, 0.4));
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: bottom center;
}

.angry-shake {
  animation: shake 0.5s infinite;
  filter: drop-shadow(0 0 20px red);
}

.happy-bounce {
  animation: bounce 2s infinite ease-in-out;
  filter: drop-shadow(0 0 20px #f1c40f);
}

.dialogue-box {
  background: rgba(20, 20, 20, 0.85);
  border-top: 3px solid #f5b342;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.speaker-name {
  background: #f5b342;
  color: #1e1e1e;
  font-weight: 900;
  padding: 5px 20px;
  border-radius: 0 15px 15px 0;
  display: inline-block;
  align-self: flex-start;
  margin-top: -15px;
  box-shadow: 2px 2px 0 #d48b2c;
  font-size: 1.1rem;
  font-family: Georgia, serif;
}

.text-content {
  color: #fff;
  padding: 20px 30px;
  font-size: 1.08rem;
  line-height: 1.6;
  flex: 1;
  overflow-y: auto;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-family: Georgia, serif;
}

.choices-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px 20px;
  overflow-y: auto;
}

.choice-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: flex-start;
  font-weight: 600;
}

.choice-btn :deep(strong) {
  display: block;
  margin-bottom: 4px;
  color: #fde68a;
  font-size: 1.02rem;
}

.choice-btn :deep(span) {
  color: #e2e8f0;
  line-height: 1.45;
}

.choice-btn::before {
  content: '▶';
  margin-right: 10px;
  color: #f5b342;
  opacity: 0;
  transition: 0.2s;
}

.choice-btn:hover {
  background: rgba(245, 179, 66, 0.2);
  border-color: #f5b342;
  transform: translateX(5px);
}

.choice-btn:hover::before {
  opacity: 1;
}

.answer-result {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 0.92rem;
  font-weight: 900;
}

.answer-result.correct {
  color: #052e16;
  background: #86efac;
}

.answer-result.wrong {
  color: #450a0a;
  background: #fca5a5;
}

.answer-explanation {
  margin-top: 10px;
  padding: 12px 14px;
  border-left: 4px solid #f5b342;
  border-radius: 8px;
  background: rgba(245, 179, 66, 0.12);
  color: #fff7ed;
  font-size: 0.98rem;
  line-height: 1.55;
}

@keyframes shake {
  0% { transform: translateX(0) scale(1.1); }
  25% { transform: translateX(-10px) rotate(-5deg) scale(1.1); }
  50% { transform: translateX(10px) rotate(5deg) scale(1.1); }
  100% { transform: translateX(0) scale(1.1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* 模态框覆盖层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: linear-gradient(145deg, #1e2a3a, #0f172a);
  border: 2px solid #f5b342;
  border-radius: 28px;
  width: min(420px, 90%);
  padding: 28px 24px 32px;
  text-align: center;
  box-shadow: 0 30px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(245, 179, 66, 0.2);
  animation: modalPop 0.3s cubic-bezier(0.21, 1.11, 0.38, 1.02);
}

.modal-icon {
  font-size: 3.2rem;
  color: #f5b342;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 8px rgba(245, 179, 66, 0.6));
}

.modal-title {
  font-family: Georgia, serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #fde68a;
  margin: 0 0 12px;
}

.modal-message {
  color: #e2e8f0;
  font-size: 1.05rem;
  line-height: 1.5;
  margin-bottom: 28px;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.modal-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 28px;
  font-weight: 800;
  font-size: 1rem;
  background: linear-gradient(135deg, #f5b342, #e67e22);
  color: #1e1e2f;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4);
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.modal-btn.restart {
  background: linear-gradient(135deg, #6c757d, #495057);
}
@media (max-width: 768px) {
  .wildcat-root {
    padding: 8px;
  }

  .game-screen {
    height: auto;
    min-height: 560px;
  }

  .status-bar {
    padding: 10px 14px;
    font-size: 0.9rem;
  }

  .cat-avatar {
    font-size: 6rem;
  }

  .dialogue-box {
    height: auto;
    min-height: 240px;
  }

  .speaker-name {
    font-size: 0.9rem;
    padding: 4px 12px;
  }

  .text-content {
    padding: 12px 16px;
    font-size: 0.92rem;
  }

  .choice-btn {
    padding: 10px;
    font-size: 0.85rem;
    min-height: 48px;
  }

  .modal-card {
    width: 90%;
    padding: 18px;
  }
  .modal-title {
    font-size: 1.2rem;
  }
  .modal-message {
    font-size: 0.9rem;
  }
  .modal-btn {
    min-height: 48px;
  }
}
</style>
