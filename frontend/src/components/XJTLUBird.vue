<template>
  <div class="xjtlu-bird-container">
    <div class="bird-wrapper">
      <button
        type="button"
        class="bird-avatar"
        :class="{ clickable: isConfigured }"
        :aria-expanded="showChat"
        aria-label="Open AI assistant"
        @click="toggleChat"
      >
        <div class="bird-body" :class="`mood-${currentMood}`">
          <div class="antenna"></div>
          <div class="body"></div>
          <div class="outfit">XJTLU</div>

          <div class="face">
            <div class="eye eye-left" :class="eyeState">
              <div class="pupil"></div>
            </div>
            <div class="eye eye-right" :class="eyeState">
              <div class="pupil"></div>
            </div>
            <div class="mouth" :class="mouthState"></div>
            <div class="cheek cheek-left"></div>
            <div class="cheek cheek-right"></div>
          </div>

          <div class="ear ear-left"></div>
          <div class="ear ear-right"></div>
          <div class="arm arm-left"></div>
          <div class="arm arm-right"></div>
          <div class="leg leg-left"></div>
          <div class="leg leg-right"></div>
        </div>

        <div v-if="showNotification && !showChat" class="notification-bubble">
          {{ notificationText }}
        </div>
      </button>
    </div>

    <transition name="bird-panel">
      <section v-if="showChat" class="chat-box" aria-label="XJTLU AI assistant">
        <header class="chat-header">
          <div>
            <p class="chat-kicker">AI Guide</p>
            <h3>XJTLU AI Assistant</h3>
          </div>
          <button type="button" class="close-btn" aria-label="Close assistant" @click="toggleChat">
            x
          </button>
        </header>

        <div v-if="!isConfigured" class="api-key-setup">
          <p>Add a DeepSeek API key to start chatting.</p>
          <input
            v-model="inputApiKey"
            type="password"
            placeholder="sk-..."
            class="api-key-input"
            @keyup.enter="saveInputApiKey"
          >
          <button type="button" class="setup-btn" @click="saveInputApiKey">
            Confirm
          </button>
          <p class="hint">
            You can also place the key in <code>frontend/.env</code> as
            <code>VITE_DEEPSEEK_API_KEY</code>.
          </p>
          <p class="hint">
            Create a key from
            <a href="https://platform.deepseek.com/api/keys" target="_blank" rel="noreferrer">
              platform.deepseek.com
            </a>
          </p>
        </div>

        <div v-else class="chat-content">
          <div ref="messagesContainer" class="messages">
            <div
              v-for="(message, index) in messages"
              :key="`${message.role}-${index}`"
              class="message"
              :class="message.role === 'user' ? 'user-msg' : 'ai-msg'"
            >
              <div class="message-bubble">
                {{ message.content }}
              </div>
            </div>

            <div v-if="isLoading" class="message ai-msg">
              <div class="message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <form class="input-area" @submit.prevent="sendCurrentMessage">
            <input
              v-model="inputMessage"
              type="text"
              class="chat-input"
              placeholder="Ask about your study journey..."
              :disabled="isLoading"
            >
            <button type="submit" class="send-btn" :disabled="isLoading">
              {{ isLoading ? '...' : 'Send' }}
            </button>
          </form>

          <p v-if="error" class="error-msg">{{ error }}</p>
        </div>
      </section>
    </transition>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDeepSeekChat } from '@/composables/useDeepSeekChat'

const {
  isConfigured,
  isLoading,
  error,
  getSafetyIssue,
  setApiKey,
  loadApiKey,
  sendMessage,
} = useDeepSeekChat()

const WELCOME_MESSAGE = "Hello! I'm your XJTLU AI assistant. How can I help today?"
const NOTIFICATIONS = ['Need help?', 'Open the AI guide', 'Ask me anything']

const showChat = ref(false)
const inputMessage = ref('')
const inputApiKey = ref('')
const messages = ref([])
const currentMood = ref('happy')
const eyeState = ref('normal')
const mouthState = ref('smile')
const showNotification = ref(false)
const notificationText = ref(NOTIFICATIONS[0])
const messagesContainer = ref(null)

let notificationIntervalId = null
let notificationTimeoutId = null

