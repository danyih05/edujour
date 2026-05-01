<template>
  <div class="contract-guardian-page">
    <div class="game-container">
      <header class="header">
        <div class="title">
          <h1><i class="fas fa-shield-alt"></i> {{ t('pages.y2_6.title') }}</h1>
          <p>{{ t('pages.y2_6.subtitle') }}</p>
        </div>
        <div class="progress-badge">{{ t('pages.y2_6.progress', { current: protectedCount, total: totalClauses }) }}</div>
      </header>

      <div class="workspace">
        <KnowledgeGuidePanel
          :title="t('pages.y2_6.guide.button')"
          :body="t('pages.y2_6.guide.body')"
          :items="guideItems"
        />
        <section class="shard-pool" :aria-label="t('pages.y2_6.shieldsTitle')">
          <div class="shard-title">
            <i class="fas fa-puzzle-piece"></i>
            {{ t('pages.y2_6.shieldsTitle') }}
          </div>

          <div v-if="activeShield" class="selection-console">
            <div class="selection-label">{{ t('pages.y2_6.selectionLabel') }}</div>
            <div class="selection-card">
              <div class="selection-main">
                <span class="selection-icon">{{ activeShield.icon }}</span>
                <strong>{{ activeShield.name }}</strong>
              </div>
              <button class="selection-clear" type="button" @click="clearSelection">
                {{ t('pages.y2_6.clearSelection') }}
              </button>
            </div>
          </div>

          

          <div class="shard-columns">
            <div class="shard-column">
              <div class="shard-grid">
                <button
                  v-for="(shield, index) in leftShields"
                  :key="shield.id"
                  class="shard"
                  :class="{
                    dragging: draggingShieldId === shield.id,
                    selected: selectedShieldId === shield.id,
                    used: protectedStatus[shield.id],
                  }"
                  type="button"
                  draggable="true"
                  @click="selectShield(shield.id)"
                  @dragstart="startDrag($event, shield.id)"
                  @dragend="endDrag"
                >
                  <div class="shard-icon">{{ shield.icon }}</div>
                  <div class="shard-name">{{ shield.name }}</div>
                  <div class="shard-desc">{{ shield.desc }}</div>
                </button>
              </div>
            </div>
            <div class="shard-column">
              <div class="shard-grid">
                <button
                  v-for="(shield, index) in rightShields"
                  :key="shield.id"
                  class="shard"
                  :class="{
                    dragging: draggingShieldId === shield.id,
                    selected: selectedShieldId === shield.id,
                    used: protectedStatus[shield.id],
                  }"
                  type="button"
                  draggable="true"
                  @click="selectShield(shield.id)"
                  @dragstart="startDrag($event, shield.id)"
                  @dragend="endDrag"
                >
                  <div class="shard-icon">{{ shield.icon }}</div>
                  <div class="shard-name">{{ shield.name }}</div>
                  <div class="shard-desc">{{ shield.desc }}</div>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="contract" :aria-label="t('pages.y2_6.contractTitle')">
          <div class="contract-header">
            <h2>
              <i class="fas fa-file-signature"></i>
              {{ t('pages.y2_6.contractTitle') }}
            </h2>
            <i class="fas fa-stamp" aria-hidden="true"></i>
          </div>

          <div v-if="activeShield" class="contract-toolbar">
            <div class="active-shield-pill">
              <span>{{ activeShield.icon }}</span>
              <strong>{{ activeShield.name }}</strong>
            </div>
          </div>

          <div class="clause-list">
            <article
              v-for="clause in clauses"
              :key="clause.id"
              class="clause"
              :class="{ protected: protectedStatus[clause.id] }"
              @click="handleClauseClick(clause.id)"
            >
              <div class="clause-title">
                <span>{{ clause.title }}</span>
                <span class="clause-status">
                  {{ protectedStatus[clause.id] ? t('pages.y2_6.protected') : t('pages.y2_6.unprotected') }}
                </span>
              </div>
              <div class="clause-detail">{{ clause.detail }}</div>
              <div
                class="drop-zone"
                :class="{ 'drag-over': dragOverClauseId === clause.id }"
                @dragover.prevent="setDragOver(clause.id)"
                @dragleave="clearDragOver(clause.id)"
                @drop="handleDrop($event, clause.id)"
              >
                <template v-if="protectedStatus[clause.id]">
                  {{ t('pages.y2_6.shieldInstalled') }}
                </template>
                <template v-else>
                  <span v-if="!selectedShieldId" class="drop-placeholder" aria-hidden="true">+</span>
                  <button
                    v-if="selectedShieldId"
                    class="drop-action"
                    type="button"
                    @click.stop="handleClauseClick(clause.id)"
                  >
                    {{ t('pages.y2_6.installSelected') }}
                  </button>
                </template>
              </div>
            </article>
          </div>

          <button class="btn-complete" type="button" :disabled="protectedCount !== totalClauses" @click="completeContract">
            {{ t('pages.y2_6.complete') }}
          </button>
          <button class="btn-reset" type="button" @click="resetGame">
            {{ t('pages.y2_6.reset') }}
          </button>
        </section>
      </div>

      <div v-show="feedbackVisible" class="feedback" :class="feedbackTone" aria-live="polite">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        <span>{{ feedback }}</span>
      </div>
      <Transition name="toast-fade">
        <div v-if="errorToastVisible" class="error-toast">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ errorToastMessage }}</span>
        </div>
      </Transition>
    </div>

    <div class="modal" :class="{ show: successModalVisible }" :aria-hidden="(!successModalVisible).toString()">
      <div class="modal-card">
        <i class="fas fa-certificate modal-icon" aria-hidden="true"></i>
        <h2>{{ t('pages.y2_6.modalTitle') }}</h2>
        <p>{{ t('pages.y2_6.modalIntro') }}</p>
        <div class="mastery-block">
          <strong>{{ t('pages.y2_6.modalMasteredLabel') }}</strong>
          <ul>
            <li v-for="item in masteredItems" :key="item">{{ item }}</li>
          </ul>
        </div>
        <button type="button" @click="finishNode">{{ t('pages.y2_6.modalButton') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const emit = defineEmits(['complete'])
const { t, tm } = useAppI18n()
const errorToastVisible = ref(false)
const errorToastMessage = ref('')
let errorToastTimer = 0

const clauseIds = [
  'guarantee',
  'email',
  'template',
  'consultant',
  'research',
  'timing',
  'payment',
  'refund',
  'fees',
]

const shieldIcons = {
  guarantee: '⚠️',
  email: '📧',
  template: '📄',
  consultant: '👥',
  research: '🔍',
  timing: '📅',
  payment: '💰',
  refund: '⚖️',
  fees: '💸',
}

const localizedShields = computed(() => tm('pages.y2_6.shields') || {})
const localizedClauses = computed(() => tm('pages.y2_6.clauses') || {})
const masteredItems = computed(() => tm('pages.y2_6.mastered') || [])

const shields = computed(() => clauseIds.map((id) => ({
  id,
  icon: shieldIcons[id],
  ...(localizedShields.value[id] || {}),
})))

const shuffledShields = ref([])
const guideItems = computed(() => tm('pages.y2_6.guide.items') || [])

const leftShields = computed(() => shuffledShields.value.slice(0, Math.ceil(shuffledShields.value.length / 2)))
const rightShields = computed(() => shuffledShields.value.slice(Math.ceil(shuffledShields.value.length / 2)))

const clauses = computed(() => clauseIds.map((id) => ({
  id,
  ...(localizedClauses.value[id] || {}),
})))

const shieldMap = computed(() => Object.fromEntries(shields.value.map((shield) => [shield.id, shield])))
const clauseMap = computed(() => Object.fromEntries(clauses.value.map((clause) => [clause.id, clause])))
const activeShield = computed(() => shieldMap.value[selectedShieldId.value] || null)

const protectedStatus = reactive(Object.fromEntries(clauseIds.map((id) => [id, false])))
const totalClauses = clauseIds.length

const selectedShieldId = ref('')
const draggingShieldId = ref('')
const dragOverClauseId = ref('')
const feedback = ref('')
const feedbackVisible = ref(false)
const feedbackTone = ref('info')
const successModalVisible = ref(false)

const protectedCount = computed(() => clauseIds.filter((id) => protectedStatus[id]).length)

let feedbackTimer = 0

function clearFeedbackTimer() {
  if (!feedbackTimer) return
  window.clearTimeout(feedbackTimer)
  feedbackTimer = 0
}

function showErrorToast(message) {
  if (errorToastTimer) clearTimeout(errorToastTimer)
  errorToastMessage.value = message
  errorToastVisible.value = true
  errorToastTimer = setTimeout(() => {
    errorToastVisible.value = false
  }, 1000)
}

function showFeedback(message, durationSec = 2.5, tone = 'info') {
  feedback.value = message
  feedbackTone.value = tone
  feedbackVisible.value = true
  clearFeedbackTimer()

  if (durationSec <= 0) return

  feedbackTimer = window.setTimeout(() => {
    feedbackVisible.value = false
  }, durationSec * 1000)
}

function selectShield(shieldId) {
  if (protectedStatus[shieldId]) {
    showFeedback(t('pages.y2_6.feedback.alreadyUsed'), 2.5, 'error')
    return
  }

  selectedShieldId.value = selectedShieldId.value === shieldId ? '' : shieldId
}

function clearSelection() {
  if (!selectedShieldId.value) return
  selectedShieldId.value = ''
}

function startDrag(event, shieldId) {
  if (protectedStatus[shieldId]) {
    event.preventDefault()
    return
  }

  selectedShieldId.value = shieldId
  draggingShieldId.value = shieldId

  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', JSON.stringify({
    target: shieldId,
    name: shieldMap.value[shieldId]?.name || '',
  }))
}

