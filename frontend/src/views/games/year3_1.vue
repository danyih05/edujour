<template>
  <div class="alchemy-page">
    <div class="alchemy-room">
      <div class="header">
        <div class="eyebrow">{{ t('pages.y3_1.eyebrow') }}</div>
        <h2>{{ t('pages.y3_1.title') }}</h2>
        <p>{{ t('pages.y3_1.intro') }}</p>
      </div>

      <div class="cauldron-area" :class="{ 'shake-error': isShaking }">
        <button
          type="button"
          class="slot"
          :class="{ filled: Boolean(slotItems[0]), mixing: isMixing && Boolean(slotItems[0]) }"
          :disabled="isMixing"
          @click="clearSlot(0)"
        >
          <template v-if="slotItems[0]">
            <div class="slot-art">
              <i :class="slotItems[0].iconClass" aria-hidden="true"></i>
            </div>
            <div class="slot-name">{{ slotItems[0].name }}</div>
          </template>
          <template v-else>
            <div class="slot-empty">{{ t('pages.y3_1.emptySlot') }}</div>
          </template>
        </button>

        <div class="plus-sign">+</div>

        <button
          type="button"
          class="slot"
          :class="{ filled: Boolean(slotItems[1]), mixing: isMixing && Boolean(slotItems[1]) }"
          :disabled="isMixing"
          @click="clearSlot(1)"
        >
          <template v-if="slotItems[1]">
            <div class="slot-art">
              <i :class="slotItems[1].iconClass" aria-hidden="true"></i>
            </div>
            <div class="slot-name">{{ slotItems[1].name }}</div>
          </template>
          <template v-else>
            <div class="slot-empty">{{ t('pages.y3_1.emptySlot') }}</div>
          </template>
        </button>

        <button
          type="button"
          class="cauldron-btn"
          :class="{ disabled: !canMix, 'mix-anim': isMixing }"
          :disabled="!canMix"
          @click="mixElements"
        >
          <span class="cauldron-label">{{ t('pages.y3_1.fuseShort') }}</span>
          <span class="cauldron-copy">{{ t('pages.y3_1.fuseCopy') }}</span>
        </button>
      </div>

      <section class="inventory-section">
        <div class="section-title inventory-title">
          <span>{{ t('pages.y3_1.inventory') }}</span>
          <span class="section-meta">{{ t('pages.y3_1.inventoryProgress', { current: unlockedCount, total: totalItemCount }) }}</span>
        </div>

        <div class="hint-tools">
          <div class="hint-header">
            <strong>{{ t('pages.y3_1.hintTitle') }}</strong>
            <span>{{ t('pages.y3_1.hintMeta') }}</span>
          </div>

          <div class="hint-buttons">
            <button
              v-for="hint in hintNotes"
              :key="hint.id"
              type="button"
              class="hint-btn"
              :class="{ active: activeHintId === hint.id }"
              @click="toggleHint(hint.id)"
            >
              {{ hint.label }}
            </button>
          </div>

          <Transition name="hint-fade">
            <article v-if="activeHint" :key="activeHint.id" class="hint-card">
              <strong>{{ activeHint.title }}</strong>
              <p>{{ activeHint.body }}</p>
            </article>
          </Transition>
        </div>

        <div class="inventory-grid">
          <button
            v-for="item in inventoryItems"
            :key="item.id"
            type="button"
            class="element-item"
            :class="[item.tier, `stage-${item.stage}`, { selected: getSelectedCount(item.id) > 0, crafted: item.isCrafted, offer: item.stage === 3 }]"
            :disabled="isMixing"
            @click="addToSlot(item.id)"
          >
            <div
              v-if="getSelectedCount(item.id) > 0"
              class="picked-badge"
            >
              x{{ getSelectedCount(item.id) }}
            </div>
            <div class="item-visual">
              <i :class="item.iconClass" aria-hidden="true"></i>
            </div>
            <div class="item-name">{{ item.name }}</div>
            <div class="item-desc">{{ item.description }}</div>
          </button>
        </div>
      </section>
    </div>

    <KnowledgeGuidePanel
      :title="t('pages.y3_1.recipeBook')"
      :body="t('pages.y3_1.hintMeta')"
      :items="guideItems"
    />

    <Transition name="toast-pop">
      <div
        v-if="toast.visible"
        class="toast"
        :class="{ error: toast.type === 'error' }"
      >
        <span class="toast-badge">
          {{ toast.type === 'error' ? '!' : '*' }}
        </span>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="showVictoryModal" class="victory-modal">
        <div class="victory-card">
          <div class="victory-glyph">
            <i :class="itemDB.offer.iconClass" aria-hidden="true"></i>
          </div>
          <p class="victory-eyebrow">{{ t('pages.y3_1.successEyebrow') }}</p>
          <h3>{{ itemDB.offer.name }}</h3>
          <p>{{ t('pages.y3_1.successDesc') }}</p>
          <div class="victory-recipes">
            <div
              v-for="recipe in recipeSteps"
              :key="`victory-${recipe.result}`"
              class="victory-line"
            >
              <strong>{{ itemDB[recipe.ing[0]].name }}</strong>
              <span> + </span>
              <strong>{{ itemDB[recipe.ing[1]].name }}</strong>
              <span> -> </span>
              <b>{{ itemDB[recipe.result].name }}</b>
            </div>
          </div>
          <button type="button" class="claim-btn" @click="completeNode">
            {{ t('pages.y3_1.saveAndReturn') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const emit = defineEmits(['complete', 'close'])
const { t } = useAppI18n()
const hintIds = ['one', 'two', 'three', 'four']

const ITEM_META = {
  exp: { id: 'exp', tier: 'tier-1', stage: 0, iconClass: 'fas fa-briefcase' },
  school: { id: 'school', tier: 'tier-1', stage: 0, iconClass: 'fas fa-bullseye' },
  hair: { id: 'hair', tier: 'tier-1', stage: 0, iconClass: 'fas fa-hammer' },
  prof: { id: 'prof', tier: 'tier-1', stage: 0, iconClass: 'fas fa-user-tie' },
  eng: { id: 'eng', tier: 'tier-1', stage: 0, iconClass: 'fas fa-language' },
  cv: { id: 'cv', tier: 'tier-2', stage: 1, iconClass: 'fas fa-file-lines' },
  ielts: { id: 'ielts', tier: 'tier-2', stage: 1, iconClass: 'fas fa-certificate' },
  ps: { id: 'ps', tier: 'tier-3', stage: 2, iconClass: 'fas fa-pen-nib' },
  rl: { id: 'rl', tier: 'tier-3', stage: 2, iconClass: 'fas fa-envelope-open-text' },
  package: { id: 'package', tier: 'tier-4', stage: 2, iconClass: 'fas fa-box-archive' },
  offer: { id: 'offer', tier: 'tier-4', stage: 3, iconClass: 'fas fa-crown' },
}

const RECIPES = [
  { ing: ['exp', 'school'], result: 'cv' },
  { ing: ['eng', 'hair'], result: 'ielts' },
  { ing: ['cv', 'hair'], result: 'ps' },
  { ing: ['cv', 'prof'], result: 'rl' },
  { ing: ['ps', 'rl'], result: 'package' },
  { ing: ['package', 'ielts'], result: 'offer' },
]

const SPECIAL_FAIL_MESSAGES = [
  { check: ['exp', 'hair'], key: 'pages.y3_1.failMessages.expHair' },
  { check: ['ps', 'prof'], key: 'pages.y3_1.failMessages.psProf' },
  { check: ['package', 'hair'], key: 'pages.y3_1.failMessages.packageHair' },
  { check: ['school', 'prof'], key: 'pages.y3_1.failMessages.schoolProf' },
]

const INITIAL_INVENTORY = ['exp', 'school', 'hair', 'prof', 'eng']

const inventory = ref([...INITIAL_INVENTORY])
const selectedSlots = ref([null, null])
const isMixing = ref(false)
const isShaking = ref(false)
const showVictoryModal = ref(false)
const activeHintId = ref(null)
const toast = reactive({
  visible: false,
  type: 'success',
  message: '',
})

const guideItems = computed(() => hintIds.map((id) => ({
  label: t(`pages.y3_1.hints.${id}.label`),
  title: t(`pages.y3_1.hints.${id}.title`),
  text: t(`pages.y3_1.hints.${id}.body`),
})))

const timers = new Set()
let toastTimer = null

const itemDB = computed(() => Object.fromEntries(
  Object.entries(ITEM_META).map(([id, item]) => [
    id,
    {
      ...item,
      name: t(`pages.y3_1.items.${id}`),
      description: t(`pages.y3_1.itemDescriptions.${id}`),
      isCrafted: !INITIAL_INVENTORY.includes(id),
    },
  ]),
))

const recipeSteps = computed(() => RECIPES.map((recipe) => ({
  ...recipe,
  message: t(`pages.y3_1.recipes.${recipe.result}`),
})))
const hintNotes = computed(() => hintIds.map((id) => ({
  id,
  label: t(`pages.y3_1.hints.${id}.label`),
  title: t(`pages.y3_1.hints.${id}.title`),
  body: t(`pages.y3_1.hints.${id}.body`),
})))

const inventoryItems = computed(() => inventory.value.map((itemId) => itemDB.value[itemId]))
const slotItems = computed(() => selectedSlots.value.map((itemId) => (itemId ? itemDB.value[itemId] : null)))
const activeHint = computed(() => hintNotes.value.find((hint) => hint.id === activeHintId.value) || null)
const unlockedCount = computed(() => inventory.value.length)
const totalItemCount = Object.keys(ITEM_META).length
const canMix = computed(() => selectedSlots.value.every(Boolean) && !isMixing.value)

function schedule(fn, delay) {
  const timer = window.setTimeout(() => {
    timers.delete(timer)
    fn()
  }, delay)
  timers.add(timer)
  return timer
}

function clearTimer(timer) {
  if (timer === null) return null
  window.clearTimeout(timer)
  timers.delete(timer)
  return null
}

function pairKey(parts) {
  return [...parts].sort().join('|')
}

function getSelectedCount(itemId) {
  return selectedSlots.value.filter((slotId) => slotId === itemId).length
}

function toggleHint(hintId) {
  activeHintId.value = activeHintId.value === hintId ? null : hintId
}

function showToast(type, message) {
  toast.type = type
  toast.message = message
  toast.visible = true
  toastTimer = clearTimer(toastTimer)
  toastTimer = schedule(() => {
    toast.visible = false
    toastTimer = null
  }, 3500)
}

function addToSlot(itemId) {
  if (isMixing.value) return

  const nextSlots = [...selectedSlots.value]
  const openIndex = nextSlots.findIndex((slotId) => slotId === null)

  if (openIndex === -1) {
    showToast('error', t('pages.y3_1.toastFullMessage'))
    return
  }

  nextSlots[openIndex] = itemId
  selectedSlots.value = nextSlots
}

function clearSlot(index) {
  if (isMixing.value) return

  const nextSlots = [...selectedSlots.value]
  nextSlots[index] = null
  selectedSlots.value = nextSlots
}

function handleFailedMix(itemA, itemB) {
  const currentPair = pairKey([itemA, itemB])
  const specialMessage = SPECIAL_FAIL_MESSAGES.find(
    (entry) => pairKey(entry.check) === currentPair,
  )

  isShaking.value = true
  schedule(() => {
    isShaking.value = false
  }, 400)

  showToast(
    'error',
    specialMessage ? t(specialMessage.key) : t('pages.y3_1.toastNoResonanceMessage'),
  )
}

function handleSuccessfulMix(recipe) {
  const alreadyUnlocked = inventory.value.includes(recipe.result)

  if (!alreadyUnlocked) {
    inventory.value = [...inventory.value, recipe.result]
  }

  if (recipe.result === 'offer') {
    schedule(() => {
      showVictoryModal.value = true
    }, 180)
    return
  }

  showToast(
    'success',
    alreadyUnlocked
      ? t('pages.y3_1.toastRepeatRecipe')
      : recipe.message,
  )
}

function mixElements() {
  if (!canMix.value) return

  isMixing.value = true

  const [itemA, itemB] = selectedSlots.value
  const recipe = recipeSteps.value.find((entry) => pairKey(entry.ing) === pairKey([itemA, itemB]))

  schedule(() => {
    if (recipe) {
      handleSuccessfulMix(recipe)
    } else {
      handleFailedMix(itemA, itemB)
    }

    selectedSlots.value = [null, null]
    isMixing.value = false
  }, 520)
}

function completeNode() {
  showVictoryModal.value = false
  emit('complete', { game: 'application-alchemy', rewardCoins: 20 })
}

onMounted(() => {
  showToast('success', t('pages.y3_1.toastStartMessage'))
})

onBeforeUnmount(() => {
  toastTimer = clearTimer(toastTimer)
  timers.forEach((timer) => window.clearTimeout(timer))
  timers.clear()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.alchemy-page {
  min-height: 100%;
  padding: 24px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.38) 0%, transparent 28%),
    radial-gradient(circle at 82% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 20%),
    linear-gradient(180deg, #08111f 0%, #0f172a 58%, #060b16 100%);
  color: #e2e8f0;
}

.alchemy-room {
  width: min(1040px, 100%);
  background: rgba(10, 18, 34, 0.78);
  border: 2px solid rgba(129, 140, 248, 0.55);
  border-radius: 28px;
  padding: 32px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.55),
    inset 0 0 32px rgba(99, 102, 241, 0.16);
  backdrop-filter: blur(12px);
}

.header {
  text-align: center;
  margin-bottom: 26px;
}

.eyebrow,
.victory-eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.35);
  background: rgba(30, 41, 59, 0.6);
  color: #93c5fd;
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header h2 {
  margin: 0 0 12px;
  color: #c7d2fe;
  font-size: clamp(2rem, 3vw, 2.45rem);
  text-shadow: 0 0 18px rgba(165, 180, 252, 0.28);
  font-family: Georgia, serif;
}

.header p {
  max-width: 760px;
  margin: 0 auto;
  color: #94a3b8;
  font-size: 1.02rem;
  line-height: 1.7;
  font-family: Georgia, serif;
  font-style: italic;
}

.inventory-section {
  border-top: 2px dashed rgba(51, 65, 85, 0.9);
  padding-top: 22px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: #c7d2fe;
  font-size: 1.08rem;
  font-weight: 800;
}

.section-meta {
  color: #64748b;
  font-size: 0.9rem;
}

.hint-tools {
  margin-bottom: 18px;
  padding: 18px 18px 14px;
  border-radius: 20px;
  border: 1px solid rgba(248, 213, 74, 0.48);
  background: linear-gradient(180deg, rgba(73, 56, 15, 0.28), rgba(15, 23, 42, 0.72));
  box-shadow:
    0 0 26px rgba(250, 204, 21, 0.08),
    inset 0 0 0 1px rgba(248, 213, 74, 0.12);
}

.hint-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  color: #cbd5e1;
  align-items: baseline;
}