function setMood(mood) {
  currentMood.value = mood

  if (mood === 'thinking') {
    eyeState.value = 'wide'
    mouthState.value = 'surprised'
    return
  }

  eyeState.value = 'normal'
  mouthState.value = mood === 'sad' ? 'sad' : 'smile'
}

function seedWelcomeMessage() {
  messages.value = [
    {
      role: 'assistant',
      content: WELCOME_MESSAGE,
    },
  ]
}

function hideNotification() {
  showNotification.value = false

  if (notificationTimeoutId !== null) {
    window.clearTimeout(notificationTimeoutId)
    notificationTimeoutId = null
  }
}

function triggerNotification() {
  if (showChat.value) {
    return
  }

  notificationText.value = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)]
  showNotification.value = true

  if (notificationTimeoutId !== null) {
    window.clearTimeout(notificationTimeoutId)
  }

  notificationTimeoutId = window.setTimeout(() => {
    showNotification.value = false
    notificationTimeoutId = null
  }, 3200)
}

function scrollMessagesToBottom() {
  if (!messagesContainer.value) {
    return
  }

  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
}

function toggleChat() {
  showChat.value = !showChat.value

  if (showChat.value) {
    hideNotification()
    nextTick(scrollMessagesToBottom)
  }
}

function saveInputApiKey() {
  const nextKey = inputApiKey.value.trim()

  if (!nextKey) {
    return
  }

  setApiKey(nextKey)
  inputApiKey.value = ''
  seedWelcomeMessage()
  setMood('happy')
  nextTick(scrollMessagesToBottom)
}

async function sendCurrentMessage() {
  const userMessage = inputMessage.value.trim()

  if (!userMessage || isLoading.value) {
    return
  }

  const safetyIssue = getSafetyIssue(userMessage)
  if (safetyIssue) {
    inputMessage.value = ''
    messages.value.push({
      role: 'assistant',
      content: safetyIssue,
    })
    setMood('sad')
    await nextTick()
    scrollMessagesToBottom()
    return
  }

  messages.value.push({
    role: 'user',
    content: userMessage,
  })
  inputMessage.value = ''
  setMood('thinking')
  await nextTick()
  scrollMessagesToBottom()

  const history = messages.value.slice(0, -1)
  const reply = await sendMessage(userMessage, history)

  messages.value.push({
    role: 'assistant',
    content: reply || error.value || 'Something went wrong. Please try again in a moment.',
  })

  setMood(reply ? 'happy' : 'sad')
  await nextTick()
  scrollMessagesToBottom()
}

watch(isLoading, (loading) => {
  if (loading) {
    setMood('thinking')
    return
  }

  if (error.value) {
    setMood('sad')
    return
  }

  setMood('happy')
})

watch(
  () => messages.value.length,
  () => {
    nextTick(scrollMessagesToBottom)
  },
)

onMounted(() => {
  loadApiKey()

  if (isConfigured.value) {
    seedWelcomeMessage()
  }

  notificationIntervalId = window.setInterval(triggerNotification, 15000)
})

onBeforeUnmount(() => {
  if (notificationIntervalId !== null) {
    window.clearInterval(notificationIntervalId)
  }

  if (notificationTimeoutId !== null) {
    window.clearTimeout(notificationTimeoutId)
  }
})
</script>

<style scoped>
.xjtlu-bird-container {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1300;
  pointer-events: none;
}

.bird-wrapper,
.chat-box {
  pointer-events: auto;
}

.bird-avatar {
  position: relative;
  width: 108px;
  height: 108px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 16px 22px rgba(7, 12, 22, 0.28));
  transition: transform 0.24s ease;
}

.bird-avatar:hover {
  transform: translateY(-4px) scale(1.03);
}

.bird-avatar.clickable:hover {
  animation: bird-bounce 0.8s ease-in-out infinite;
}

.bird-body {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.24s ease;
}

