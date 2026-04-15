<template>
  <div class="clinic-root">
    <button class="close-btn" type="button" @click="$emit('close')">
      <i class="fas fa-arrow-left"></i>
      {{ t('pages.y3_3.back') }}
    </button>

    <button class="guide-btn" type="button" @click="showGuide = true">
      <i class="fas fa-book-open"></i>
      {{ t('pages.y3_3.guide.button') }}
    </button>

    <div class="clinic-room">
      <div class="header">
        <h2><i class="fas fa-microscope" style="color:#f9d976;"></i> {{ t('pages.y3_3.title') }}</h2>
        <p>{{ t('pages.y3_3.intro') }}</p>
        <div class="status-pill">
          <span>{{ t('pages.y3_3.status') }}</span>
          <strong>{{ foundCoreCount }}/{{ coreBugIds.length }}</strong>
        </div>
      </div>

      <div class="workspace">
        <div class="parchment-cv">
          <div
            class="cv-filename bug-text"
            :class="{ fixed: isFound('filename') }"
            @click="findBug('filename')"
          >
            {{ t('pages.y3_3.cv.filename') }}
          </div>

          <div class="cv-body">
            <div class="cv-header">
              <h1
                class="bug-text name-text"
                :class="{ fixed: isFound('font') }"
                @click="findBug('font')"
              >
                {{ t('pages.y3_3.cv.name') }}
              </h1>
              <p>
                {{ t('pages.y3_3.cv.contactLabel') }}
                <span class="bug-text" :class="{ fixed: isFound('email') }" @click="findBug('email')">
                  {{ t('pages.y3_3.cv.email') }}
                </span>
                <span class="contact-sep">|</span>
                {{ t('pages.y3_3.cv.phone') }}
              </p>
            </div>

            <div class="cv-section">
              <h3><i class="fas fa-graduation-cap"></i> {{ t('pages.y3_3.sections.education') }}</h3>
              <div class="cv-item">
                <strong>{{ t('pages.y3_3.cv.school') }}</strong>
                <span class="float-right">{{ t('pages.y3_3.cv.schoolYears') }}</span><br>
                {{ t('pages.y3_3.cv.gpaLabel') }}
                <span class="bug-text" :class="{ fixed: isFound('gpa') }" @click="findBug('gpa')">
                  {{ t('pages.y3_3.cv.gpa') }}
                </span>
                <div class="sub-item">
                  <span class="bug-text" :class="{ fixed: isFound('hs') }" @click="findBug('hs')">
                    {{ t('pages.y3_3.cv.hs') }}
                  </span>
                </div>
              </div>
            </div>

            <div class="cv-section">
              <h3><i class="fas fa-briefcase"></i> {{ t('pages.y3_3.sections.experience') }}</h3>
              <div class="cv-item">
                <strong>{{ t('pages.y3_3.cv.role') }}</strong>
                <span class="float-right">{{ t('pages.y3_3.cv.roleTime') }}</span>
                <ul class="cv-bullet">
                  <li>
                    <span class="bug-text" :class="{ fixed: isFound('vague') }" @click="findBug('vague')">
                      {{ t('pages.y3_3.cv.vague') }}
                    </span>
                  </li>
                  <li>
                    <span class="bug-text" :class="{ fixed: isFound('passive') }" @click="findBug('passive')">
                      {{ t('pages.y3_3.cv.passive') }}
                    </span>
                  </li>
                </ul>
              </div>
              <div class="cv-item muted">
                <span class="bug-text" :class="{ fixed: isFound('order') }" @click="findBug('order')">
                  {{ t('pages.y3_3.cv.order') }}
                </span>
              </div>
            </div>

            <div class="cv-section">
              <h3><i class="fas fa-tools"></i> {{ t('pages.y3_3.sections.additional') }}</h3>
              <ul class="cv-bullet">
                <li>
                  {{ t('pages.y3_3.cv.skillLabel') }}
                  <span class="bug-text" :class="{ fixed: isFound('score') }" @click="findBug('score')">
                    {{ t('pages.y3_3.cv.score') }}
                  </span>
                </li>
                <li>
                  <span class="bug-text" :class="{ fixed: isFound('hobby') }" @click="findBug('hobby')">
                    {{ t('pages.y3_3.cv.hobby') }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="diagnostic-panel">
          <div class="panel-title">
            <i class="fas fa-clipboard-list"></i>
            {{ t('pages.y3_3.checklistTitle') }}
          </div>

          <ul class="checklist">
            <li
              v-for="id in coreBugIds"
              :key="id"
              class="check-item"
              :class="{ completed: isFound(id) }"
            >
              <i :class="isFound(id) ? 'fas fa-check-square' : 'far fa-square'"></i>
              <span>{{ t(`pages.y3_3.checklist.${id}`) }}</span>
            </li>
          </ul>

          <div class="feedback-box" :class="{ visible: feedback.title }">
            <div class="feedback-title">{{ feedback.title || t('pages.y3_3.defaultTitle') }}</div>
            <div class="feedback-desc" v-html="feedback.desc || t('pages.y3_3.defaultDesc')"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="success-modal" :class="{ show: allCoreFound }">
      <div class="modal-card">
        <h2><i class="fas fa-check-circle"></i> {{ t('pages.y3_3.success.title') }}</h2>
        <p class="modal-desc">{{ t('pages.y3_3.success.desc') }}</p>
        <div class="modal-emoji"><i class="fas fa-scroll"></i></div>
        <button class="btn-claim" type="button" @click="completeAndClose">
          {{ t('pages.y3_3.success.cta') }}
        </button>
      </div>
    </div>

    <div class="guide-modal" :class="{ show: showGuide }">
      <div class="guide-card">
        <div class="guide-title">{{ t('pages.y3_3.guide.title') }}</div>
        <p class="guide-intro">{{ t('pages.y3_3.guide.intro') }}</p>
        <ul class="guide-list">
          <li v-for="(item, index) in guideItems" :key="index">{{ item }}</li>
        </ul>
        <button class="guide-close" type="button" @click="showGuide = false">
          {{ t('pages.y3_3.guide.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const coreBugIds = ['filename', 'email', 'gpa', 'vague', 'hobby', 'font']
const bugDatabase = computed(() => tm('pages.y3_3.bugs') || {})

const foundIds = reactive(new Set())
const feedback = reactive({ title: '', desc: '' })
const showGuide = ref(false)

const foundCoreCount = computed(() => coreBugIds.filter((id) => foundIds.has(id)).length)
const allCoreFound = computed(() => foundCoreCount.value === coreBugIds.length)
const guideItems = computed(() => tm('pages.y3_3.guide.items') || [])

function isFound(id) {
  return foundIds.has(id)
}

function findBug(id) {
  const bug = bugDatabase.value?.[id]
  if (!bug) return
  if (isFound(id)) return

  feedback.title = bug.title
  feedback.desc = bug.desc

  foundIds.add(id)
}

function completeAndClose() {
  if (!allCoreFound.value) return
  showGuide.value = false
  feedback.title = t('pages.y3_3.success.title')
  feedback.desc = t('pages.y3_3.success.toast')
  emit('complete', { game: 'cv-surgery', fixed: foundCoreCount.value })
}
</script>

<style scoped>
.clinic-root {
  min-height: 100%;
  padding: clamp(18px, 4vw, 64px);
  color: #e0d8ee;
  background: radial-gradient(circle at center, #2e1a10 0%, #0d0905 100%);
  position: relative;
}

.close-btn,
.guide-btn,
.btn-claim,
.guide-close {
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
}

.close-btn {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 20;
  padding: 8px 14px;
  color: #f9d976;
  background: rgba(13, 9, 5, 0.8);
  border: 1px solid rgba(249, 217, 118, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.guide-btn {
  position: fixed;
  top: 68px;
  right: 18px;
  z-index: 20;
  padding: 8px 14px;
  color: #f9d976;
  background: rgba(13, 9, 5, 0.8);
  border: 1px solid rgba(249, 217, 118, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.clinic-room {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 25px;
}

.header h2 {
  margin: 0;
  font-size: 2.3rem;
  color: #f9d976;
  text-shadow: 0 5px 15px rgba(249, 217, 118, 0.4);
  font-family: Georgia, serif;
  letter-spacing: 1px;
}

.header p {
  color: #a99bbd;
  font-size: 1.05rem;
  margin-top: 10px;
  font-family: Georgia, serif;
  font-style: italic;
}

.status-pill {
  margin-top: 14px;
  padding: 8px 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(249, 217, 118, 0.18);
  border: 1px solid rgba(249, 217, 118, 0.45);
  font-weight: 700;
}

.workspace {
  display: flex;
  gap: 30px;
  width: 100%;
  align-items: flex-start;
}

.parchment-cv {
  background: linear-gradient(135deg, #fdf5e6, #ebd5ab);
  width: 60%;
  padding: 40px;
  border-radius: 5px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), inset 0 0 50px rgba(139, 69, 19, 0.2);
  color: #2c1e16;
  position: relative;
  cursor: crosshair;
  border: 2px solid #c8a165;
}

.cv-filename {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: rgba(0, 0, 0, 0.7);
  color: #82b1ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.cv-body {
  font-family: Papyrus, "Courier New", serif;
}

.cv-header {
  text-align: center;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.cv-header h1 {
  margin: 0;
  font-size: 1.8rem;
  text-transform: uppercase;
}

.cv-section {
  margin-bottom: 20px;
}

.cv-section h3 {
  font-size: 1.1rem;
  color: #5d4037;
  border-bottom: 1px dashed #a1887f;
  padding-bottom: 5px;
  margin-bottom: 10px;
  font-family: Georgia, serif;
}

.cv-item {
  margin-bottom: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.cv-item.muted {
  opacity: 0.6;
}

.cv-bullet {
  list-style-type: square;
  margin-left: 18px;
  margin-top: 5px;
}

.bug-text {
  cursor: pointer;
  position: relative;
  transition: 0.2s;
  border-bottom: 1px dotted rgba(200, 0, 0, 0.5);
}

.bug-text:hover {
  background: rgba(249, 217, 118, 0.6);
  border-radius: 3px;
}

.bug-text.fixed {
  color: #c0392b;
  text-decoration: line-through;
  border: none;
  background: rgba(231, 76, 60, 0.1);
  pointer-events: none;
}

.bug-text.fixed::after {
  content: 'REJECTED';
  position: absolute;
  top: -12px;
  right: -30px;
  color: #c0392b;
  font-weight: 900;
  font-size: 0.65rem;
  border: 2px solid #c0392b;
  padding: 2px 4px;
  border-radius: 4px;
  transform: rotate(-15deg);
  background: rgba(255, 255, 255, 0.9);
  z-index: 5;
  font-family: sans-serif;
}

.name-text {
  border: none;
  display: inline-block;
}

.contact-sep {
  margin: 0 6px;
}

.float-right {
  float: right;
}

.sub-item {
  font-size: 0.8rem;
  margin-top: 5px;
}

.diagnostic-panel {
  width: 40%;
  background: rgba(30, 20, 25, 0.85);
  border: 2px solid #8d6e63;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  position: sticky;
  top: 20px;
}

.panel-title {
  color: #f9d976;
  font-size: 1.25rem;
  font-weight: bold;
  font-family: Georgia, serif;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 2px dashed #5d4037;
  padding-bottom: 10px;
}

.checklist {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.check-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a0aec0;
  transition: 0.3s;
  border: 1px solid #4e342e;
  font-size: 0.85rem;
  font-weight: bold;
}

.check-item i {
  font-size: 1.1rem;
  color: #5d4037;
}

.check-item.completed {
  background: rgba(72, 187, 120, 0.15);
  border-color: #2ecc71;
  color: #fff;
}

.check-item.completed i {
  color: #2ecc71;
}

.feedback-box {
  background: #2c1e16;
  border-left: 4px solid #f9d976;
  padding: 15px;
  border-radius: 4px;
  display: block;
  animation: fadeIn 0.3s ease;
}

.feedback-title {
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 8px;
  font-size: 1.05rem;
  font-family: Georgia, serif;
}

.feedback-desc {
  color: #d7ccc8;
  font-size: 0.95rem;
  line-height: 1.5;
  font-family: Georgia, serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.success-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.success-modal.show {
  display: flex;
}

.modal-card {
  background: linear-gradient(135deg, #2e1a10, #3e2723);
  border: 3px solid #f9d976;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
}

.modal-card h2 {
  color: #2ecc71;
  margin-bottom: 15px;
  font-family: Georgia, serif;
}

.modal-desc {
  color: #bcaaa4;
  margin-bottom: 20px;
  font-family: Georgia, serif;
  line-height: 1.5;
}

.modal-emoji {
  font-size: 3.5rem;
  margin: 15px 0;
  filter: drop-shadow(0 0 10px rgba(249, 217, 118, 0.5));
}

.btn-claim {
  margin-top: 10px;
  background: #f9d976;
  color: #3e2723;
  border: none;
  padding: 12px 35px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-claim:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(249, 217, 118, 0.4);
}

.guide-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: none;
  place-items: center;
  z-index: 110;
}

.guide-modal.show {
  display: grid;
}

.guide-card {
  width: min(560px, 92vw);
  background: #1b120c;
  border: 2px solid rgba(249, 217, 118, 0.45);
  border-radius: 16px;
  padding: 28px;
  color: #fef3c7;
}

.guide-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.guide-intro {
  color: #f3e8ff;
  margin-bottom: 14px;
  line-height: 1.5;
}

.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
  color: #fde68a;
}

.guide-close {
  margin-top: 18px;
  padding: 10px 18px;
  background: #f9d976;
  color: #3e2723;
  border: none;
  font-weight: 700;
}

@media (max-width: 900px) {
  .workspace {
    flex-direction: column;
  }

  .parchment-cv,
  .diagnostic-panel {
    width: 100%;
  }

  .close-btn,
  .guide-btn {
    position: static;
    margin-bottom: 12px;
  }
}
</style>