.hint-header strong {
  font-size: 1rem;
  color: #fef3c7;
}

.hint-header span {
  color: #facc15;
  font-size: 0.9rem;
}

.hint-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hint-btn {
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(30, 41, 59, 0.7);
  color: #e2e8f0;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.hint-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(250, 204, 21, 0.66);
}

.hint-btn.active {
  border-color: #f8d54a;
  color: #fff;
  background: rgba(92, 67, 17, 0.92);
  box-shadow: 0 0 0 2px rgba(248, 213, 74, 0.2);
}

.hint-card {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(248, 213, 74, 0.34);
  background: rgba(30, 41, 59, 0.84);
  color: #dbeafe;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.26);
}

.hint-card strong {
  display: block;
  margin-bottom: 6px;
  color: #fef08a;
}

.hint-card p {
  margin: 0;
  line-height: 1.6;
  color: #e2e8f0;
  font-weight: 700;
}

.cauldron-area {
  display: grid;
  grid-template-columns: 120px 40px 120px minmax(150px, 1fr);
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 30px;
  min-height: 220px;
}

.slot {
  width: 120px;
  height: 120px;
  border: 2px dashed #6366f1;
  border-radius: 18px;
  background: rgba(2, 6, 23, 0.52);
  color: #64748b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: 0.25s ease;
  padding: 12px;
}