.antenna {
  position: absolute;
  top: 0;
  left: 50%;
  width: 4px;
  height: 28px;
  background: linear-gradient(180deg, #14532d, #d97706);
  border-radius: 999px;
  transform: translateX(-50%) rotate(-18deg);
  animation: antenna-wave 1.6s ease-in-out infinite;
}

.body {
  position: absolute;
  top: 18px;
  left: 16px;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 28%, #fffdf7 0%, #f7ead8 65%, #efd8bb 100%);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.7),
    0 8px 20px rgba(34, 31, 24, 0.14);
}

.outfit {
  position: absolute;
  top: 54px;
  left: 16px;
  width: 76px;
  height: 40px;
  border-radius: 10px 10px 18px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #163147 0%, #2c5a6e 54%, #d97706 100%);
  color: #fff4dc;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  z-index: 2;
}

.face {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.eye {
  position: absolute;
  top: 31px;
  width: 12px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.12);
}

.eye-left {
  left: 30px;
}

.eye-right {
  right: 30px;
}

.pupil {
  position: absolute;
  top: 3px;
  left: 50%;
  width: 6px;
  height: 8px;
  border-radius: 50%;
  background: #111827;
  transform: translateX(-50%);
}

.eye.wide .pupil {
  width: 7px;
  height: 9px;
}

.mouth {
  position: absolute;
  left: 50%;
  bottom: 50px;
  width: 12px;
  height: 8px;
  background: #d97706;
  transform: translateX(-50%);
  transition: all 0.2s ease;
}

.mouth.smile {
  border-radius: 0 0 12px 12px;
}

.mouth.surprised {
  width: 10px;
  height: 12px;
  border-radius: 50%;
}

.mouth.sad {
  background: transparent;
  border-top: 2px solid #d97706;
  border-radius: 10px 10px 0 0;
}

.cheek {
  position: absolute;
  top: 41px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(251, 146, 60, 0.22);
}

.cheek-left {
  left: 18px;
}

.cheek-right {
  right: 18px;
}

.ear {
  position: absolute;
  top: 26px;
  width: 20px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #2c5a6e 100%);
  box-shadow:
    inset 0 0 0 4px #d8b16f,
    0 3px 6px rgba(15, 23, 42, 0.14);
  z-index: 1;
}

.ear-left {
  left: 4px;
}

.ear-right {
  right: 4px;
}

.arm {
  position: absolute;
  top: 54px;
  width: 9px;
  height: 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #163147 0%, #2c5a6e 100%);
  transform-origin: top center;
  z-index: 1;
}

.arm-left {
  left: 14px;
  transform: rotate(-28deg);
  animation: arm-left-swing 2s ease-in-out infinite;
}

.arm-right {
  right: 14px;
  transform: rotate(28deg);
  animation: arm-right-swing 2s ease-in-out infinite;
}

.leg {
  position: absolute;
  bottom: -4px;
  width: 5px;
  height: 18px;
  border-radius: 999px;
  background: #d97706;
}

.leg-left {
  left: 34px;
}

.leg-right {
  right: 34px;
}

.notification-bubble {
  position: absolute;
  right: -8px;
  bottom: 114px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 252, 244, 0.98);
  border: 1px solid rgba(226, 188, 124, 0.68);
  color: #2c5a6e;
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
  animation: notification-in 0.22s ease-out;
}

.chat-box {
  position: absolute;
  right: 0;
  bottom: 112px;
  width: min(360px, calc(100vw - 32px));
  height: min(520px, calc(100vh - 140px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 249, 239, 0.98), rgba(247, 238, 224, 0.96));
  border: 1px solid rgba(226, 188, 124, 0.64);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #163147 0%, #2c5a6e 65%, #14532d 100%);
  color: #f8fafc;
}

.chat-kicker {
  margin: 0 0 4px;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #f6d28f;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;
  font-weight: 900;
}

.api-key-setup {
  display: grid;
  gap: 12px;
  padding: 22px 20px;
  color: #334155;
}

.api-key-setup p {
  margin: 0;
  line-height: 1.55;
}

.api-key-input,
.chat-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.88);
  color: #0f172a;
}

.api-key-input:focus,
.chat-input:focus {
  outline: 2px solid rgba(44, 90, 110, 0.18);
  border-color: #2c5a6e;
}

