<template>
  <div class="dashboard-overlay" @click.self="$emit('close')">
    <aside class="dashboard-drawer">
      <button class="drawer-close" type="button" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <div class="drawer-header">
        <p class="drawer-eyebrow">{{ t('components.dashboard.eyebrow') }}</p>
        <h2>{{ t('components.dashboard.title') }}</h2>
        <p class="drawer-copy">{{ t('components.dashboard.copy') }}</p>
      </div>

      <div class="overview-grid">
        <TravelerStatusCard
          :traveler-profile="travelerProfile"
          :application-profile="applicationProfile"
          :stage="stage"
          :progress="progress"
        />

        <section class="journey-panel">
          <p class="journey-eyebrow">{{ t('components.dashboard.learningDashboard') }}</p>
          <h2>{{ activeYearTitle }}</h2>
          <p class="journey-copy">{{ activeYearSubtitle }}</p>

          <div class="journey-progress-grid">
            <article v-for="item in progress" :key="item.year" class="journey-progress-card" :class="{ active: item.year === currentYear }">
              <div class="journey-progress-head">
                <strong>{{ item.label }}</strong>
                <span>{{ item.cleared }} / {{ item.total }}</span>
              </div>
              <div class="journey-progress-track">
                <div class="journey-progress-fill" :style="{ width: `${Math.round(item.ratio * 100)}%` }"></div>
              </div>
            </article>
          </div>

          <div class="journey-helper-grid">
            <article class="journey-helper-card">
              <p class="helper-label">{{ t('components.dashboard.routePreference') }}</p>
              <p>{{ routePreferenceText }}</p>
            </article>
            <article class="journey-helper-card">
              <p class="helper-label">{{ t('components.dashboard.learningFlow') }}</p>
              <p>{{ t('components.dashboard.learningFlowText') }}</p>
            </article>
            <article class="journey-helper-card">
              <p class="helper-label">{{ t('components.dashboard.guidance') }}</p>
              <p>{{ currentGuidance }}</p>
            </article>
          </div>
        </section>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import TravelerStatusCard from '@/components/TravelerStatusCard.vue'

defineEmits(['close'])
const { localize, t } = useAppI18n()

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
  activeYearMeta: {
    type: Object,
    required: true,
  },
  routePreferenceText: {
    type: String,
    default: '',
  },
  currentGuidance: {
    type: String,
    default: '',
  },
  currentYear: {
    type: String,
    required: true,
  },
})

const activeYearTitle = computed(() => (
  localize(props.activeYearMeta?.shortLabel) || props.activeYearMeta?.shortLabel || ''
))

const activeYearSubtitle = computed(() => (
  localize(props.activeYearMeta?.subtitle) || props.activeYearMeta?.subtitle || ''
))
</script>

<style scoped>
.dashboard-overlay {
  position: fixed;
  inset: 0;
  z-index: 620;
  background: rgba(6, 10, 18, 0.68);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: flex-end;
}

.dashboard-drawer {
  position: relative;
  width: min(960px, 94vw);
  height: 100vh;
  overflow-y: auto;
  padding: 28px 24px 32px;
  background: linear-gradient(180deg, rgba(7, 12, 22, 0.98), rgba(13, 20, 34, 0.98));
  border-left: 1px solid rgba(243, 207, 154, 0.16);
  box-shadow: -22px 0 42px rgba(0, 0, 0, 0.28);
  animation: drawer-in 0.22s ease-out;
}

.drawer-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #fff7ed;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.18s ease, transform 0.18s ease;
}

.drawer-close:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.05);
}

.drawer-header {
  margin-bottom: 18px;
  padding-right: 56px;
}

.drawer-eyebrow,
.journey-eyebrow,
.helper-label {
  margin: 0 0 8px;
  color: #f8d48d;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.drawer-header h2,
.journey-panel h2 {
  margin: 0;
  color: #fff7ed;
  font-family: Georgia, serif;
}

.drawer-header h2 {
  font-size: 1.7rem;
}

.drawer-copy,
.journey-copy {
  margin: 12px 0 0;
  color: #d6e2ff;
  line-height: 1.65;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 18px;
}

.journey-panel {
  border-radius: 28px;
  padding: 24px;
  background: linear-gradient(145deg, rgba(17, 24, 39, 0.92), rgba(11, 18, 32, 0.92));
  border: 1px solid rgba(243, 207, 154, 0.18);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.26);
  color: #eff6ff;
}

.journey-progress-grid,
.journey-helper-grid {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.journey-progress-card,
.journey-helper-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.journey-progress-card.active {
  border-color: rgba(248, 214, 162, 0.34);
  box-shadow: 0 0 0 1px rgba(248, 214, 162, 0.18);
}

.journey-progress-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #eef2ff;
}

.journey-progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.journey-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f59e0b, #fde68a);
}

.journey-helper-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.journey-helper-card p:last-child {
  margin: 0;
  color: #dbe7ff;
  line-height: 1.6;
}

@keyframes drawer-in {
  from {
    opacity: 0;
    transform: translateX(18px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 960px) {
  .overview-grid,
  .journey-helper-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-drawer {
    width: 100vw;
    padding: 24px 16px 28px;
  }
}
</style>