.slot:hover:enabled {
  background: rgba(99, 102, 241, 0.12);
}

.slot:disabled {
  cursor: default;
}

.slot.filled {
  border-style: solid;
  border-color: #a5b4fc;
  background: linear-gradient(135deg, #3730a3, #1e1b4b);
  color: #fff;
  box-shadow: 0 0 22px rgba(99, 102, 241, 0.32);
}

.slot.mixing {
  border-color: #f8d54a;
  background: linear-gradient(135deg, #8f6a13, #f59e0b);
  box-shadow: 0 0 28px rgba(248, 213, 74, 0.4);
  color: #fffbea;
}

.slot-art {
  font-size: 2rem;
  margin-bottom: 8px;
  line-height: 1;
}

.slot-name,
.slot-empty {
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.25;
}

.plus-sign {
  color: #6366f1;
  font-size: 2.2rem;
  font-weight: 900;
  text-align: center;
}

.cauldron-btn {
  justify-self: start;
  width: 150px;
  height: 150px;
  border: 4px solid #34d399;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #10b981, #064e3b 72%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 0 32px rgba(16, 185, 129, 0.4);
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
}

.cauldron-btn:hover:enabled {
  transform: scale(1.05);
  filter: brightness(1.12);
  box-shadow: 0 0 42px rgba(52, 211, 153, 0.58);
}

.cauldron-btn:active:enabled {
  transform: scale(0.96);
}

.cauldron-btn.disabled,
.cauldron-btn:disabled {
  filter: grayscale(1);
  opacity: 0.52;
  box-shadow: none;
  border-color: #475569;
  cursor: not-allowed;
}

.cauldron-label {
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.cauldron-copy {
  margin-top: 4px;
  font-size: 0.74rem;
  font-weight: 700;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}

.element-item {
  position: relative;
  min-height: 148px;
  border: 3px solid #64748b;
  border-radius: 22px;
  padding: 16px 14px;
  background: linear-gradient(180deg, #243149, #263248);
  color: #f8fafc;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.element-item:hover:enabled {
  transform: translateY(-3px);
  border-color: #fde047;
  background: linear-gradient(180deg, #2b3a55, #334155);
}

.element-item:disabled {
  cursor: default;
}

.element-item.selected {
  border-color: #f8d54a;
  background: linear-gradient(180deg, #4a3a14, #6b4b11);
  color: #fff8db;
  box-shadow:
    0 0 0 2px rgba(248, 213, 74, 0.2),
    inset 0 0 0 1px rgba(248, 213, 74, 0.16);
}

.element-item.crafted {
  border-color: #8b5cf6;
  background: linear-gradient(180deg, #33225b, #261b45);
  box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.14);
}

.element-item.stage-1.crafted {
  border-color: #8b5cf6;
  background: linear-gradient(180deg, #3b2871, #281c56);
}

.element-item.stage-2.crafted {
  border-color: #facc15;
  background: linear-gradient(180deg, #6b4b11, #4c3410);
  color: #fff7db;
}

.element-item.offer {
  overflow: hidden;
  isolation: isolate;
  border-color: rgba(255, 255, 255, 0.82);
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.45), transparent 18%),
    linear-gradient(135deg, #ff7a7a 0%, #f59e0b 18%, #fde047 34%, #4ade80 50%, #38bdf8 66%, #818cf8 82%, #f472b6 100%);
  background-size: 100% 100%, 180% 180%;
  color: #fffdf7;
  box-shadow:
    0 0 18px rgba(244, 114, 182, 0.2),
    0 0 30px rgba(56, 189, 248, 0.2),
    0 0 48px rgba(250, 204, 21, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.16);
  animation: offerGlow 2.8s ease-in-out infinite, offerPrism 6s linear infinite;
}

.element-item.offer::before,
.element-item.offer::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.element-item.offer::before {
  inset: -24%;
  background: conic-gradient(
    from 0deg,
    rgba(255, 255, 255, 0.05),
    rgba(248, 113, 113, 0.22),
    rgba(250, 204, 21, 0.18),
    rgba(96, 165, 250, 0.22),
    rgba(244, 114, 182, 0.18),
    rgba(255, 255, 255, 0.05)
  );
  opacity: 0.48;
  animation: offerHalo 7s linear infinite;
  z-index: 0;
}

.element-item.offer::after {
  top: -22%;
  bottom: -22%;
  left: -60%;
  width: 42%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.56), transparent);
  transform: rotate(16deg);
  animation: offerShine 3.1s ease-in-out infinite;
  z-index: 0;
}

.element-item.offer > * {
  position: relative;
  z-index: 1;
}

.picked-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 24px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(253, 224, 71, 0.55);
  color: #fde68a;
  font-size: 0.7rem;
  font-weight: 900;
}

.item-visual {
  width: 58px;
  height: 58px;
  margin-bottom: 10px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  font-size: 1.85rem;
  color: #e5e7eb;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.item-name {
  max-width: 12ch;
  font-size: 0.98rem;
  line-height: 1.2;
  font-weight: 800;
}

.item-desc {
  max-width: 14ch;
  margin-top: 6px;
  color: #cbd5e1;
  font-size: 0.74rem;
  line-height: 1.35;
  font-weight: 700;
}

.tier-1 {
  border-color: #64748b;
}

.tier-2 {
  border-color: #6b87ad;
}

.tier-3 {
  border-color: #7f83b9;
}

.tier-4 {
  border-color: #a08c53;
}

.tier-1 .item-visual {
  color: #dbeafe;
}

.crafted .item-visual {
  background: rgba(139, 92, 246, 0.18);
  color: #ddd6fe;
}

.stage-2.crafted .item-visual {
  background: rgba(250, 204, 21, 0.16);
  color: #fde68a;
}

.offer .item-visual {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.08));
  color: #fff;
  box-shadow:
    0 0 18px rgba(255, 255, 255, 0.18),
    inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  animation: offerGlow 2.8s ease-in-out infinite;
}

.selected .item-visual {
  background: rgba(255, 255, 255, 0.12);
  color: #fff9db;
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  max-width: min(720px, calc(100vw - 32px));
  padding: 14px 20px;
  border-radius: 999px;
  border: 2px solid #8b5cf6;
  background: rgba(30, 27, 75, 0.96);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.45);
  font-weight: 700;
  z-index: 30;
}

.toast.error {
  border-color: #ef4444;
  background: rgba(69, 10, 10, 0.96);
}

.toast-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-weight: 900;
}

