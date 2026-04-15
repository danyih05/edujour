<template>
  <div class="language-toggle" :aria-label="t('language.switchLabel')" role="group">
    <button
      type="button"
      class="lang-btn"
      :class="{ active: currentLanguage === 'zh' }"
      @click="setLanguage('zh')"
    >
      {{ t('language.zh') }}
    </button>
    <button
      type="button"
      class="lang-btn"
      :class="{ active: currentLanguage === 'en' }"
      @click="setLanguage('en')"
    >
      {{ t('language.en') }}
    </button>
  </div>
</template>

<script setup>
import { useAppI18n } from '@/composables/useAppI18n'

const { currentLanguage, setLanguage, t } = useAppI18n()
</script>

<style scoped>
.language-toggle {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 1200;
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(7, 12, 22, 0.9);
  border: 1px solid rgba(243, 207, 154, 0.24);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(8px);
}

.lang-btn {
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.84rem;
  font-weight: 900;
  cursor: pointer;
  color: #dbe7ff;
  background: transparent;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.lang-btn:hover {
  transform: translateY(-1px);
}

.lang-btn.active {
  color: #2c5a6e;
  background: #f8d48d;
}

@media (max-width: 760px) {
  .language-toggle {
    top: 12px;
    right: 12px;
  }

  .lang-btn {
    padding: 8px 12px;
    font-size: 0.78rem;
  }
}
</style>