function endDrag() {
  draggingShieldId.value = ''
  dragOverClauseId.value = ''
}

function readTransfer(event) {
  const rawData = event.dataTransfer?.getData('text/plain')
  if (!rawData) return null

  try {
    return JSON.parse(rawData)
  } catch (error) {
    return {
      target: rawData,
      name: shieldMap.value[rawData]?.name || '',
    }
  }
}

function setDragOver(clauseId) {
  if (protectedStatus[clauseId]) return
  dragOverClauseId.value = clauseId
}

function clearDragOver(clauseId) {
  if (dragOverClauseId.value === clauseId) {
    dragOverClauseId.value = ''
  }
}

function applyShield(clauseId, shieldId) {
  if (!shieldId) return false

  if (protectedStatus[clauseId]) {
    showFeedback(t('pages.y2_6.feedback.alreadyProtected'), 2.5, 'error')
    return false
  }

  if (shieldId !== clauseId) {
    const shieldName = shieldMap.value[shieldId]?.name || ''
    const currentClauseName = clauseMap.value[clauseId]?.title || ''
    const expectedClauseName = clauseMap.value[shieldId]?.title || ''
    const errorMsg = t('pages.y2_6.feedback.mismatchDetail', {
      shield: shieldName,
      currentClause: currentClauseName,
      expectedClause: expectedClauseName,
    })
    showErrorToast(errorMsg)
    return false
  }

  protectedStatus[clauseId] = true
  selectedShieldId.value = ''
  draggingShieldId.value = ''
  dragOverClauseId.value = ''

  showFeedback(t('pages.y2_6.feedback.attached', {
    name: shieldMap.value[clauseId]?.name || '',
    explanation: clauseMap.value[clauseId]?.explanation || '',
  }), 4, 'success')

  return true
}

