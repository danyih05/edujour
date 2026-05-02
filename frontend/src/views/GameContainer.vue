<template>
  <div class="game-shell">
    <div class="game-modal-content" :class="{ 'chrome-free-modal': isChromeFreeLevel }">
      <button v-if="!isChromeFreeLevel" class="modal-close-btn" type="button" @click="goBack">×</button>

      <div v-if="!isChromeFreeLevel" class="modal-header">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i> {{ t('components.gameContainer.backToMap') }}
        </button>
        <span class="level-heading">{{ levelTitle }}</span>
        <div class="header-actions">
          <button
            v-if="canShowOnboarding && hasAcknowledgedOnboarding"
            class="guide-reopen-btn"
            type="button"
            @click="reopenOnboarding"
          >
            <i class="fas fa-circle-question" aria-hidden="true"></i>
            {{ onboardingButtonText }}
          </button>
          <span class="year-chip">{{ yearChip }}</span>
        </div>
      </div>

      <div class="game-stage" :class="{ 'chrome-free-stage': isChromeFreeLevel }">
        <PrePlayOnboarding
          v-if="shouldGateOnboarding"
          :guide="currentOnboarding"
          :level-title="levelTitle"
          @start="acknowledgeOnboarding"
        />
        <GameCompletedView
          v-else-if="savedGameResult"
          :result="savedGameResult"
          :title="levelTitle"
          @retry="retryLevel"
          @back="goBack"
        />
        <component v-else :is="currentGame" :level-id="levelId" @complete="handleChildComplete" @close="goBack" />
        <PrePlayOnboarding
          v-if="shouldOverlayOnboarding"
          class="floating"
          :guide="currentOnboarding"
          :level-title="levelTitle"
          @start="acknowledgeOnboarding"
        />
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
import { computed, defineAsyncComponent, defineComponent, h, ref, watch, watchEffect } from 'vue'
import GameCompletedView from '@/components/GameCompletedView.vue'
import PrePlayOnboarding from '@/components/PrePlayOnboarding.vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { useRoute, useRouter } from 'vue-router'
import { getLevelDefinition } from '@/config/levels'
import { useGameStore } from '@/stores/game'

const route = useRoute()
const router = useRouter()
const store = useGameStore()
const { currentLanguage, t } = useAppI18n()
const chromeFreeFiles = new Set(['year3_8.vue'])
const hasAcknowledgedOnboarding = ref(false)
const showOnboardingOverlay = ref(false)

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
const currentOnboarding = computed(() => levelDefinition.value?.onboarding || null)
const gameId = computed(() => `${store.year === 'y3' ? 'year3' : 'year2'}_${levelId.value}`)
const savedGameResult = computed(() => {
  const result = store.getGameResult(gameId.value)
  return result?.completed ? result : null
})

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
const canShowOnboarding = computed(() => Boolean(currentOnboarding.value && !savedGameResult.value && !isMissingLevel.value))
const shouldGateOnboarding = computed(() => canShowOnboarding.value && !hasAcknowledgedOnboarding.value)
const shouldOverlayOnboarding = computed(() => (
  canShowOnboarding.value && hasAcknowledgedOnboarding.value && showOnboardingOverlay.value
))
const onboardingButtonText = computed(() => (
  currentLanguage.value === 'en' ? 'Controls' : '操作指引'
))

const yearChip = computed(() => (
  t(`components.gameContainer.yearChip.${store.year}`)
))

watch([() => store.year, levelId], () => {
  hasAcknowledgedOnboarding.value = false
  showOnboardingOverlay.value = false
})

function goBack() {
  router.push({ name: 'map' })
}

function buildResultPayload(payload = {}) {
  const fallbackResultData = Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => (
      !['profile', 'resultType', 'resultData', 'completed', 'passed', 'language', 'year', 'nodeId'].includes(key)
      && value !== undefined
    )),
  )
  return {
    completed: payload.completed ?? true,
    passed: payload.passed ?? true,
    resultType: payload.resultType || (payload.resultData ? 'result' : 'passed'),
    resultData: payload.resultData || fallbackResultData,
    language: payload.language || currentLanguage.value,
  }
}

function retryLevel() {
  store.clearGameResult(gameId.value)
  hasAcknowledgedOnboarding.value = false
  showOnboardingOverlay.value = false
}

function acknowledgeOnboarding() {
  hasAcknowledgedOnboarding.value = true
  showOnboardingOverlay.value = false
}

function reopenOnboarding() {
  if (canShowOnboarding.value) {
    showOnboardingOverlay.value = true
  }
}

async function handleChildComplete(payload = {}) {
  const profile = Object.prototype.hasOwnProperty.call(payload, 'profile') ? payload.profile : undefined
  const rewardCoins = Number(payload.rewardCoins) || 0
  store.saveGameResult(gameId.value, buildResultPayload(payload))
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

.level-heading {
  flex: 1;
  min-width: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.back-btn,
.modal-close-btn,
.action-btn,
.guide-reopen-btn {
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

.guide-reopen-btn {
  min-height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(44, 90, 110, 0.1);
  color: #2d5a6e;
  border: 2px solid rgba(227, 178, 73, 0.35);
  font-size: 0.86rem;
}

.guide-reopen-btn:hover {
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
  position: relative;
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

  .header-actions {
    justify-content: stretch;
  }

  .game-actions {
    justify-content: stretch;
  }

  .action-btn,
  .back-btn,
  .guide-reopen-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-close-btn {
    top: 16px;
    right: 16px;
  }
}

@media (max-width: 768px) {
  .game-shell {
    padding: 0;
    min-height: 100dvh;
  }
  .game-modal-content {
    width: 100%;
    min-height: 100dvh;
    border-radius: 0;
    padding: 10px;
    border-width: 0;
  }
  .modal-header {
    margin-bottom: 8px;
    padding-bottom: 8px;
    font-size: 1rem;
  }
  .game-stage {
    min-height: 45dvh;
    max-height: 62dvh;
    overflow: auto;
  }
  .game-actions {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    max-height: 28dvh;
    overflow-y: auto;
  }
  .action-btn,
  .back-btn,
  .guide-reopen-btn,
  .modal-close-btn {
    min-height: 48px;
  }
  .header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
}
</style>