.setup-btn,
.send-btn {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.setup-btn:hover,
.send-btn:hover:enabled {
  transform: translateY(-1px);
}

.setup-btn {
  padding: 12px 16px;
  background: linear-gradient(135deg, #d97706, #ea580c);
  color: #fff7ed;
}

.hint {
  font-size: 0.8rem;
  color: #64748b;
}

.hint a,
.hint code {
  color: #163147;
}

.chat-content {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.messages {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  overflow-y: auto;
}

.message {
  display: flex;
}

.user-msg {
  justify-content: flex-end;
}

.ai-msg {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 16px;
  line-height: 1.55;
  font-size: 0.86rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.user-msg .message-bubble {
  background: linear-gradient(135deg, #d97706, #ea580c);
  color: #fff7ed;
  border-bottom-right-radius: 6px;
}

.ai-msg .message-bubble {
  background: rgba(255, 255, 255, 0.78);
  color: #1e293b;
  border: 1px solid rgba(226, 188, 124, 0.35);
  border-bottom-left-radius: 6px;
}

.typing {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2c5a6e;
  animation: typing-dots 1.2s infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

.input-area {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  padding: 14px;
  border-top: 1px solid rgba(226, 188, 124, 0.26);
}

.chat-input:disabled {
  opacity: 0.72;
}

.send-btn {
  padding: 0 16px;
  background: linear-gradient(135deg, #163147, #2c5a6e);
  color: #f8fafc;
}

.send-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.error-msg {
  margin: 0 14px 14px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
  font-size: 0.82rem;
  font-weight: 700;
}

.bird-panel-enter-active,
.bird-panel-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.bird-panel-enter-from,
.bird-panel-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.bird-body.mood-thinking .ear {
  animation: ear-pulse 0.9s ease-in-out infinite;
}

.bird-body.mood-thinking .arm-left {
  animation: arm-left-thinking 0.8s ease-in-out infinite;
}

.bird-body.mood-thinking .arm-right {
  animation: arm-right-thinking 0.8s ease-in-out infinite;
}

.bird-body.mood-thinking .antenna {
  animation: antenna-thinking 0.8s ease-in-out infinite;
}

.bird-body.mood-sad .arm-left {
  animation: arm-left-sad 0.9s ease-in-out infinite;
}

.bird-body.mood-sad .arm-right {
  animation: arm-right-sad 0.9s ease-in-out infinite;
}

@keyframes bird-bounce {
  0%,
  100% {
    transform: translateY(-4px) scale(1.03);
  }

  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes antenna-wave {
  0%,
  100% {
    transform: translateX(-50%) rotate(-18deg);
  }

  50% {
    transform: translateX(-50%) rotate(18deg);
  }
}

@keyframes antenna-thinking {
  0%,
  100% {
    transform: translateX(-50%) rotate(-18deg);
  }

  50% {
    transform: translateX(-50%) rotate(0deg);
  }
}

@keyframes arm-left-swing {
  0%,
  100% {
    transform: rotate(-28deg);
  }

  50% {
    transform: rotate(-12deg);
  }
}

@keyframes arm-right-swing {
  0%,
  100% {
    transform: rotate(28deg);
  }

  50% {
    transform: rotate(12deg);
  }
}

@keyframes arm-left-thinking {
  0%,
  100% {
    transform: rotate(-28deg);
  }

  50% {
    transform: rotate(-4deg);
  }
}

@keyframes arm-right-thinking {
  0%,
  100% {
    transform: rotate(28deg);
  }

  50% {
    transform: rotate(4deg);
  }
}

@keyframes arm-left-sad {
  0%,
  100% {
    transform: rotate(-40deg);
  }

  50% {
    transform: rotate(-32deg);
  }
}

@keyframes arm-right-sad {
  0%,
  100% {
    transform: rotate(40deg);
  }

  50% {
    transform: rotate(32deg);
  }
}

@keyframes ear-pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }
}

@keyframes notification-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes typing-dots {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (max-width: 640px) {
  .xjtlu-bird-container {
    right: 16px;
    bottom: 16px;
  }

  .bird-avatar {
    width: 96px;
    height: 96px;
  }

  .chat-box {
    right: -4px;
    bottom: 102px;
    height: min(500px, calc(100vh - 124px));
  }

  .input-area {
    grid-template-columns: 1fr;
  }

  .send-btn {
    min-height: 44px;
  }
}
</style>