function handleDrop(event, clauseId) {
  event.preventDefault()
  dragOverClauseId.value = ''

  const data = readTransfer(event)
  if (!data) return

  applyShield(clauseId, data.target)
}

function handleClauseClick(clauseId) {
  if (!selectedShieldId.value) return
  applyShield(clauseId, selectedShieldId.value)
}

function resetGame() {
  clauseIds.forEach((id) => {
    protectedStatus[id] = false
  })

  selectedShieldId.value = ''
  draggingShieldId.value = ''
  dragOverClauseId.value = ''
  successModalVisible.value = false
  feedbackVisible.value = false
  clearFeedbackTimer()
  shuffleShields()
}

function completeContract() {
  if (protectedCount.value !== totalClauses) {
    showFeedback(t('pages.y2_6.feedback.remaining', {
      count: totalClauses - protectedCount.value,
    }), 2.5, 'error')
    return
  }

  clearFeedbackTimer()
  feedbackVisible.value = false
  successModalVisible.value = true
}

function finishNode() {
  successModalVisible.value = false
  emit('complete', { game: 'contract-guardian', protected: totalClauses, rewardCoins: 30 })
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

onMounted(() => {
  shuffledShields.value = shuffleArray([...shields.value])
})

onBeforeUnmount(() => {
  clearFeedbackTimer()
  if (errorToastTimer) clearTimeout(errorToastTimer)
})
</script>

<style scoped>
.contract-guardian-page {
  min-height: 100%;
  padding: 20px;
  color: #f1f5f9;
  background:
    radial-gradient(circle at 18% 18%, rgba(52, 211, 153, 0.18), transparent 22%),
    radial-gradient(circle at 82% 14%, rgba(250, 204, 21, 0.16), transparent 20%),
    radial-gradient(ellipse at 50% 100%, #083344 0%, #101826 58%, #05070c 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.contract-guardian-page,
.contract-guardian-page * {
  box-sizing: border-box;
}

.game-container {
  width: 100%;
  max-width: 1320px;
  background: rgba(8, 14, 26, 0.82);
  border: 2px solid rgba(250, 204, 21, 0.52);
  border-radius: 32px;
  box-shadow: 0 28px 42px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.header {
  padding: 22px 30px;
  background: linear-gradient(135deg, rgba(13, 24, 42, 0.96), rgba(7, 10, 18, 0.98));
  border-bottom: 1px solid rgba(250, 204, 21, 0.32);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title h1 {
  margin: 0;
  color: #fde68a;
  font-size: 2rem;
  font-family: Georgia, serif;
  text-shadow: 0 0 14px rgba(250, 204, 21, 0.28);
}

.title p {
  margin: 7px 0 0;
  color: #cbd5e1;
  line-height: 1.5;
  max-width: 820px;
}

.progress-badge {
  background: #111827;
  padding: 9px 20px;
  border-radius: 999px;
  color: #facc15;
  font-weight: 900;
  border: 1px solid rgba(250, 204, 21, 0.45);
  white-space: nowrap;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(360px, 1.05fr) minmax(430px, 1fr);
  gap: 24px;
  padding: 26px 30px 30px;
  align-items: stretch;
}

.shard-pool {
  position: sticky;
  top: 18px;
  align-self: start;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(250, 204, 21, 0.2);
  border-radius: 26px;
  padding: 20px;
  overflow-x: auto;
  overflow-y: auto;     
  max-height: 580px;
}

.shard-title,
.contract-header h2 {
  color: #fde68a;
  font-size: 1.15rem;
  font-family: Georgia, serif;
  display: flex;
  align-items: center;
  gap: 9px;
}

.shard-title {
  margin-bottom: 8px;
}

.selection-console {
  margin-bottom: 16px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(250, 204, 21, 0.18);
  background: rgba(5, 10, 18, 0.44);
}

.selection-label {
  color: #fde68a;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.selection-card {
  margin-top: 9px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.selection-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

  .shuffle-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    color: #f8f9fa;
    cursor: pointer;
  }

  .shuffle-action {
    font-weight: 900;
    color: #facc15;
  }

  .shuffle-note {
    color: #d1d5db;
    font-size: 0.92rem;
    line-height: 1.4;
  }

  .shuffle-row:hover .shuffle-action {
    text-decoration: underline;
  }
.selection-card strong {
  color: #f8fafc;
}

.selection-clear {
  flex: 0 0 auto;
  border: 1px solid rgba(250, 204, 21, 0.55);
  background: rgba(17, 24, 39, 0.9);
  color: #fde68a;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 900;
  cursor: pointer;
}

.shard-columns {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.shard-column {
  flex: 1;
  min-width: 200px;
  padding-right: 6px;
}

.shard-column::-webkit-scrollbar {
  width: 8px;
}

.shard-column::-webkit-scrollbar-thumb {
  background: rgba(250, 204, 21, 0.2);
  border-radius: 999px;
}

.shard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 13px;
}

.shard {
  min-height: 136px;
  background: linear-gradient(145deg, #24324f, #142033);
  border: 1px solid #60718f;
  border-radius: 18px;
  padding: 13px 10px;
  cursor: grab;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  color: inherit;
}

.shard:hover,
.shard.selected {
  transform: translateY(-4px);
  border-color: #facc15;
  box-shadow: 0 8px 18px rgba(250, 204, 21, 0.2);
}

.shard.dragging {
  opacity: 0.55;
  transform: scale(0.98);
}

.shard.used {
  opacity: 0.42;
  filter: grayscale(0.85);
  cursor: default;
  box-shadow: none;
  transform: none;
}

.shard-icon {
  font-size: 2rem;
}

.shard-name {
  color: #f8fafc;
  font-weight: 900;
  font-size: 0.92rem;
  line-height: 1.25;
}

.shard-desc {
  color: #aebbd0;
  font-size: 0.76rem;
  line-height: 1.35;
}

.contract {
  background: linear-gradient(to bottom, #fff8e7, #f3e8c7);
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 18px 30px rgba(0, 0, 0, 0.34);
  color: #2d2a1e;
}

.contract-header {
  border-bottom: 2px solid #d4a373;
  padding-bottom: 12px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.contract-header h2 {
  color: #7f4f24;
  font-size: 1.25rem;
  margin: 0;
}

.contract-toolbar {
  margin-bottom: 14px;
  display: flex;
  justify-content: flex-end;
}

.active-shield-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.2);
  color: #6b3b09;
  font-size: 0.8rem;
  font-weight: 900;
}

.clause-list {
  display: grid;
  gap: 13px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 6px;
}

.clause {
  background: rgba(0, 0, 0, 0.055);
  border-left: 6px solid #b5835a;
  border-radius: 14px;
  padding: 12px 14px;
  transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.clause.protected {
  border-left-color: #2b9348;
  background: #e9f5e9;
  box-shadow: 0 2px 8px rgba(43, 147, 72, 0.22);
}

.clause-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  line-height: 1.3;
}

.clause-status {
  flex: 0 0 auto;
  background: #d6d3d1;
  color: #3f3a31;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.74rem;
  font-weight: 900;
}

.clause.protected .clause-status {
  background: #2b9348;
  color: #fff;
}

.clause-detail {
  color: #534432;
  font-size: 0.85rem;
  line-height: 1.45;
  margin-top: 7px;
}

.drop-zone {
  margin-top: 9px;
  border: 2px dashed #b5835a;
  border-radius: 12px;
  padding: 9px;
  text-align: center;
  color: #7a6645;
  background: rgba(255, 255, 255, 0.4);
  font-size: 0.76rem;
  font-weight: 800;
  transition: border-color 0.1s ease, background 0.1s ease, color 0.1s ease;
  display: grid;
  gap: 8px;
  justify-items: center;
}

.drop-zone.drag-over {
  border-color: #f59e0b;
  background: rgba(250, 204, 21, 0.2);
  color: #6b3b09;
}

.drop-placeholder {
  font-size: 1.2rem;
  line-height: 1;
  opacity: 0.55;
}

.drop-action {
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  background: #7f4f24;
  color: #fff8e7;
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
}

.feedback {
  margin: 0 30px 30px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.62);
  border-left: 6px solid #facc15;
  color: #f8fafc;
  line-height: 1.55;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.feedback.success {
  border-left-color: #22c55e;
}

.feedback.error {
  border-left-color: #f97316;
}

.btn-complete,
.btn-reset,
.modal-card button {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 13px 18px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease;
}

.btn-complete {
  margin-top: 18px;
  background: linear-gradient(95deg, #facc15, #f97316);
  color: #1f2937;
  font-size: 1rem;
}

.btn-complete:not(:disabled):hover,
.btn-reset:hover,
.modal-card button:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.btn-complete:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(0.45);
}

.btn-reset {
  margin-top: 11px;
  background: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(250, 204, 21, 0.55);
  color: #fde68a;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.84);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  visibility: hidden;
  opacity: 0;
  padding: 18px;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.modal.show {
  visibility: visible;
  opacity: 1;
}

.modal-card {
  width: min(560px, 94vw);
  max-height: 88vh;
  overflow: auto;
  background: #111827;
  color: #f1f5f9;
  border: 2px solid #facc15;
  border-radius: 28px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 24px 44px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  font-size: 3rem;
  color: #facc15;
}

.modal-card h2 {
  margin: 16px 0;
  color: #fde68a;
  font-family: Georgia, serif;
}

.modal-card p,
.mastery-block {
  color: #dbe4f0;
  line-height: 1.65;
  text-align: left;
}

.mastery-block {
  margin-top: 14px;
}

.mastery-block strong {
  color: #fde68a;
}

.mastery-block ul {
  margin: 10px 0 0;
  padding-left: 20px;
}

.mastery-block li + li {
  margin-top: 6px;
}

.modal-card button {
  margin-top: 20px;
  background: #facc15;
  color: #111827;
}

@media (max-width: 768px) {
  .contract-guardian-page {
    padding: 6px;
  }

  .game-container {
    border-radius: 16px;
  }

  .header {
    padding: 8px 10px;
    gap: 8px;
  }
  .title h1 {
    font-size: 1.1rem;
  }
  .title p {
    font-size: 0.68rem;
    margin-top: 2px;
    max-width: none;
  }
  .progress-badge {
    font-size: 0.7rem;
    padding: 4px 10px;
    white-space: nowrap;
  }

  .workspace {
    grid-template-columns: 1fr 1.15fr;
    padding: 6px;
    gap: 6px;
  }

  /* 护盾区 */
  .shard-pool {
    position: static;
    padding: 6px;
    border-radius: 14px;
    max-height: none;
    overflow-y: auto;
  }
  .shard-title {
    font-size: 0.72rem;
    margin-bottom: 4px;
    gap: 4px;
  }
  .selection-console {
    padding: 6px;
    margin-bottom: 6px;
    border-radius: 10px;
  }
  .selection-label {
    font-size: 0.6rem;
  }
  .selection-card {
    margin-top: 4px;
    gap: 6px;
  }
  .selection-main {
    gap: 6px;
  }
  .selection-icon {
    font-size: 0.9rem;
  }
  .selection-main strong {
    font-size: 0.7rem;
  }
  .selection-clear {
    padding: 4px 8px;
    font-size: 0.6rem;
    min-height: 32px;
  }

  /* 关键：左右两栏保持并排，内部各变成两列 */
  .shard-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    overflow-x: visible;
    padding-bottom: 0;
  }

  .shard-column {
    min-width: 0;
    padding-right: 0;
  }

  .shard-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 4px;
  }

  .shard {
    min-height: 68px;
    padding: 6px;
    border-radius: 10px;
    gap: 2px;
  }
  .shard-icon {
    font-size: 1.1rem;
  }
  .shard-name {
    font-size: 0.62rem;
    line-height: 1.15;
  }
  .shard-desc {
    display: none;            /* 手机端隐藏描述 */
  }

  /* 合同区（保持不变） */
  .contract {
    padding: 8px;
    border-radius: 14px;
  }
  .contract-header {
    padding-bottom: 6px;
    margin-bottom: 6px;
    gap: 6px;
  }
  .contract-header h2 {
    font-size: 0.78rem;
  }
  .contract-toolbar {
    margin-bottom: 6px;
  }
  .active-shield-pill {
    padding: 4px 8px;
    font-size: 0.62rem;
    gap: 4px;
  }

  .clause-list {
    gap: 5px;
    max-height: 360px;
    padding-right: 2px;
  }
  .clause {
    padding: 6px 8px;
    border-radius: 8px;
    border-left-width: 4px;
  }
  .clause-title {
    font-size: 0.68rem;
    gap: 4px;
  }
  .clause-status {
    font-size: 0.58rem;
    padding: 2px 5px;
  }
  .clause-detail {
    font-size: 0.6rem;
    margin-top: 3px;
    line-height: 1.3;
  }

  .drop-zone {
    margin-top: 4px;
    padding: 5px;
    border-radius: 6px;
    font-size: 0.6rem;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .drop-action {
    padding: 5px 10px;
    font-size: 0.62rem;
    min-height: 32px;
  }

  .btn-complete,
  .btn-reset {
    padding: 8px 14px;
    font-size: 0.78rem;
    min-height: 44px;
    margin-top: 8px;
  }

  .feedback {
    margin: 6px;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 0.72rem;
  }

  .modal-card {
    padding: 16px;
    border-radius: 16px;
  }
  .modal-card h2 {
    font-size: 1rem;
  }
  .modal-card p,
  .mastery-block {
    font-size: 0.78rem;
  }
  .modal-card button {
    min-height: 44px;
  }

  .error-toast {
    font-size: 0.82rem;
    padding: 10px 16px;
    max-width: 90vw;
  }
}
</style>
