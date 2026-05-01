<template>
  <div class="language-toggle" :aria-label="t('language.switchLabel')" role="group">
    <!-- 桌面端保留原有并排按钮（移动端隐藏） -->
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

    <!-- 移动端圆形切换按钮（桌面端隐藏） -->
    <button
      type="button"
      class="lang-circle-btn"
      @click="toggleLanguage"
      :aria-label="t('language.switchLabel')"
    >
      {{ currentLanguage === 'zh' ? '中' : 'EN' }}
    </button>
  </div>
</template>

<script setup>
import { useAppI18n } from '@/composables/useAppI18n'

const { currentLanguage, setLanguage, toggleLanguage, t } = useAppI18n()
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

/* 移动端圆形按钮默认隐藏 */
.lang-circle-btn {
  display: none;
}

/* 移动端适配（≤768px） */
@media (max-width: 768px) {
  /* 原有并排按钮隐藏 */
  .lang-btn {
    display: none;
  }

  /* 圆形切换按钮显示 */
  .lang-circle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #f8d48d;          /* 与桌面端 active 态一致 */
    color: #2c5a6e;
    font-size: 0.84rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.18s ease;
  }

  .lang-circle-btn:hover {
    transform: scale(1.05);
  }

  /* 调整容器在移动端位置（保持原有设计） */
  .language-toggle {
  left: 12px;      /* 原 right:12px 改为 left:12px */
  right: auto;
  top: 12px;
  padding: 4px;
}
}
</style>