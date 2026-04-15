<template>
  <div class="action-game">
    <section class="astrolabe-room">
      <div class="header">
        <h2><i class="fas fa-atom"></i> {{ t('pages.y2_5.title') }}</h2>
        <p v-html="t('pages.y2_5.subtitle')"></p>
      </div>

      <KnowledgeGuidePanel
        :title="t('pages.y2_5.guide.title')"
        :body="t('pages.y2_5.guide.body')"
        :items="guideItems"
      />

      <div class="energy-panel">
        <i class="fas fa-star energy-icon"></i>
        <span>{{ t('pages.y2_5.available') }}</span>
        <strong>{{ availableAP }}</strong>
      </div>

      <div class="allocation-grid">
        <article v-for="task in tasks" :key="task.id" class="task-card" :class="{ active: points[task.id] > 0 }">
          <div class="task-icon">{{ task.emoji }}</div>
          <div class="task-name">{{ task.name }}</div>
          <div class="task-desc">{{ task.desc }}</div>
          <div class="controls-group">
            <button type="button" class="btn-ap" :disabled="points[task.id] <= 0" @click="updateAP(task.id, -1)">-</button>
            <span class="ap-value">{{ points[task.id] }}</span>
            <button type="button" class="btn-ap" :disabled="availableAP <= 0 || points[task.id] >= maxTaskAP" @click="updateAP(task.id, 1)">+</button>
          </div>
        </article>
      </div>

      <div class="action-area">
        <button type="button" class="btn-predict" @click="generateProphecy">
          <i class="fas fa-eye"></i> {{ t('pages.y2_5.predict') }}
        </button>
      </div>

      <section v-if="prophecy" class="prophecy-panel">
        <div class="prophecy-title"><i class="fas fa-scroll"></i> {{ t('pages.y2_5.prophecyTitle') }}</div>
        <p class="muted">{{ t('pages.y2_5.prophecyIntro') }}</p>

        <div class="top-3-list">
          <div v-for="item in topTasks" :key="item.id" class="top-item">
            <i class="fas" :class="item.icon"></i>
            <span>{{ item.name }} ({{ points[item.id] }} pt)</span>
          </div>
        </div>

        <div class="analysis-text" v-html="prophecy"></div>
        <div class="seasonal-pact" v-html="t('pages.y2_5.pact')"></div>
        <button type="button" class="btn-complete" @click="emit('complete')">{{ t('pages.y2_5.complete') }}</button>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const maxAP = 10
const maxTaskAP = 5
const taskDefs = [
  { id: 'gpa', emoji: '📚', icon: 'fa-book' },
  { id: 'lang', emoji: '🗣️', icon: 'fa-language' },
  { id: 'proj', emoji: '⚙️', icon: 'fa-cogs' },
  { id: 'res', emoji: '🔬', icon: 'fa-microscope' },
  { id: 'int', emoji: '💼', icon: 'fa-briefcase' },
  { id: 'comp', emoji: '⚔️', icon: 'fa-trophy' },
  { id: 'info', emoji: '🔮', icon: 'fa-globe' },
  { id: 'net', emoji: '🦉', icon: 'fa-comments' },
]

const tasks = computed(() => taskDefs.map((task) => ({
  ...task,
  name: t(`pages.y2_5.tasks.${task.id}.name`),
  desc: t(`pages.y2_5.tasks.${task.id}.desc`),
})))

const points = reactive(Object.fromEntries(taskDefs.map((task) => [task.id, 0])))
const prophecy = ref('')
const guideItems = computed(() => tm('pages.y2_5.guide.items') || [])

const spentAP = computed(() => Object.values(points).reduce((sum, value) => sum + value, 0))
const availableAP = computed(() => maxAP - spentAP.value)
const topTasks = computed(() => (
  [...tasks.value].sort((a, b) => points[b.id] - points[a.id]).slice(0, 3)
))

function updateAP(taskId, delta) {
  if (delta > 0 && (availableAP.value <= 0 || points[taskId] >= maxTaskAP)) return
  if (delta < 0 && points[taskId] <= 0) return
  points[taskId] += delta
  prophecy.value = ''
}

