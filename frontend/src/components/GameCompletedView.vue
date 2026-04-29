<template>
  <section class="completed-view">
    <div class="completed-card">
      <div class="status-mark">
        <i class="fas fa-check"></i>
      </div>
      <p class="eyebrow">{{ t('gameResult.completed') }}</p>
      <h2>{{ title || t('gameResult.passed') }}</h2>
      <p class="lead">{{ t('gameResult.alreadyCompleted') }}</p>

      <div class="meta-row">
        <span>{{ t('gameResult.completedAt') }}</span>
        <strong>{{ formattedTime }}</strong>
      </div>

      <div v-if="hasResultItems" class="result-panel">
        <div class="result-title">
          <i class="fas fa-scroll"></i>
          <span>{{ t('gameResult.previousResult') }}</span>
        </div>
        <dl class="result-grid">
          <template v-for="item in resultItems" :key="item.key">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </template>
        </dl>
      </div>

      <div v-else class="passed-panel">
        <i class="fas fa-medal"></i>
        <span>{{ t('gameResult.passed') }}</span>
      </div>

      <div class="actions">
        <button type="button" class="btn secondary" @click="$emit('back')">
          <i class="fas fa-map"></i>
          <span>{{ t('gameResult.backToMap') }}</span>
        </button>
        <button type="button" class="btn primary" @click="$emit('retry')">
          <i class="fas fa-rotate-left"></i>
          <span>{{ t('gameResult.tryAgain') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const props = defineProps({
  result: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
})

defineEmits(['retry', 'back'])

const { currentLanguage, t } = useAppI18n()

const formattedTime = computed(() => {
  if (!props.result?.completedAt) return '-'
  const date = new Date(props.result.completedAt)
  if (Number.isNaN(date.getTime())) return props.result.completedAt
  return new Intl.DateTimeFormat(currentLanguage.value === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
})

const labelMap = computed(() => ({
  score: t('gameResult.fields.score'),
  correct: t('gameResult.fields.correct'),
  total: t('gameResult.fields.total'),
  passed: t('gameResult.fields.passed'),
  winner: t('gameResult.fields.recommendation'),
  matchedCountry: t('gameResult.fields.matchedCountry'),
  recommendedCountry: t('gameResult.fields.matchedCountry'),
  selectedCountry: t('gameResult.fields.matchedCountry'),
  schools: t('gameResult.fields.schools'),
  selectedSchools: t('gameResult.fields.schools'),
  tierBuckets: t('gameResult.fields.schoolTiers'),
  clearedStages: t('gameResult.fields.clearedStages'),
  gems: t('gameResult.fields.artifacts'),
  level: t('gameResult.fields.level'),
  finalNode: t('gameResult.fields.finalNode'),
}))

function stringifyValue(value) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'boolean') return value ? t('gameResult.yes') : t('gameResult.no')
  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).filter(Boolean).join(' / ')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== '')
      .slice(0, 8)
      .map(([key, entryValue]) => `${labelMap.value[key] || key}: ${stringifyValue(entryValue)}`)
    return entries.join('; ')
  }
  return String(value)
}

const resultItems = computed(() => {
  const data = props.result?.resultData || {}
  return Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .slice(0, 10)
    .map(([key, value]) => ({
      key,
      label: labelMap.value[key] || key,
      value: stringifyValue(value),
    }))
    .filter((item) => item.value)
})

const hasResultItems = computed(() => resultItems.value.length > 0 && props.result?.resultType !== 'passed')
</script>

<style scoped>
.completed-view {
  min-height: min(680px, 82vh);
  display: grid;
  place-items: center;
  padding: 28px 16px;
  background:
    radial-gradient(circle at 18% 18%, rgba(99, 102, 241, 0.16), transparent 24%),
    radial-gradient(circle at 82% 18%, rgba(245, 158, 11, 0.14), transparent 22%),
    linear-gradient(160deg, #101827, #182338 52%, #0d1422);
  border-radius: 18px;
}

.completed-card {
  width: min(720px, 100%);
  padding: clamp(24px, 4vw, 42px);
  border: 3px solid #e2bc7c;
  border-radius: 24px;
  background: #fffcf3;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.28);
  text-align: center;
  color: #27364b;
}

.status-mark {
  width: 76px;
  height: 76px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 2.2rem;
  box-shadow: 0 14px 28px rgba(22, 163, 74, 0.28);
}

.eyebrow {
  margin: 0 0 8px;
  color: #b45309;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #1e3a5f;
  font-family: Georgia, serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}

.lead {
  margin: 12px auto 20px;
  max-width: 520px;
  color: #526174;
  line-height: 1.65;
  font-weight: 700;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  margin: 0 auto 18px;
  max-width: 520px;
  border-radius: 14px;
  background: #f3ead8;
  color: #5b6472;
  font-weight: 800;
}

.result-panel,
.passed-panel {
  max-width: 560px;
  margin: 0 auto 24px;
  border-radius: 18px;
  background: #ffffff;
  border: 2px solid #ead6ae;
  box-shadow: 0 12px 26px rgba(30, 58, 95, 0.08);
}

.result-panel {
  padding: 18px;
  text-align: left;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: #2d5a6e;
  font-weight: 900;
}

.result-grid {
  display: grid;
  grid-template-columns: minmax(120px, 0.42fr) 1fr;
  gap: 10px 14px;
  margin: 0;
}

dt {
  color: #8a5f18;
  font-weight: 900;
}

dd {
  margin: 0;
  color: #324052;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.passed-panel {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  color: #166534;
  font-weight: 900;
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  min-height: 46px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 12px 24px rgba(217, 119, 6, 0.22);
}

.btn.secondary {
  background: #e8eef7;
  color: #284461;
}

@media (max-width: 620px) {
  .completed-view {
    min-height: 70vh;
    padding: 16px 10px;
  }

  .meta-row,
  .result-grid {
    grid-template-columns: 1fr;
  }

  .meta-row {
    flex-direction: column;
    text-align: left;
  }

  .actions,
  .btn {
    width: 100%;
  }
}
</style>
