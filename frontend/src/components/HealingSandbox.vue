<template>
  <div class="modal-overlay" @click.self="closeSandbox">
    <div class="healing-modal-content">
      <div class="modal-header">
        <span><i class="fas fa-leaf"></i> {{ t('components.healing.title') }}</span>
      </div>

      <div class="healing-title-area">
        <h2>{{ t('components.healing.headline') }}</h2>
        <p>{{ t('components.healing.subline') }}</p>
      </div>

      <div class="reflection-note">
        <strong>{{ t('components.healing.noteTitle') }}</strong>
        <span>{{ t('components.healing.noteBody') }}</span>
      </div>

      <div ref="trayRef" class="sand-tray" @dragover.prevent @drop="dropToSandbox" @click="handleTrayClick">
        <div v-if="bubble.visible" class="healing-bubble">{{ bubble.text }}</div>

        <button
          v-for="item in placedItems"
          :key="item.key"
          type="button"
          class="placed-item"
          :style="{ left: `${item.x}px`, top: `${item.y}px` }"
          @click.stop="showBubble(item.message)"
        >
          {{ item.emoji }}
        </button>

        <button
          v-for="message in sandboxMessages"
          :key="`msg-${message.id}`"
          type="button"
          class="shared-message-dot"
          :style="{ left: `${message.x}px`, top: `${message.y}px` }"
          @click.stop="showBubble(`${message.emoji || '💬'} ${message.content}`)"
        >
          <span class="dot-emoji">{{ message.emoji || '💬' }}</span>
        </button>

        <div v-if="showInput" class="message-input-panel" :style="{ left: `${inputX}px`, top: `${inputY}px` }" @click.stop>
          <input v-model="inputEmoji" class="emoji-input" maxlength="10" />
          <textarea v-model.trim="inputText" class="text-input" maxlength="280" />
          <div class="input-actions">
            <button type="button" class="mini-btn confirm" @click="submitMessage">OK</button>
            <button type="button" class="mini-btn cancel" @click="cancelInput">{{ t('common.actions.cancel') }}</button>
          </div>
        </div>
      </div>

      <div class="shelf">
        <button
          v-for="item in shelfItems"
          :key="item.id"
          type="button"
          class="item"
          draggable="true"
          @dragstart="dragSandboxItem($event, item.id)"
        >
          <span class="item-emoji">{{ item.emoji }}</span>
          <span class="item-label">{{ item.label }}</span>
        </button>
      </div>

      <button class="btn-exit" @click="closeSandbox">{{ t('components.healing.exit') }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { createSandboxMessage, getApiErrorMessage, getSandboxMessages } from '@/services/backend'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['close'])
const { t } = useAppI18n()
const authStore = useAuthStore()

const trayRef = ref(null)
const placedItems = ref([])
const sandboxMessages = ref([])
const showInput = ref(false)
const inputX = ref(0)
const inputY = ref(0)
const inputText = ref('')
const inputEmoji = ref('💬')

const bubble = reactive({
  visible: false,
  text: '',
})

let bubbleTimer = null
let placedItemKey = 0

const shelfItemDefs = [
  { id: 'tree', emoji: '\u{1F333}' },
  { id: 'home', emoji: '\u{1F3E0}' },
  { id: 'sun', emoji: '\u2600\uFE0F' },
  { id: 'cat', emoji: '\u{1F431}' },
  { id: 'flower', emoji: '\u{1F338}' },
  { id: 'boat', emoji: '\u26F5' },
  { id: 'heart', emoji: '\u2764\uFE0F' },
]

const shelfItems = computed(() => shelfItemDefs.map((item) => ({
  ...item,
  label: t(`components.healing.items.${item.id}.label`),
  message: t(`components.healing.items.${item.id}.message`),
})))

async function loadSharedMessages() {
  try {
    const payload = await getSandboxMessages({ page: 0, size: 200 })
    sandboxMessages.value = payload?.messages || []
  } catch (error) {
    console.warn('Failed to load sandbox messages.', error)
  }
}

function dragSandboxItem(event, itemId) {
  event.dataTransfer?.setData('text/plain', itemId)
}

function dropToSandbox(event) {
  const tray = trayRef.value
  if (!tray) return

  const itemId = event.dataTransfer?.getData('text/plain')
  const source = shelfItems.value.find((item) => item.id === itemId)
  if (!source) return

  const rect = tray.getBoundingClientRect()
  const x = Math.max(0, Math.min(event.clientX - rect.left - 24, rect.width - 48))
  const y = Math.max(0, Math.min(event.clientY - rect.top - 24, rect.height - 48))

  placedItems.value.push({
    key: placedItemKey += 1,
    emoji: source.emoji,
    message: source.message,
    x,
    y,
  })
}

function showBubble(text) {
  bubble.text = text
  bubble.visible = true

  if (bubbleTimer) {
    clearTimeout(bubbleTimer)
  }

  bubbleTimer = window.setTimeout(() => {
    bubble.visible = false
  }, 2500)
}

function hideBubble() {
  bubble.visible = false
  if (bubbleTimer) {
    clearTimeout(bubbleTimer)
    bubbleTimer = null
  }
}

