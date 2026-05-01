<template>
  <section class="onboarding-shell" role="dialog" aria-modal="true" :aria-label="copy.title">
    <div class="onboarding-card">
      <div class="onboarding-topline">
        <span class="eyebrow">{{ copy.eyebrow }}</span>
        <span v-if="levelTitle" class="level-chip">{{ levelTitle }}</span>
      </div>

      <h2>{{ guideTitle }}</h2>
      <p class="summary">{{ summaryText }}</p>

      <div class="interaction-list">
        <article
          v-for="(step, index) in normalizedSteps"
          :key="`${step.action || 'step'}-${index}`"
          class="interaction-item"
        >
          <span class="interaction-icon" aria-hidden="true">
            <i :class="iconClass(step.action)"></i>
          </span>
          <div>
            <strong>{{ localize(step.label) || fallbackActionLabel(step.action) }}</strong>
            <p>{{ localize(step.description) }}</p>
          </div>
        </article>
      </div>

      <div v-if="noteText" class="onboarding-note">
        <i class="fas fa-circle-info" aria-hidden="true"></i>
        <span>{{ noteText }}</span>
      </div>

      <div class="onboarding-actions">
        <button type="button" class="start-btn" @click="$emit('start')">
          <i class="fas fa-play" aria-hidden="true"></i>
          <span>{{ copy.start }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

defineEmits(['start'])

const props = defineProps({
  guide: {
    type: Object,
    default: () => ({}),
  },
  levelTitle: {
    type: String,
    default: '',
  },
})

const { currentLanguage, localize } = useAppI18n()

const ACTION_ICONS = {
  click: 'fas fa-hand-pointer',
  tap: 'fas fa-hand-pointer',
  select: 'fas fa-list-check',
  drag: 'fas fa-arrows-up-down-left-right',
  drop: 'fas fa-box-open',
  submit: 'fas fa-circle-check',
  scroll: 'fas fa-computer-mouse',
}

const ACTION_LABELS = {
  zh: {
    click: '点击 / 轻触',
    tap: '轻触',
    select: '选择',
    drag: '拖拽',
    drop: '放置',
    submit: '提交',
    scroll: '滚动',
    default: '操作',
  },
  en: {
    click: 'Click / tap',
    tap: 'Tap',
    select: 'Select',
    drag: 'Drag',
    drop: 'Drop',
    submit: 'Submit',
    scroll: 'Scroll',
    default: 'Action',
  },
}

const COPY = {
  zh: {
    title: '玩前操作指引',
    eyebrow: '玩前指引',
    fallbackTitle: '先看操作方式',
    fallbackSummary: '开始前先确认本关需要点击、拖拽或提交的位置。',
    start: '开始挑战',
  },
  en: {
    title: 'Pre-play interaction guide',
    eyebrow: 'Before You Play',
    fallbackTitle: 'Check the controls first',
    fallbackSummary: 'Before starting, review where to click, drag, drop, or submit in this level.',
    start: 'Start Challenge',
  },
}

const copy = computed(() => (currentLanguage.value === 'en' ? COPY.en : COPY.zh))
const guideTitle = computed(() => localize(props.guide.title) || copy.value.fallbackTitle)
const summaryText = computed(() => localize(props.guide.summary) || copy.value.fallbackSummary)
const noteText = computed(() => localize(props.guide.note))
const normalizedSteps = computed(() => (
  Array.isArray(props.guide.steps) && props.guide.steps.length
    ? props.guide.steps
    : [{ action: 'click', description: copy.value.fallbackSummary }]
))

function iconClass(action) {
  return ACTION_ICONS[action] || ACTION_ICONS.click
}

function fallbackActionLabel(action) {
  const labels = currentLanguage.value === 'en' ? ACTION_LABELS.en : ACTION_LABELS.zh
  return labels[action] || labels.default
}
</script>

<style scoped>
.onboarding-shell {
  min-height: 100%;
  padding: 28px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 16% 18%, rgba(14, 165, 233, 0.18) 0%, transparent 24%),
    radial-gradient(circle at 82% 12%, rgba(245, 158, 11, 0.16) 0%, transparent 22%),
    linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.95));
  color: #f8fafc;
}

.onboarding-shell.floating {
  position: absolute;
  inset: 0;
  z-index: 80;
  min-height: 0;
  background: rgba(7, 10, 20, 0.76);
  backdrop-filter: blur(8px);
}

.onboarding-card {
  width: min(760px, 100%);
  padding: 26px;
  border-radius: 22px;
  background: rgba(255, 252, 243, 0.98);
  color: #243142;
  border: 2px solid rgba(226, 188, 124, 0.82);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.34);
}

.onboarding-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.eyebrow {
  color: #9a4d13;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.level-chip {
  padding: 7px 10px;
  border-radius: 999px;
  background: #24495b;
  color: #ffdf99;
  font-size: 0.78rem;
  font-weight: 900;
}

.onboarding-card h2 {
  margin: 14px 0 8px;
  font-family: Georgia, serif;
  color: #1f4052;
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1.2;
}

.summary {
  margin: 0;
  color: #475569;
  line-height: 1.65;
}

.interaction-list {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.interaction-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: start;
  min-height: 112px;
  padding: 14px;
  border-radius: 16px;
  background: #f8f1df;
  border: 1px solid rgba(198, 144, 58, 0.26);
}

.interaction-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #24495b;
  color: #ffdf99;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
}

.interaction-item strong {
  display: block;
  color: #23364a;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.interaction-item p {
  margin: 0;
  color: #536273;
  line-height: 1.55;
  font-size: 0.9rem;
}

.onboarding-note {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(14, 116, 144, 0.1);
  border: 1px solid rgba(14, 116, 144, 0.18);
  color: #285164;
  line-height: 1.5;
  font-size: 0.9rem;
}

.onboarding-note i {
  margin-top: 2px;
}

.onboarding-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.start-btn {
  border: none;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 5px 0 rgba(146, 64, 14, 0.65);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 rgba(146, 64, 14, 0.6);
}

@media (max-width: 640px) {
  .onboarding-shell {
    padding: 16px;
  }

  .onboarding-card {
    padding: 20px;
    border-radius: 18px;
  }

  .interaction-list {
    grid-template-columns: 1fr;
  }

  .onboarding-actions,
  .start-btn {
    width: 100%;
  }

  .start-btn {
    justify-content: center;
  }
}
</style>
