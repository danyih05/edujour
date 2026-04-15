<template>
  <div class="game-shell">
    <div class="game-modal-content" :class="{ 'chrome-free-modal': isChromeFreeLevel }">
      <button v-if="!isChromeFreeLevel" class="modal-close-btn" type="button" @click="goBack">×</button>

      <div v-if="!isChromeFreeLevel" class="modal-header">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i> {{ t('components.gameContainer.backToMap') }}
        </button>
        <span>{{ levelTitle }}</span>
        <span class="year-chip">{{ yearChip }}</span>
      </div>

      <div class="game-stage" :class="{ 'chrome-free-stage': isChromeFreeLevel }">
        <component :is="currentGame" :level-id="levelId" @complete="handleChildComplete" @close="goBack" />
      </div>

      <div class="game-actions" v-if="!isMissingLevel && !isChromeFreeLevel">
        <button class="action-btn secondary" @click="skipLevel">
          {{ t('components.gameContainer.skipUnlockNext') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, defineComponent, h, watchEffect } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { useRoute, useRouter } from 'vue-router'
import { getLevelDefinition } from '@/config/levels'
import { useGameStore } from '@/stores/game'

const route = useRoute()
const router = useRouter()
const store = useGameStore()
const { t } = useAppI18n()
const chromeFreeFiles = new Set(['year3_8.vue'])

store.hydrate()

const levelId = computed(() => Number.parseInt(route.params.id, 10))
const gameModules = import.meta.glob('./games/*.vue')

watchEffect(() => {
  const routeYear = route.query.year
  if ((routeYear === 'y2' || routeYear === 'y3') && store.year !== routeYear) {
    store.switchYear(routeYear)
  }
})

const levelDefinition = computed(() => getLevelDefinition(store.year, levelId.value))

const MissingLevelView = defineComponent({
  setup() {
    return () => h('div', {
      style: 'min-height: 360px; display: grid; place-items: center; padding: 24px; background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%); border-radius: 16px;',
    }, [
      h('div', {
        style: 'max-width: 520px; text-align: center; background: #fffcf3; border: 3px solid #e2bc7c; border-radius: 24px; padding: 32px; box-shadow: 0 25px 40px rgba(0, 0, 0, 0.12);',
      }, [
        h('h2', {
          style: 'margin-bottom: 12px; color: #2d5a6e;',
        }, t('components.gameContainer.missingTitle')),
        h('p', {
          style: 'color: #4b5563; line-height: 1.6;',
        }, t('components.gameContainer.missingDescription')),
      ]),
    ])
  },
})

const isMissingLevel = computed(() => {
  if (!levelDefinition.value) return true
  return !gameModules[`./games/${levelDefinition.value.file}`]
})

const currentGame = computed(() => {
  if (isMissingLevel.value) return MissingLevelView

  return defineAsyncComponent({
    loader: gameModules[`./games/${levelDefinition.value.file}`],
    errorComponent: MissingLevelView,
  })
})

const levelTitle = computed(() => {
  if (!levelDefinition.value) return t('components.gameContainer.loadingLevel')
  return t(`${levelDefinition.value.i18nKey}.title`)
})
const isChromeFreeLevel = computed(() => Boolean(levelDefinition.value && chromeFreeFiles.has(levelDefinition.value.file)))

const yearChip = computed(() => (
  t(`components.gameContainer.yearChip.${store.year}`)
))

function goBack() {
  router.push({ name: 'map' })
}

async function handleChildComplete(payload = {}) {
  const profile = payload.profile || payload
  const rewardCoins = Number(payload.rewardCoins) || 0
  try {
    await store.completeNode(store.year, levelId.value, { rewardCoins, profile })
    goBack()
  } catch (error) {
    console.error(error)
  }
}

async function skipLevel() {
  try {
    await store.skipLevel(levelId.value)
    goBack()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.game-shell {
  min-height: 100vh;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background:
    radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.16) 0%, transparent 18%),
    radial-gradient(circle at 82% 16%, rgba(244, 114, 182, 0.14) 0%, transparent 18%),
    radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 20%),
    linear-gradient(160deg, #070a14 0%, #110d1e 42%, #070b12 100%);
}

.game-modal-content {
  position: relative;
  background: #fffcf3;
  width: 95%;
  max-width: 1200px;
  min-height: 88vh;
  border-radius: 24px;
  padding: 25px;
  border: 3px solid #e2bc7c;
  box-shadow: 0 25px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}
.chrome-free-modal {
  background: transparent;
  width: 100%;
  max-width: none;
  min-height: 100%;
  padding: 0;
  border: none;
  box-shadow: none;
}

.modal-header {
  padding-right: 56px;
  font-size: 1.5rem;
  color: #2d5a6e;
  border-bottom: 2px dashed #e7bc7a;
  padding-bottom: 12px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-weight: 900;
  font-family: Georgia, serif;
}

.back-btn,
.modal-close-btn,
.action-btn {
  border: none;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s;
}

.back-btn {
  padding: 10px 18px;
  background: rgba(44, 90, 110, 0.1);
  color: #2d5a6e;
  border: 2px solid rgba(227, 178, 73, 0.35);
}

.back-btn:hover {
  transform: translateY(-2px);
}

.modal-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(44, 90, 110, 0.1);
  color: #2d5a6e;
  border: 2px solid rgba(227, 178, 73, 0.35);
  font-size: 1.35rem;
  line-height: 1;
}

.modal-close-btn:hover {
  transform: translateY(-2px);
}

.year-chip {
  font-size: 0.95rem;
  padding: 8px 14px;
  border-radius: 999px;
  background: #2c5a6e;
  color: #ffdf99;
}

.game-stage {
  flex: 1;
  overflow: auto;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.04);
}
.chrome-free-stage {
  overflow: visible;
  border-radius: 0;
  background: transparent;
  min-height: 100%;
}

.game-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 18px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 4px 0 rgba(146, 64, 14, 0.7);
}

.action-btn.secondary {
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  border: 2px solid rgba(148, 163, 184, 0.24);
}

.action-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 880px) {
  .modal-header {
    flex-direction: column;
    align-items: stretch;
  }

  .game-actions {
    justify-content: stretch;
  }

  .action-btn,
  .back-btn {
    width: 100%;
  }

  .modal-close-btn {
    top: 16px;
    right: 16px;
  }
}
</style>
