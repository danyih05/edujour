<template>
  <div v-if="modelValue" class="overlay" @click.self="$emit('update:modelValue', false)">
    <div class="card" :class="toneClass">
      <div class="icon">{{ icon }}</div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <div v-if="$slots.extra" class="extra">
        <slot name="extra" />
      </div>
      <div class="actions">
        <button v-if="secondaryText" class="secondary" @click="$emit('secondary')">{{ secondaryText }}</button>
        <button class="primary" @click="$emit('primary')">{{ primaryText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '✨',
  },
  tone: {
    type: String,
    default: 'success',
  },
  primaryText: {
    type: String,
    default: '',
  },
  secondaryText: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue', 'primary', 'secondary'])

const { t } = useAppI18n()
const toneClass = computed(() => `tone-${props.tone}`)
const primaryText = computed(() => props.primaryText || t('common.actions.continue'))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  padding: 24px;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
}

.card {
  width: min(560px, 100%);
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  box-shadow: 0 30px 50px rgba(15, 23, 42, 0.28);
}

.tone-success {
  background: linear-gradient(160deg, #113327 0%, #101827 100%);
}

.tone-warning {
  background: linear-gradient(160deg, #3a250f 0%, #101827 100%);
}

.tone-error {
  background: linear-gradient(160deg, #3a1419 0%, #101827 100%);
}

.icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.card h2 {
  margin: 0 0 10px;
  font-size: 1.6rem;
  font-family: Georgia, serif;
}

.card p {
  margin: 0;
  line-height: 1.7;
}

.extra {
  margin-top: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.actions button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
