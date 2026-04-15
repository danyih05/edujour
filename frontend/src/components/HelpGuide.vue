<template>
  <div class="help-overlay" @click.self="$emit('close')">
    <div class="help-modal">
      <button class="help-close" @click="$emit('close')">✕</button>
      <h2><i class="fas fa-book-open"></i> {{ t('help.title') }}</h2>
      <div class="help-content">
        <section>
          <h3>{{ t('help.mapTitle') }}</h3>
          <p>{{ t('help.mapDesc') }}</p>
        </section>
        <section>
          <h3>{{ t('help.nodesTitle') }}</h3>
          <ul>
            <li><span class="badge unlocked"></span> {{ t('help.unlocked') }}</li>
            <li><span class="badge locked"></span> {{ t('help.locked') }}</li>
            <li><span class="badge completed"></span> {{ t('help.completed') }}</li>
          </ul>
          <p>{{ t('help.nodesHint') }}</p>
        </section>
        <section>
          <h3>{{ t('help.shopTitle') }}</h3>
          <p>{{ t('help.shopDesc') }}</p>
        </section>
        <section>
          <h3>{{ t('help.sanctuaryTitle') }}</h3>
          <p>{{ t('help.sanctuaryDesc') }}</p>
        </section>
        <section>
          <h3>{{ t('help.resetTitle') }}</h3>
          <p>{{ t('help.resetDesc') }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppI18n } from '@/composables/useAppI18n'
defineEmits(['close'])
const { t } = useAppI18n()
</script>

<style scoped>
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.help-modal {
  background: #fffcf3;
  border: 3px solid #e2bc7c;
  border-radius: 28px;
  width: min(600px, 90%);
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
  color: #2d5a6e;
}
.help-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7c5a3a;
}
.help-modal h2 {
  margin-top: 0;
  font-family: Georgia, serif;
  color: #7c2d12;
}
.help-content section {
  margin-bottom: 20px;
}
.help-content h3 {
  font-size: 1.1rem;
  border-left: 4px solid #e2bc7c;
  padding-left: 10px;
  margin: 12px 0 8px;
}
.badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.badge.unlocked { background: #ffd7a1; border: 2px solid #b97f10; }
.badge.locked { background: #6b7280; border: 2px solid #4b5563; opacity: 0.6; }
.badge.completed { background: #fbbf24; border: 2px solid #b45309; }
</style>