function handleTrayClick(event) {
  hideBubble()
  const tray = trayRef.value
  if (!tray) return
  const rect = tray.getBoundingClientRect()
  const x = Math.round(event.clientX - rect.left)
  const y = Math.round(event.clientY - rect.top)

  inputX.value = Math.max(0, Math.min(x, 710))
  inputY.value = Math.max(0, Math.min(y, 310))
  inputText.value = ''
  inputEmoji.value = '💬'
  showInput.value = true
}

function cancelInput() {
  showInput.value = false
  inputText.value = ''
}

async function submitMessage() {
  if (!authStore.token) {
    alert('Please login first.')
    return
  }

  if (!inputText.value || inputText.value.length > 280) {
    alert('Message must be 1-280 characters.')
    return
  }

  try {
    await createSandboxMessage({
      content: inputText.value,
      x: inputX.value,
      y: inputY.value,
      emoji: inputEmoji.value || '💬',
    })
    cancelInput()
    await loadSharedMessages()
  } catch (error) {
    alert(getApiErrorMessage(error, 'Failed to post message.'))
  }
}

function closeSandbox() {
  hideBubble()
  cancelInput()
  emit('close')
}

onMounted(() => {
  loadSharedMessages()
})

onBeforeUnmount(() => {
  if (bubbleTimer) {
    clearTimeout(bubbleTimer)
  }
})
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(10, 20, 30, 0.85); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.healing-modal-content { background: #fffcf4; width: 88%; max-width: 750px; border-radius: 28px; padding: 35px; border: 3px solid #e2bc7c; box-shadow: 0 20px 32px rgba(0, 0, 0, 0.28); position: relative; }
.modal-header { font-size: 1.5rem; color: #5d4037; font-weight: 900; font-family: Georgia, serif; margin-bottom: 8px; }
.healing-title-area { text-align: center; margin-bottom: 20px; }
.healing-title-area h2 { color: #5d4037; margin: 5px; font-size: 1.6rem; font-family: Georgia, serif; }
.healing-title-area p { color: #8d6e63; font-size: 0.95rem; font-style: italic; margin: 0; }
.reflection-note { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 20px; padding: 14px 16px; border-radius: 18px; background: rgba(93, 64, 55, 0.08); border: 1px solid rgba(141, 110, 99, 0.2); color: #6c564e; line-height: 1.55; }
.reflection-note strong { color: #5d4037; white-space: nowrap; }
.sand-tray { width: 100%; height: 350px; background-color: #fdf5e6; border: 12px solid #8d6e63; border-radius: 12px; position: relative; box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(0, 0, 0, 0.08); overflow: hidden; margin-bottom: 20px; background-image: radial-gradient(#efe0c9 1px, transparent 1px); background-size: 20px 20px; }
.healing-bubble { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.98); padding: 16px 22px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); border: 2px solid #ff8a80; color: #444; font-weight: bold; z-index: 100; text-align: center; max-width: 320px; line-height: 1.6; font-size: 1rem; }
.shelf { width: 100%; background: white; padding: 15px; border-radius: 20px; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
.item { border: 0; background: transparent; font-size: 2.5rem; cursor: grab; transition: transform 0.2s; user-select: none; display: flex; flex-direction: column; align-items: center; }
.item:hover { transform: scale(1.1) rotate(5deg); }
.item-emoji { line-height: 1; }
.item-label { font-size: 0.8rem; color: #999; margin-top: 5px; font-weight: bold; }
.placed-item { position: absolute; font-size: 3rem; cursor: pointer; z-index: 10; user-select: none; animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 0; background: transparent; padding: 0; }
.shared-message-dot { position: absolute; border: 0; background: rgba(255, 255, 255, 0.92); border-radius: 999px; padding: 6px 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); transform: translate(-50%, -50%); z-index: 20; }
.dot-emoji { line-height: 1; }
.message-input-panel { position: absolute; transform: translate(-50%, -50%); width: 220px; background: #fff; border: 1px solid #e3d7c8; border-radius: 12px; padding: 8px; z-index: 30; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18); }
.emoji-input { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 4px 6px; margin-bottom: 6px; }
.text-input { width: 100%; min-height: 70px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; padding: 6px; margin-bottom: 6px; }
.input-actions { display: flex; justify-content: flex-end; gap: 6px; }
.mini-btn { border: 0; border-radius: 8px; padding: 4px 8px; cursor: pointer; }
.mini-btn.confirm { background: #4caf50; color: #fff; }
.mini-btn.cancel { background: #eee; color: #444; }
@keyframes pop-in { from { transform: scale(0); } to { transform: scale(1); } }
.btn-exit { display: block; width: 100%; margin-top: 20px; background: #e74c3c; color: white; border: 2px solid #c0392b; padding: 12px; border-radius: 999px; font-weight: 900; font-size: 1.05rem; cursor: pointer; box-shadow: 0 4px 0 #922b21; transition: 0.2s; }
.btn-exit:hover { background: #c0392b; transform: translateY(-2px); }
</style>