.victory-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.84);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 40;
}

.victory-card {
  width: min(620px, 100%);
  padding: 34px;
  border-radius: 24px;
  border: 2px solid #fde047;
  background: linear-gradient(180deg, #1e3a8a, #0f172a);
  box-shadow: 0 0 60px rgba(253, 224, 71, 0.24);
  text-align: center;
}

.victory-glyph {
  width: 92px;
  height: 92px;
  margin: 0 auto 20px;
  border-radius: 50%;
  border: 2px solid rgba(253, 224, 71, 0.85);
  background: radial-gradient(circle at 30% 30%, rgba(253, 224, 71, 0.36), rgba(120, 53, 15, 0.3));
  display: grid;
  place-items: center;
  color: #fde68a;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-shadow: 0 0 16px rgba(253, 224, 71, 0.5);
}

.victory-card h3 {
  margin: 0 0 14px;
  color: #fde047;
  font-size: 2rem;
  font-family: Georgia, serif;
}

.victory-card p {
  margin: 0 0 18px;
  color: #cbd5e1;
  line-height: 1.65;
  font-family: Georgia, serif;
}

.victory-recipes {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(191, 219, 254, 0.16);
  color: #dbeafe;
  display: grid;
  gap: 10px;
  line-height: 1.5;
}

.victory-line {
  word-break: break-word;
}

.claim-btn {
  border: none;
  border-radius: 999px;
  padding: 13px 24px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.35);
  transition: 0.2s ease;
}

