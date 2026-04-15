<template>
  <div class="level-shell">
    <div class="hero" :class="toneClass">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.status || statusText" class="status-card">
        <slot name="status">
          <strong>{{ statusLabel }}</strong>
          <span>{{ statusText }}</span>
        </slot>
      </div>
    </div>

    <LevelGuideCard v-if="guide" :guide="guide" :context-tags="tags" />

    <div class="body">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import LevelGuideCard from '@/components/LevelGuideCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  eyebrow: {
    type: String,
    default: '',
  },
  guide: {
    type: Object,
    default: null,
  },
  tags: {
    type: Array,
    default: () => [],
  },
  tone: {
    type: String,
    default: 'violet',
  },
  statusLabel: {
    type: String,
    default: '',
  },
  statusText: {
    type: String,
    default: '',
  },
})

const { localize, t } = useAppI18n()
const toneClass = computed(() => `tone-${props.tone}`)
const eyebrow = computed(() => localize(props.eyebrow) || props.eyebrow || t('components.levelScaffold.stageBrief'))
const title = computed(() => localize(props.title) || props.title)
const subtitle = computed(() => localize(props.subtitle) || props.subtitle)
const statusLabel = computed(() => localize(props.statusLabel) || props.statusLabel || t('components.levelScaffold.currentStatus'))
const statusText = computed(() => localize(props.statusText) || props.statusText)
</script>

<style scoped>
.level-shell {
  min-height: 100%;
  padding: 24px;
  display: grid;
  gap: 18px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 24px;
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.16);
}

.tone-violet {
  background:
    radial-gradient(circle at 18% 18%, rgba(216, 180, 254, 0.25) 0%, transparent 18%),
    linear-gradient(145deg, #281740 0%, #12152d 100%);
}

.tone-amber {
  background:
    radial-gradient(circle at 18% 18%, rgba(251, 191, 36, 0.18) 0%, transparent 18%),
    linear-gradient(145deg, #2c1c15 0%, #0f172a 100%);
}

.tone-emerald {
  background:
    radial-gradient(circle at 18% 18%, rgba(52, 211, 153, 0.18) 0%, transparent 18%),
    linear-gradient(145deg, #0d2b28 0%, #0f172a 100%);
}

.tone-sky {
  background:
    radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.2) 0%, transparent 18%),
    linear-gradient(145deg, #102a43 0%, #101827 100%);
}

.eyebrow {
  margin: 0 0 8px;
  color: #fcd34d;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.hero h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-family: Georgia, serif;
}

.subtitle {
  margin: 10px 0 0;
  max-width: 760px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.7;
}

.status-card {
  min-width: 200px;
  align-self: stretch;
  display: grid;
  align-content: center;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-card strong {
  color: #fde68a;
  font-size: 0.85rem;
}

.status-card span {
  line-height: 1.5;
}

.body {
  display: grid;
  gap: 18px;
}

@media (max-width: 900px) {
  .level-shell {
    padding: 16px;
  }

  .hero {
    flex-direction: column;
  }
}
</style>
