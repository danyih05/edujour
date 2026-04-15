<template>
  <section class="guide-card">
    <div class="guide-header">
      <div>
        <p class="eyebrow">{{ eyebrowText }}</p>
        <h2>{{ titleText }}</h2>
        <p v-if="summaryText" class="summary">{{ summaryText }}</p>
      </div>
      <div v-if="contextTags.length" class="context-tags">
        <span v-for="tag in contextTags" :key="tag" class="context-tag">{{ tag }}</span>
      </div>
    </div>

    <div class="guide-grid">
      <article v-if="guide.learnBody || guide.learnBodyZh" class="guide-block">
        <p class="block-label">{{ learnLabel }}</p>
        <p>{{ learningText }}</p>
      </article>

      <article v-if="guide.realTaskBody || guide.realTaskBodyZh" class="guide-block">
        <p class="block-label">{{ realTaskLabel }}</p>
        <p>{{ taskText }}</p>
      </article>
    </div>

    <div v-if="guide.mechanics?.length" class="guide-mechanics">
      <p class="block-label">{{ t('components.guideCard.mechanics') }}</p>
      <div class="mechanics-grid">
        <article v-for="item in guide.mechanics" :key="item.term" class="mechanic-item">
          <strong>{{ localize(item.term) || item.term }}</strong>
          <p>{{ localize(item.meaning) || item.meaning }}</p>
        </article>
      </div>
    </div>

    <div v-if="guide.help" class="guide-help">
      <i class="fas fa-circle-info"></i>
      <span>{{ guide.help }}</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const props = defineProps({
  guide: {
    type: Object,
    default: () => ({}),
  },
  contextTags: {
    type: Array,
    default: () => [],
  },
})

const { currentLanguage, localize, t } = useAppI18n()

function pickGuideValue(key) {
  const direct = props.guide[key]
  const zhValue = props.guide[`${key}Zh`]

  if (direct && typeof direct === 'object') {
    return localize(direct)
  }

  if (zhValue && typeof zhValue === 'object') {
    return localize(zhValue)
  }

  if (currentLanguage.value === 'zh') {
    return zhValue || direct || ''
  }

  return direct || zhValue || ''
}

const eyebrowText = computed(() => pickGuideValue('eyebrow') || t('components.guideCard.defaultEyebrow'))
const titleText = computed(() => pickGuideValue('summary'))
const summaryText = computed(() => pickGuideValue('summaryExtra'))
const learnLabel = computed(() => pickGuideValue('learn') || t('components.guideCard.learn'))
const learningText = computed(() => pickGuideValue('learnBody'))
const realTaskLabel = computed(() => pickGuideValue('realTask') || t('components.guideCard.realTask'))
const taskText = computed(() => pickGuideValue('realTaskBody'))
</script>

<style scoped>
.guide-card {
  border-radius: 22px;
  padding: 20px 22px;
  background: linear-gradient(135deg, rgba(13, 24, 42, 0.92), rgba(31, 41, 55, 0.9));
  border: 1px solid rgba(244, 196, 123, 0.32);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
  color: #eff6ff;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.eyebrow,
.block-label {
  margin: 0 0 8px;
  color: #f9d976;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.guide-header h2 {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
  color: #fff7e3;
}

.summary {
  margin: 10px 0 0;
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 0.95rem;
}

.context-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.context-tag {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  font-size: 0.8rem;
  font-weight: 800;
}

.guide-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.guide-block,
.mechanic-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.guide-block p:last-child,
.mechanic-item p {
  margin: 0;
  color: #dbe7ff;
  line-height: 1.6;
}

.guide-mechanics {
  margin-top: 16px;
}

.mechanics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.mechanic-item strong {
  display: block;
  margin-bottom: 8px;
  color: #fde68a;
}

.guide-help {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.22);
  color: #d9f5ff;
  line-height: 1.5;
  font-size: 0.92rem;
}

.guide-help i {
  margin-top: 2px;
  color: #7dd3fc;
}

@media (max-width: 760px) {
  .guide-header,
  .guide-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .guide-header {
    gap: 12px;
  }

  .context-tags {
    justify-content: flex-start;
  }
}
</style>
