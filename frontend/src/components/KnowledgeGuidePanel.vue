<template>
  <div class="knowledge-guide-panel" :class="{ open: isOpen }">
    <button class="guide-toggle" type="button" @click="toggleOpen">
      <span>{{ title }}</span>
      <i class="fas" :class="isOpen ? 'fa-caret-up' : 'fa-caret-down'" aria-hidden="true"></i>
    </button>

    <transition name="guide-fade">
      <div v-if="isOpen" class="guide-content">
        <div class="guide-header">
          <h3>{{ title }}</h3>
          <p class="guide-copy" v-html="body"></p>
        </div>
        <ul v-if="items?.length" class="guide-list">
          <li v-for="item in items" :key="typeof item === 'string' ? item : item.title || item.label">
            <template v-if="typeof item === 'string'">
              <span>{{ item }}</span>
            </template>
            <template v-else>
              <strong>{{ item.title || item.label }}</strong>
              <p v-if="item.text" v-html="item.text"></p>
            </template>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Knowledge Guide' },
  body: { type: String, default: '' },
  items: { type: Array, default: () => [] },
})

const isOpen = ref(false)
function toggleOpen() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.knowledge-guide-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  z-index: 20;
  font-family: Inter, system-ui, sans-serif;
}

.guide-toggle {
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.94);
  color: #1f2937;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12);
}

.guide-content {
  margin-top: 12px;
  padding: 16px;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.92);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  max-height: 70vh;       
  overflow-y: auto;
}

.guide-header h3 {
  margin: 0 0 10px;
  color: #f8fafc;
  font-size: 1rem;
  line-height: 1.3;
}

.guide-copy {
  margin: 0;
  color: #d1d5db;
  font-size: 0.9rem;
  line-height: 1.55;
}

.guide-list {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.guide-list li {
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.guide-list strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 6px;
}

.guide-list p {
  margin: 0;
  font-size: 0.84rem;
  color: #cbd5e1;
  line-height: 1.5;
}

.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 860px) {
  .knowledge-guide-panel {
    right: 12px;
    top: 12px;
    width: calc(100% - 24px);
  }
}
</style>