.claim-btn:hover {
  transform: translateY(-2px);
}

.mix-anim {
  animation: spinMix 0.6s ease-in-out;
}

.shake-error {
  animation: shake 0.4s forwards;
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes spinMix {
  0% {
    transform: scale(1) rotate(0deg);
    filter: hue-rotate(0deg);
  }

  50% {
    transform: scale(1.18) rotate(180deg);
    filter: hue-rotate(180deg);
  }

  100% {
    transform: scale(1) rotate(360deg);
    filter: hue-rotate(360deg);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-10px);
  }

  75% {
    transform: translateX(10px);
  }
}

@keyframes offerGlow {
  0%,
  100% {
    box-shadow:
      0 0 18px rgba(244, 114, 182, 0.18),
      0 0 30px rgba(56, 189, 248, 0.18),
      0 0 42px rgba(250, 204, 21, 0.18),
      inset 0 0 0 1px rgba(255, 255, 255, 0.14);
    filter: brightness(1);
  }

  50% {
    box-shadow:
      0 0 28px rgba(244, 114, 182, 0.3),
      0 0 42px rgba(56, 189, 248, 0.28),
      0 0 56px rgba(250, 204, 21, 0.3),
      inset 0 0 0 1px rgba(255, 255, 255, 0.22);
    filter: brightness(1.12) saturate(1.12);
  }
}

@keyframes offerPrism {
  0% {
    background-position: 0% 0%, 0% 50%;
  }

  50% {
    background-position: 0% 0%, 100% 50%;
  }

  100% {
    background-position: 0% 0%, 0% 50%;
  }
}

@keyframes offerHalo {
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(180deg) scale(1.04);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes offerShine {
  0% {
    transform: translateX(0) rotate(16deg);
    opacity: 0;
  }

  20% {
    opacity: 0.72;
  }

  60% {
    opacity: 0.48;
  }

  100% {
    transform: translateX(420%) rotate(16deg);
    opacity: 0;
  }
}

@media (max-width: 820px) {
  .alchemy-page {
    padding: 16px;
  }

  .alchemy-room {
    padding: 22px;
  }

  .cauldron-area {
    grid-template-columns: 1fr 32px 1fr;
  }

  .cauldron-btn {
    grid-column: 1 / -1;
    justify-self: center;
    margin-top: 6px;
  }
}

@media (max-width: 560px) {
  .section-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .hint-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .slot {
    width: 100%;
  }

  .plus-sign {
    font-size: 1.8rem;
  }

  .victory-card {
    padding: 24px 20px;
  }
}
</style>
