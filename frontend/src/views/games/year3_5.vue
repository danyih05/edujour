<template>
  <div class="wildcat-root">
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

const emit = defineEmits(['complete'])
const { currentLanguage, t, tm } = useAppI18n()

const currentNodeId = ref('start')
const visitedNodes = ref(['start'])
const previousTitle = ref(typeof document !== 'undefined' ? document.title : '')
const showCompleteModal = ref(false)
const rewardAmount = ref(50)   // 与原有奖励值一致
const pageCopy = computed(() => tm('pages.y3_5') || {})
const storyTree = computed(() => pageCopy.value.tree || {})

const currentNode = computed(() => storyTree.value[currentNodeId.value] ?? storyTree.value.start ?? {
  text: '',
  emoji: '😼',
  mood: 'normal',
  hearts: '',
  choices: [],
})
const catMoodClass = computed(() => ({
  'angry-shake': currentNode.value.mood === 'angry',
  'happy-bounce': currentNode.value.mood === 'happy',
}))
function restartGame() {
  showCompleteModal.value = false
  // 重置故事到开始节点
  currentNodeId.value = 'start'
  visitedNodes.value = ['start']
  // 如果有其他需要重置的状态（如 hearts 等），可以在这里重置
  // 由于故事树没有额外状态，只重置节点 ID 即可
}
function renderNode(nodeId) {
  if (nodeId === 'exit') {
    showCompleteModal.value = true   // 弹出模态框，不再 alert
    return
  }
  currentNodeId.value = nodeId
  visitedNodes.value.push(nodeId)
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
      finalNode: currentNodeId.value,
      visitedNodes: [...visitedNodes.value],
      rewardCoins: rewardAmount.value,
    },
    language: currentLanguage.value,
  })
}

function closeModal() {
  showCompleteModal.value = false
}

onMounted(() => {
  renderNode('start')
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
  height: 600px;
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
  color: #e74c3c;
  letter-spacing: 5px;
  transition: 0.3s;
}

.character-stage {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.cat-avatar {
  font-size: 10rem;
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
  height: 250px;
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
  font-size: 1.15rem;
  line-height: 1.6;
  flex: 1;
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