function generateProphecy() {
  if (availableAP.value > 0) {
    window.alert(t('pages.y2_5.alertUnspent', { count: availableAP.value }))
    return
  }

  const softInfo = points.info + points.net
  if (softInfo >= 4) {
    prophecy.value = t('pages.y2_5.prophecy.softInfo')
  } else if (points.int >= 3 && points.proj >= 2 && points.gpa >= 2) {
    prophecy.value = t('pages.y2_5.prophecy.techPath')
  } else if (points.res >= 4 && points.lang === 0) {
    prophecy.value = t('pages.y2_5.prophecy.researchNoLang')
  } else {
    prophecy.value = t('pages.y2_5.prophecy.steady')
  }

  // 自动滚动到预言面板
  nextTick(() => {
    const panel = document.querySelector('.prophecy-panel')
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
</script>

<style scoped>
.action-game {
  min-height: 100%;
  padding: 24px;
  color: #e2e8f0;
  background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
  display: grid;
  place-items: start center;
  overflow: auto;
}

.astrolabe-room {
  width: min(1000px, 100%);
  padding: 34px;
  background: rgba(30, 41, 59, 0.64);
  border: 2px solid #38bdf8;
  border-radius: 30px;
  box-shadow: 0 0 50px rgba(56, 189, 248, 0.18), inset 0 0 20px rgba(0, 0, 0, 0.75);
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0 0 10px;
  color: #e0f2fe;
  font-size: 2.1rem;
  font-family: Georgia, serif;
}

.header p {
  margin: 0;
  color: #a9b6ca;
  line-height: 1.55;
  font-family: Georgia, serif;
}

.energy-panel {
  width: fit-content;
  margin: 0 auto 28px;
  padding: 14px 28px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #0ea5e9;
  border-radius: 999px;
  display: flex;
  gap: 14px;
  align-items: center;
  color: #bae6fd;
  font-weight: 900;
}

.energy-icon,
.energy-panel strong {
  color: #fde047;
  font-size: 1.7rem;
}

.allocation-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
}

.task-card {
  padding: 15px 10px;
  min-height: 174px;
  border: 2px solid #475569;
  border-radius: 16px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  text-align: center;
}

.task-card.active {
  border-color: #fde047;
  background: linear-gradient(145deg, #334155, #1e293b);
  box-shadow: 0 0 15px rgba(253, 224, 71, 0.24);
}

.task-icon { font-size: 1.8rem; margin-bottom: 8px; }
.task-name { min-height: 2.2em; color: #f8fafc; font-size: 0.85rem; font-weight: 900; line-height: 1.2; }
.task-desc { min-height: 2.2em; margin: 6px 0 12px; color: #94a3b8; font-size: 0.72rem; line-height: 1.2; }

.controls-group {
  padding: 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-ap {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 6px;
  background: #334155;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn-ap:disabled {
  color: #475569;
  background: #1e293b;
  cursor: not-allowed;
}

.ap-value {
  color: #fde047;
  font-size: 1.1rem;
  font-weight: 900;
}

.action-area {
  margin-top: 28px;
  text-align: center;
}

.btn-predict,
.btn-complete {
  border: 0;
  border-radius: 999px;
  padding: 14px 36px;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn-predict {
  background: linear-gradient(135deg, #0ea5e9, #3b82f6);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.32);
}

.prophecy-panel {
  margin-top: 28px;
  padding: 24px;
  border: 2px solid #fde047;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.92);
}

.prophecy-title {
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ca8a04;
  color: #fde047;
  font-size: 1.3rem;
  font-family: Georgia, serif;
  font-weight: 900;
}

.muted {
  color: #94a3b8;
}

.top-3-list {
  display: flex;
  gap: 14px;
  margin: 18px 0;
}

.top-item {
  flex: 1;
  min-height: 100px;
  padding: 13px;
  border: 1px solid #475569;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.055);
  display: grid;
  place-items: center;
  text-align: center;
  gap: 6px;
  font-weight: 900;
}

.top-item i {
  color: #38bdf8;
  font-size: 1.5rem;
}

.analysis-text,
.seasonal-pact {
  padding: 15px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.32);
  color: #cbd5e1;
  line-height: 1.62;
  font-family: Georgia, serif;
}

.analysis-text :deep(strong),
.seasonal-pact b {
  color: #38bdf8;
}

.analysis-text :deep(.highlight-roi) {
  color: #fde047;
  font-weight: 900;
}

.seasonal-pact {
  margin-top: 15px;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.28);
}

.btn-complete {
  width: 100%;
  margin-top: 18px;
  background: linear-gradient(135deg, #22c55e, #15803d);
}

@media (max-width: 840px) {
  .allocation-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .top-3-list { flex-direction: column; }
}
</style>
