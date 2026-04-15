<template>
  <section class="status-card">
    <div class="status-top">
      <div class="avatar-wrap" :style="avatarStyle">
        <div class="avatar-glow"></div>
        <div class="avatar">
          <div class="hair"></div>
          <div class="face"></div>
          <div class="robe"></div>
        </div>
      </div>

      <div class="identity-copy">
        <p class="eyebrow">{{ t('components.travelerStatus.title') }}</p>
        <h2>{{ displayName }}</h2>
        <p class="stage-title">{{ stageTitle }}</p>
        <div class="badge-row">
          <span class="badge">{{ stageBadge }}</span>
          <span v-if="applicationProfile.preferredRoute" class="badge accent">
            {{ preferredRouteBadge }}
          </span>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <article class="detail-item">
        <p class="item-label">{{ t('components.travelerStatus.currentProfile') }}</p>
        <p>{{ travelerProfile?.archetype || t('common.unassigned') }}</p>
      </article>
      <article class="detail-item">
        <p class="item-label">{{ t('components.travelerStatus.familiarTool') }}</p>
        <p>{{ travelerProfile?.familiar || t('common.unassigned') }}</p>
      </article>
      <article class="detail-item">
        <p class="item-label">{{ t('components.travelerStatus.routePreference') }}</p>
        <p>{{ routeSummary }}</p>
      </article>
      <article class="detail-item">
        <p class="item-label">{{ t('components.travelerStatus.latestTakeaway') }}</p>
        <p>{{ applicationProfile.latestTakeaway || t('components.travelerStatus.latestTakeawayFallback') }}</p>
      </article>
    </div>

    <div class="progress-stack">
      <div v-for="item in progress" :key="item.year" class="progress-item">
        <div class="progress-head">
          <strong>{{ item.label }}</strong>
          <span>{{ item.cleared }} / {{ item.total }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${Math.round(item.ratio * 100)}%` }"></div>
        </div>
      </div>
    </div>

    <p class="footnote">{{ t('components.travelerStatus.footnote') }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const props = defineProps({
  travelerProfile: {
    type: Object,
    default: null,
  },
  applicationProfile: {
    type: Object,
    default: () => ({}),
  },
  stage: {
    type: Object,
    required: true,
  },
  progress: {
    type: Array,
    default: () => [],
  },
})

const { currentLanguage, localize, t } = useAppI18n()

const displayName = computed(() => props.travelerProfile?.name || t('common.unnamedTraveler'))

const stageTitle = computed(() => {
  const localized = localize(props.stage?.title)
  if (localized) return localized
  if (currentLanguage.value === 'zh') return props.stage?.titleZh || props.stage?.title || ''
  return props.stage?.title || props.stage?.titleZh || ''
})

const stageBadge = computed(() => {
  const localized = localize(props.stage?.badge)
  if (localized) return localized
  if (currentLanguage.value === 'zh') return props.stage?.badgeZh || props.stage?.badge || ''
  return props.stage?.badge || props.stage?.badgeZh || ''
})

const preferredRouteBadge = computed(() => {
  const route = props.applicationProfile.preferredRoute
  if (!route) return ''
  if (currentLanguage.value === 'zh') return route.labelZh || route.label || ''
  return route.label || route.labelZh || ''
})

const routeSummary = computed(() => {
  if (props.applicationProfile.preferredRoute) {
    const route = props.applicationProfile.preferredRoute
    return currentLanguage.value === 'zh'
      ? route.labelZh || route.label || ''
      : route.label || route.labelZh || ''
  }

  return t('components.travelerStatus.routeUndecided')
})

const avatarStyle = computed(() => ({
  '--hair': props.travelerProfile?.avatar?.hairColor || '#3a2a25',
  '--outfit': props.travelerProfile?.avatar?.outfitColor || '#ffd46d',
}))
</script>

<style scoped>
.status-card {
  border-radius: 28px;
  padding: 22px;
  background: linear-gradient(145deg, rgba(12, 20, 38, 0.94), rgba(23, 31, 49, 0.92));
  border: 1px solid rgba(243, 207, 154, 0.2);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.28);
  color: #eff6ff;
}

.status-top {
  display: flex;
  gap: 18px;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  width: 118px;
  height: 118px;
  border-radius: 24px;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.12), rgba(15, 23, 42, 0.85));
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.avatar-glow {
  position: absolute;
  inset: 12px;
  border-radius: 18px;
  background: radial-gradient(circle, rgba(255, 214, 102, 0.18), transparent 72%);
}

.avatar {
  position: relative;
  width: 72px;
  height: 88px;
}

.hair,
.face,
.robe {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border: 3px solid #273640;
}

.hair {
  top: 6px;
  width: 52px;
  height: 24px;
  background: var(--hair);
  border-bottom: none;
  border-radius: 20px 20px 10px 10px;
  z-index: 3;
}

.face {
  top: 12px;
  width: 46px;
  height: 42px;
  background: #ffe8c7;
  border-radius: 50% 50% 44% 44%;
  z-index: 2;
}

.robe {
  bottom: 8px;
  width: 44px;
  height: 36px;
  background: var(--outfit);
  border-radius: 16px 16px 10px 10px;
}

.eyebrow,
.item-label {
  margin: 0 0 6px;
  color: #f8d48d;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.identity-copy h2 {
  margin: 0;
  font-size: 1.35rem;
  color: #fff7ed;
}

.stage-title {
  margin: 8px 0 0;
  color: #dbeafe;
  font-weight: 700;
}

.badge-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.8rem;
  font-weight: 800;
}

.badge.accent {
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.22);
}

.detail-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-item {
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-item p:last-child {
  margin: 0;
  line-height: 1.55;
  color: #dbe7ff;
}

.progress-stack {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 0.92rem;
  color: #e2e8f0;
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f59e0b, #fde68a);
}

.footnote {
  margin: 16px 0 0;
  color: #cbd5e1;
  font-size: 0.88rem;
}

@media (max-width: 720px) {
  .status-top,
  .detail-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .status-top {
    justify-items: start;
  }
}
</style>
