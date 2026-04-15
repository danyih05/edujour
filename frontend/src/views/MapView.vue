<template>
  <div class="map-page">
    <div class="help-btn-wrapper">
      <button 
        class="help-btn" 
        @click="showHelpModal = true"
        @mouseenter="showHelpTooltip($event)"
        @mouseleave="hideTooltip"
      >
        <i class="fas fa-question-circle"></i>
      </button>
    </div>

    <!-- 小屏幕汉堡菜单按钮 -->
    <button v-if="windowWidth < 1024" class="mobile-menu-toggle" @click="showMobileMenu = true">
      <i class="fas fa-bars"></i>
    </button>

    <!-- 侧开菜单抽屉 -->
    <div v-if="showMobileMenu" class="mobile-menu-overlay" @click="showMobileMenu = false"></div>
    <div class="mobile-menu-drawer" :class="{ open: showMobileMenu }">
      <button class="mobile-menu-close" @click="showMobileMenu = false">
        <i class="fas fa-times"></i>
      </button>
      <div class="mobile-menu-content">
        <div class="mobile-menu-section">
          <button class="mobile-menu-item" :class="store.year === 'y2' ? 'active' : ''" @click="switchYearAndClose('y2')">
            <i class="fas fa-map"></i> {{ t('nav.year2') }}
          </button>
          <button class="mobile-menu-item" :class="store.year === 'y3' ? 'active' : ''" @click="switchYearAndClose('y3')">
            <i class="fas fa-fire"></i> {{ t('nav.year3') }}
          </button>
        </div>
        <div class="mobile-menu-section">
          <button class="mobile-menu-item" @click="showMobileMenu = false; showPrizeShop = true">
            <i class="fas fa-gift"></i> {{ t('map.shop') }}
          </button>
          <button class="mobile-menu-item" @click="showMobileMenu = false; showHealingSandbox = true">
            <i class="fas fa-leaf"></i> {{ t('map.sanctuary') }}
          </button>
        </div>
        <div class="mobile-menu-section">
          <div class="mobile-menu-coins">
            <i class="fas fa-coins"></i>
            <span>{{ store.currentCoins }} {{ t('common.labels.coins') }}</span>
          </div>
        </div>
        <div class="mobile-menu-section">
          <button class="mobile-menu-item danger" @click="showMobileMenu = false; showResetConfirm = true">
            <i class="fas fa-rotate-left"></i> {{ t('nav.reset') }}
          </button>
          <button class="mobile-menu-item" @click="showMobileMenu = false; handleLogout()">
            <i class="fas fa-sign-out-alt"></i> {{ copy.map.logout }}
          </button>
        </div>
      </div>
    </div>

    <div class="app-shell">
      <div class="top-switcher" v-if="windowWidth >= 1024">
        <button class="switch-btn" :class="store.year === 'y2' ? 'primary' : 'secondary'" @click="switchYear('y2')"><i class="fas fa-map"></i> {{ t('nav.year2') }}</button>
        <button class="switch-btn" :class="store.year === 'y3' ? 'primary' : 'secondary'" @click="switchYear('y3')"><i class="fas fa-fire"></i> {{ t('nav.year3') }}</button>
        <button class="switch-btn danger" @click="showResetConfirm = true"><i class="fas fa-rotate-left"></i> {{ t('nav.reset') }}</button>
        <div class="session-pill">
          <AvatarBadge :avatar="store.travelerAvatar" size="sm" />
          <span><i class="fas fa-user-graduate"></i> {{ copy.map.studentPortal }} · {{ authStore.user?.displayName || authStore.user?.email }}</span>
        </div>
        <button class="switch-btn secondary" @click="handleLogout">{{ copy.map.logout }}</button>
      </div>
      <div v-if="store.loading" class="sync-banner">{{ copy.map.syncing }}</div>
      <div v-if="statusMessage" class="sync-banner error">{{ statusMessage }}</div>
      <div class="global-progress">
        <div class="progress-label">
          <span>{{ t('map.progressLabel') }}</span>
          <span>{{ completedCount }} / {{ totalNodes }}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </div>
      <section class="board y2" :class="{ active: store.year === 'y2' }">
        <div class="header">
          <h1><i class="fas fa-route"></i> {{ t('map.year2Title') }}</h1>
          <div class="header-right" v-if="windowWidth >= 1024">
            <button class="btn-action" @click="showPrizeShop = true"><i class="fas fa-gift"></i> {{ t('map.shop') }}</button>
            <button class="btn-action" @click="showHealingSandbox = true"><i class="fas fa-leaf"></i> {{ t('map.sanctuary') }}</button>
            <div class="coin-panel" @mouseenter="showCoinTooltip" @mouseleave="hideTooltip"><i class="fas fa-coins"></i><span>{{ store.currentCoins }}</span><small>{{ t('common.labels.coins') }}</small></div>
          </div>
        </div>

        <div :ref="setMapAreaRef('y2')" class="map-area">
          <div class="y2-map-shell">
            <div class="orb y2-orb top-left"></div>
            <div class="orb y2-orb bottom-right"></div>
            <svg class="y2-magic-svg" viewBox="0 0 1050 650" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="y2MagicGradient" x1="0%" y1="0%" x2="100%" y2="10%">
                  <stop offset="0%" stop-color="#4facfe"></stop>
                  <stop offset="40%" stop-color="#a855f7"></stop>
                  <stop offset="100%" stop-color="#f6d365"></stop>
                </linearGradient>
              </defs>
              <g transform="translate(-230, 3) scale(1.23, 1.11)">
                <g>
                  <path class="y2-road-underlay" :d="y2Path" />
                  <path class="y2-road-glow" :d="y2Path" />
                  <path class="y2-road-line" :d="y2Path" />
                </g>
                <g v-for="node in y2Nodes" 
                  :key="node.id" 
                  :ref="setNodeRef('y2', node.id)" 
                  class="node-group" 
                  :class="{ locked: !isAccessible('y2', node.id), completed: isCleared('y2', node.id), final: node.final }" 
                  :transform="`translate(${node.x}, ${node.y})`" 
                  @click="openLevel('y2', node)"
                  @mouseenter="showTooltip($event, node, 'y2')"
                  @mouseleave="hideTooltip">
                  <circle class="node-circle" :r="node.radius" />
                  <text class="node-icon-svg">{{ node.icon }}</text>
                  <text class="node-text-svg" :y="node.textY">{{ node.label }}</text>
                </g>
              </g>
            </svg>
          </div>

          <div class="traveler" :class="{ walking: traveler.y2.walking, reached: traveler.y2.reached }" :style="[travelerStyle, { left: traveler.y2.left, top: traveler.y2.top }]">
            <div class="traveler-shadow"></div>
            <div class="traveler-body">
              <div class="traveler-hair"></div>
              <div class="traveler-face"><span class="eye left"></span><span class="eye right"></span><span class="blush left"></span><span class="blush right"></span><span class="mouth"></span></div>
              <div class="traveler-arm left"></div><div class="traveler-arm right"></div><div class="traveler-leg left"></div><div class="traveler-leg right"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="board y3" :class="{ active: store.year === 'y3' }">
        <div class="header">
          <h1><i class="fas fa-star"></i> {{ t('map.year3Title') }}</h1>
          <div class="header-right">
            <button class="btn-action" @click="showPrizeShop = true"><i class="fas fa-gift"></i> {{ t('map.shop') }}</button>
            <button class="btn-action" @click="showHealingSandbox = true"><i class="fas fa-leaf"></i> {{ t('map.sanctuary') }}</button>
            <div class="coin-panel" @mouseenter="showCoinTooltip" @mouseleave="hideTooltip"><i class="fas fa-coins"></i><span>{{ store.currentCoins }}</span><small>{{ t('common.labels.gems') }}</small></div>
          </div>
        </div>

        <div :ref="setMapAreaRef('y3')" class="map-area">
          <div class="y3-map-shell">
            <div class="orb y3-orb top-left"></div>
            <div class="orb y3-orb bottom-right"></div>
            <div class="orb y3-orb center"></div>
            <svg class="star-svg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="y3StarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#818cf8"></stop><stop offset="25%" stop-color="#fb7185"></stop><stop offset="55%" stop-color="#fb923c"></stop><stop offset="100%" stop-color="#fbbf24"></stop>
                </linearGradient>
              </defs>
              <path class="star-underlay" :d="y3Path" /><path class="star-glow" :d="y3Path" /><path class="star-road" :d="y3Path" /><path class="star-core" :d="y3Path" />
            </svg>

            <div class="traveler" :class="{ walking: traveler.y3.walking, reached: traveler.y3.reached }" :style="[travelerStyle, { left: traveler.y3.left, top: traveler.y3.top }]">
              <div class="traveler-shadow"></div>
              <div class="traveler-body">
                <div class="traveler-hair"></div>
                <div class="traveler-face"><span class="eye left"></span><span class="eye right"></span><span class="blush left"></span><span class="blush right"></span><span class="mouth"></span></div>
                <div class="traveler-arm left"></div><div class="traveler-arm right"></div><div class="traveler-leg left"></div><div class="traveler-leg right"></div>
              </div>
            </div>
            
            <button v-for="node in y3Nodes" 
              :key="node.id" 
              :ref="setNodeRef('y3', node.id)" 
              type="button" 
              class="node" 
              :class="[node.positionClass, { locked: !isAccessible('y3', node.id), completed: isCleared('y3', node.id), final: node.final }]" 
              @click="openLevel('y3', node)"
              @mouseenter="showTooltip($event, node, 'y3')"
              @mouseleave="hideTooltip">
              <span v-if="node.stacked" class="node-icon-stack"><i :class="[node.iconClass, 'icon-base']"></i><i :class="[node.iconTopClass, 'icon-top']"></i></span>
              <i v-else :class="node.iconClass"></i>
              <span class="node-label">{{ node.label }}</span>
            </button>
          </div>
        </div>
      </section>
    </div>

    <div v-if="activeLevel" class="modal-overlay">
      <div class="game-modal-content" :class="{ 'chrome-free-modal': isChromeFreeLevel }">
        <button v-if="!isChromeFreeLevel" class="absolute-close-btn" @click="closeGame"><i class="fas fa-times"></i></button>
        <div v-if="!isChromeFreeLevel" class="modal-header"><span>{{ activeLevelTitle }}</span></div>
        <div class="game-stage native-stage" :class="{ 'chrome-free-stage': isChromeFreeLevel }">
          <component v-if="nativeGameComponent" :is="nativeGameComponent" @complete="handleNativeComplete" @close="closeGame" />
          <div v-else class="missing-native-game">{{ t('map.missingLevel') }}</div>
        </div>
      </div>
    </div>

    <PrizeShop v-if="showPrizeShop" :active-year="store.year" :balance="store.currentCoins" :items="store.shopItems" :redeem-message="redeemMessage" @close="showPrizeShop = false" @redeem="redeemPrize" />
    <HealingSandbox v-if="showHealingSandbox" @close="showHealingSandbox = false" />

    <div v-if="showResetConfirm" class="modal-overlay" @click.self="showResetConfirm = false">
      <div class="confirm-modal-content">
        <h2>{{ t('map.resetTitle') }}</h2>
        <p>{{ t('map.resetDescription') }}</p>
        <div class="confirm-actions">
          <button class="confirm-btn cancel" @click="showResetConfirm = false">{{ t('common.actions.cancel') }}</button>
          <button class="confirm-btn reset" @click="resetGame">{{ t('map.resetConfirm') }}</button>
        </div>
      </div>
    </div>
    <div v-if="showYear3Unlock" class="modal-overlay" @click.self="showYear3Unlock = false">
      <div class="confirm-modal-content unlock-modal-content">
        <h2>{{ t('map.year3UnlockedTitle') }}</h2>
        <p>{{ t('map.year3UnlockedBody') }}</p>
        <div class="confirm-actions">
          <button class="confirm-btn" @click="showYear3Unlock = false">{{ t('common.actions.close') }}</button>
          <button class="confirm-btn primary" @click="handleYear3Unlock">{{ t('map.year3UnlockedButton') }}</button>
        </div>
      </div>
    </div>
    <div v-if="tooltip.visible" class="custom-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      {{ tooltip.text }}
    </div>
    <div v-if="showGuide" class="guide-overlay" @click.self="closeGuide">
      <div class="guide-bubble" :style="guideBubbleStyle">
        <div class="guide-arrow"></div>
        <div class="guide-content">
          <h3>✨ {{ t('guide.title') }} ✨</h3>
          <p>{{ t('guide.description') }}</p>
          <p class="guide-action">👉 {{ t('guide.action') }} 👈</p>
          <button class="guide-close-btn" @click="closeGuide">{{ t('guide.gotIt') }}</button>
        </div>
      </div>
      <div class="hand-pointer" :style="handStyle">👆</div>
    </div>
    <HelpGuide v-if="showHelpModal" @close="showHelpModal = false" />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getPortalText, useAppI18n } from '@/composables/useAppI18n'
import AvatarBadge from '@/components/AvatarBadge.vue'
import PrizeShop from '@/components/PrizeShop.vue'
import HealingSandbox from '@/components/HealingSandbox.vue'
import { LEVEL_DEFINITIONS } from '@/config/levels'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import HelpGuide from '@/components/HelpGuide.vue'

const router = useRouter()
const authStore = useAuthStore()
const store = useGameStore()
const { currentLanguage, t } = useAppI18n()
store.hydrate()
const chromeFreeFiles = new Set(['year3_8.vue'])
const copy = computed(() => getPortalText(currentLanguage.value))

const totalNodes = computed(() => LEVEL_DEFINITIONS.y2.length + LEVEL_DEFINITIONS.y3.length)
const completedCount = computed(() => {
  const y2Completed = store.y2.levels.filter(l => l.completed).length
  const y3Completed = store.y3.levels.filter(l => l.completed).length
  return y2Completed + y3Completed
})
const progressPercent = computed(() => (completedCount.value / totalNodes.value) * 100)
const showGuide = ref(false)
const handStyle = reactive({ left: '0px', top: '0px' })
const guideBubbleStyle = reactive({ left: 'auto', top: 'auto' })
const showHelpModal = ref(false)

const y2Path = 'M572.3 368.6C575.8 325.1 579.2 281.6 573.5 243.1 567.7 204.7 558.2 165.2 537.6 137.9 517 110.6 482.5 87.3 449.8 79.3c-32.8-8-78.8-5-108.7 10.7-29.9 15.7-55.7 49.8-70.5 83.7-14.8 33.9-17.9 79.3-18.5 119.5-.6 40.3 4.1 91.5 15.1 122 11 30.5 27.7 45.4 50.9 61 23.2 15.5 56.5 30.6 87.9 32.2 31.4 1.6 75.7-10 100.6-22.7 24.9-12.7 40.5-34.3 48.6-53.8 8.1-19.5 6.2-51.4 0-63.4-6.2-12-28-12.4-37-8.4-9 4-15.6 18.7-17.3 32.3-1.7 13.5-5.8 31.3 6.9 49 12.7 17.7 30.4 36 68.7 50.6 38.3 14.6 100.9 28.7 160.7 29.9 59.7 1.2 155.7-4.8 197.7-22.7 42-17.9 51.4-59.8 54.3-84.9 2.9-25.1-9.4-48.6-37-65.7-27.6-17.1-89.6-23.7-128.3-37.1-38.7-13.4-82.1-22.9-104-43-22-20.1-29.1-51.6-27.8-77.7 1.4-26.1 19.1-58.6 35.9-78.9 16.8-20.3 39.7-36.2 64.8-43 25-6.8 61.5-3.4 85.5 2.4 24 5.7 36.8 10.9 53.6 21.7 16.8 10.8 52.7 56.4 59.7 61.9'
const y3Path = 'M284 351.5 388.257 259.513 383.437 124.872 526.06 129.423 623.5 31 720.94 129.423 863.563 124.872 858.743 259.513 963 351.5 858.743 443.487 863.563 578.128 720.94 573.577 623.5 672 526.06 573.577 383.437 578.128 388.257 443.487Z'
const meta = { y2: Object.fromEntries(LEVEL_DEFINITIONS.y2.map((l) => [l.id, l])), y3: Object.fromEntries(LEVEL_DEFINITIONS.y3.map((l) => [l.id, l])) }
const gameModules = import.meta.glob('./games/*.vue')
const y2NodeLayout = [{ id: 1, icon: '\uf2bb', radius: 28, x: 572, y: 368, textY: 48 }, { id: 2, icon: '\uf0ac', radius: 26, x: 341, y: 90, textY: 48 }, { id: 3, icon: '\uf54e', radius: 26, x: 252, y: 293, textY: 48 }, { id: 4, icon: '\uf0c3', radius: 27, x: 506, y: 485, textY: 50 }, { id: 5, icon: '\uf017', radius: 26, x: 737, y: 528, textY: 48 }, { id: 6, icon: '\uf002', radius: 26, x: 952, y: 355, textY: 48 }, { id: 7, icon: '\uf005', radius: 32, x: 992, y: 161, textY: 55, final: true }]
const y3NodeLayout = [{ id: 1, positionClass: 'n1', iconClass: 'fas fa-hourglass-half' }, { id: 2, positionClass: 'n2', iconClass: 'fas fa-cubes' }, { id: 3, positionClass: 'n3', iconClass: 'fas fa-microscope' }, { id: 4, positionClass: 'n4', iconClass: 'fas fa-book-open', iconTopClass: 'fas fa-pen-nib', stacked: true }, { id: 5, positionClass: 'n5', iconClass: 'fas fa-cat' }, { id: 6, positionClass: 'n6', iconClass: 'fas fa-calendar-alt' }, { id: 7, positionClass: 'n7', iconClass: 'fas fa-biohazard' }, { id: 8, positionClass: 'n8', iconClass: 'fas fa-crown', final: true }]
const y2Nodes = computed(() => y2NodeLayout.map((node) => ({
  ...node,
  label: `${node.id}. ${t(`${meta.y2[node.id].i18nKey}.mapLabel`)}`,
  title: t(`${meta.y2[node.id].i18nKey}.title`),
  file: meta.y2[node.id].file,
  i18nKey: meta.y2[node.id].i18nKey,
})))
const y3Nodes = computed(() => y3NodeLayout.map((node) => ({
  ...node,
  label: `${node.id}. ${t(`${meta.y3[node.id].i18nKey}.mapLabel`)}`,
  title: t(`${meta.y3[node.id].i18nKey}.title`),
  file: meta.y3[node.id].file,
  i18nKey: meta.y3[node.id].i18nKey,
})))
const showPrizeShop = ref(false)
const showHealingSandbox = ref(false)
const showResetConfirm = ref(false)
const showYear3Unlock = ref(false)
const hasSeenYear2Unlock = ref(false)
const redeemMessage = ref('')
const statusMessage = ref('')
const showMobileMenu = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const activeLevel = ref(null)
const mapAreas = reactive({ y2: null, y3: null })
const nodeRefs = reactive({ y2: {}, y3: {} })
const traveler = reactive({ y2: { left: '50%', top: '50%', walking: false, reached: false }, y3: { left: '50%', top: '50%', walking: false, reached: false } })
const travelerStyle = computed(() => ({ '--traveler-hair': store.travelerLook.hairColor, '--traveler-outfit': store.travelerLook.outfitColor }))
const nativeGameComponent = computed(() => {
  if (!activeLevel.value) return null
  const loader = gameModules[`./games/${activeLevel.value.file}`]
  if (!loader) return null
  return defineAsyncComponent(loader)
})

const year2Complete = computed(() => store.y2.levels.length > 0 && store.y2.levels.every((level) => level.completed))
const isChromeFreeLevel = computed(() => Boolean(activeLevel.value && chromeFreeFiles.has(activeLevel.value.file)))
const activeLevelTitle = computed(() => activeLevel.value?.i18nKey ? t(`${activeLevel.value.i18nKey}.title`) : '')
let openLevelTimer = null
const travelerTimers = { y2: null, y3: null }
const setMapAreaRef = (year) => (element) => { mapAreas[year] = element || null }
const setNodeRef = (year, nodeId) => (element) => {
  if (element) nodeRefs[year][nodeId] = element;
  else delete nodeRefs[year][nodeId];
  if (nodeId === 1 && showGuide.value) {
    nextTick(() => updateGuidePosition());
  }
}
const tooltip = reactive({ visible: false, text: '', x: 0, y: 0 })
let tooltipTimer = null

const getLevelState = (year, nodeId) => store.getLevel(year, nodeId)
const isAccessible = (year, nodeId) => store.isNodeAccessible(year, nodeId)
const isCleared = (year, nodeId) => Boolean(getLevelState(year, nodeId)?.completed || getLevelState(year, nodeId)?.skipped)
function getNodeCenter(year, nodeId) { const map = mapAreas[year]; const node = nodeRefs[year][nodeId]; if (!map || !node) return null; const mr = map.getBoundingClientRect(); const nr = node.getBoundingClientRect(); if (!mr.width || !nr.width) return null; return { left: nr.left - mr.left + nr.width / 2, top: nr.top - mr.top + nr.height / 2 } }
function moveTravelerToNode(year, nodeId) { const center = getNodeCenter(year, nodeId); if (!center) return; traveler[year].left = `${center.left}px`; traveler[year].top = `${center.top}px`; traveler[year].walking = true; traveler[year].reached = false; if (travelerTimers[year]) clearTimeout(travelerTimers[year]); travelerTimers[year] = window.setTimeout(() => { traveler[year].walking = false; traveler[year].reached = true }, 850) }
function syncTraveler(year, nodeId = store[year].currentNode) { nextTick(() => window.requestAnimationFrame(() => moveTravelerToNode(year, nodeId))) }
function switchYear(year) { if (store.year === year) { syncTraveler(year); return } store.switchYear(year) }
function switchYearAndClose(year) { switchYear(year); showMobileMenu.value = false }
function showTooltipNow(node, year, type = 'locked') {
  let text = ''
  if (type === 'locked') {
    const previous = node.id - 1
    text = t('map.lockedTooltip', { previous, current: node.id })
  } else {
    const i18nKey = meta[year][node.id]?.i18nKey
    text = t(`${i18nKey}.title`)
  }
  tooltip.text = text
  tooltip.x = window.innerWidth / 2 - 100
  tooltip.y = window.innerHeight / 2 - 50
  tooltip.visible = true
  if (tooltipTimer) clearTimeout(tooltipTimer)
  tooltipTimer = setTimeout(() => {
    tooltip.visible = false
  }, 2000)
}
function openLevel(year, node) {
  if (!isAccessible(year, node.id)) {
    // 使用自定义 tooltip 代替 alert
    showTooltipNow(node, year, 'locked');
    return;
  }
  // 如果点击的是第一个节点且引导正在显示，关闭引导
  if (node.id === 1 && showGuide.value) {
    closeGuide();
  }
  if (openLevelTimer) clearTimeout(openLevelTimer);
  if (store.year !== year) store.switchYear(year);
  store.setCurrentNode(year, node.id);
  moveTravelerToNode(year, node.id);
  openLevelTimer = window.setTimeout(() => {
    activeLevel.value = { ...node, year };
  }, 420);
}
function closeGame() { if (openLevelTimer) { clearTimeout(openLevelTimer); openLevelTimer = null } activeLevel.value = null }
async function redeemPrize(prize) { const label = store.year === 'y2' ? t('common.labels.coins') : t('common.labels.gems'); statusMessage.value = ''; try { await store.purchasePrize(prize); redeemMessage.value = `&#x1F389; ${t('map.redeemSuccess', { name: prize.name, cost: prize.cost, currency: label, balance: store.currentCoins })}` } catch (error) { redeemMessage.value = error.message || t('map.redeemNotEnough') } }
async function handleNativeComplete(payload = {}) { if (!activeLevel.value) return; const year = activeLevel.value.year; const levelId = activeLevel.value.id; const profile = payload.profile || payload; const rewardCoins = Number(payload.rewardCoins) || 0; statusMessage.value = ''; try { await store.completeNode(year, levelId, { rewardCoins, profile }); closeGame(); syncTraveler(year, store[year].currentNode) } catch (error) { statusMessage.value = error.message || copy.value.map.syncFailed } }
async function resetGame() { closeGame(); showPrizeShop.value = false; showHealingSandbox.value = false; showResetConfirm.value = false; redeemMessage.value = ''; statusMessage.value = ''; try { await store.resetStore(); syncTraveler('y2', 1) } catch (error) { statusMessage.value = error.message || copy.value.map.syncFailed } }
async function handleLogout() { await authStore.logout(); store.clearState(); await router.replace({ name: 'login' }) }
function handleYear3Unlock() {
  showYear3Unlock.value = false
  hasSeenYear2Unlock.value = true
  if (typeof window !== 'undefined') localStorage.setItem('year2UnlockSeen', 'true')
  switchYear('y3')
}
function handleEscape(event) { if (event.key !== 'Escape') return; if (showResetConfirm.value) { showResetConfirm.value = false; return } if (activeLevel.value) { closeGame(); return } if (showYear3Unlock.value) { showYear3Unlock.value = false; return } if (showPrizeShop.value) { showPrizeShop.value = false; return } if (showHealingSandbox.value) showHealingSandbox.value = false }
const handleResize = () => syncTraveler(store.year)

function showCoinTooltip(event) {
  tooltip.text = t('map.coinTooltip')
  tooltip.x = event.clientX + 15
  tooltip.y = event.clientY - 30
  tooltip.visible = true
  if (tooltipTimer) clearTimeout(tooltipTimer)
}
function showTooltip(event, node, year) {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  let text = ''
  const accessible = isAccessible(year, node.id)
  if (!accessible) {
    const previous = node.id - 1
    text = t('map.lockedTooltip', { previous, current: node.id })
  } else {
    const i18nKey = meta[year][node.id]?.i18nKey
    if (i18nKey) {
      text = t(`${i18nKey}.title`) + (t(`${i18nKey}.mapLabel`) ? ` (${t(`${i18nKey}.mapLabel`)})` : '')
    } else {
      text = node.label
    }
  }
  tooltip.text = text
  tooltip.x = event.clientX + 15
  tooltip.y = event.clientY - 30
  tooltip.visible = true
}

function hideTooltip() {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  tooltipTimer = setTimeout(() => {
    tooltip.visible = false
  }, 100)
}
function updateGuidePosition() {
  const year = store.year
  const firstNodeId = 1
  const nodeElement = nodeRefs[year]?.[firstNodeId]
  if (!nodeElement) return
  const rect = nodeElement.getBoundingClientRect()
  handStyle.left = `${rect.left + rect.width / 2 - 20}px`
  handStyle.top = `${rect.top - 40}px`
  guideBubbleStyle.left = `${rect.left - 220}px`
  guideBubbleStyle.top = `${rect.top - 100}px`
  if (rect.left < 250) {
    guideBubbleStyle.left = `${rect.left + rect.width + 20}px`
  }
}

function closeGuide() {
  showGuide.value = false
  localStorage.setItem('hasSeenMapGuide', 'true')
}

function initGuide() {
  const hasSeen = localStorage.getItem('hasSeenMapGuide')
  if (!hasSeen) {
    showGuide.value = true
    setTimeout(() => {
      updateGuidePosition()
      setTimeout(() => updateGuidePosition(), 100)
    }, 200)
  }
}
function showHelpTooltip(event) {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  tooltip.text = t('help.tooltip')
  tooltip.x = event.clientX + 15
  tooltip.y = event.clientY - 30
  tooltip.visible = true
}

watch(year2Complete, (current, previous) => {
  if (current && !previous && !hasSeenYear2Unlock.value) {
    showYear3Unlock.value = true
  }
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    hasSeenYear2Unlock.value = localStorage.getItem('year2UnlockSeen') === 'true'
  }
  if (year2Complete.value && !hasSeenYear2Unlock.value) {
    showYear3Unlock.value = true
  }
})

watch(() => store.year, (year) => syncTraveler(year, store[year].currentNode))
watch(() => store.y2.currentNode, (nodeId) => { if (store.year === 'y2') syncTraveler('y2', nodeId) })
watch(() => store.y3.currentNode, (nodeId) => { if (store.year === 'y3') syncTraveler('y3', nodeId) })
watch(() => store.year, () => {
  if (showGuide.value) nextTick(() => updateGuidePosition())
})
onMounted(async () => {
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', handleResize)
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })

  try {
    await store.ensureLoaded()
    syncTraveler(store.year, store[store.year].currentNode)
  } catch (error) {
    statusMessage.value = error.message || copy.value.map.syncFailed
  }

  initGuide()
})
onBeforeUnmount(() => { window.removeEventListener('keydown', handleEscape); window.removeEventListener('resize', handleResize); if (openLevelTimer) clearTimeout(openLevelTimer); Object.values(travelerTimers).forEach((timer) => { if (timer) clearTimeout(timer) }) })
</script>

<style scoped>
.help-btn-wrapper {
  position: fixed;
  top: 20px;
  left: 190px;  /* 根据语言切换按钮的实际宽度调整，避免重叠 */
  z-index: 1201;
}

/* Mobile Menu */
.mobile-menu-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1210;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  backdrop-filter: blur(8px);
}

.mobile-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1200;
  animation: fade-in 0.3s ease;
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  right: -400px;
  width: 380px;
  height: 100vh;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(7, 11, 20, 0.98) 100%);
  backdrop-filter: blur(16px);
  border-left: 2px solid rgba(243, 207, 154, 0.2);
  z-index: 1205;
  padding: 20px 0;
  overflow-y: auto;
  box-shadow: -8px 0 28px rgba(0, 0, 0, 0.6);
  transition: right 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-menu-drawer.open {
  right: 0;
}

.mobile-menu-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 50%;
  font-size: 1.4rem;
  cursor: pointer;
  transition: 0.2s;
}

.mobile-menu-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.mobile-menu-content {
  padding: 60px 20px 20px;
}

.mobile-menu-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(243, 207, 154, 0.15);
}

.mobile-menu-section:last-child {
  border-bottom: none;
}

.mobile-menu-item {
  padding: 16px 18px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #e8edf9;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: 0.2s;
  border: 1px solid rgba(243, 207, 154, 0.2);
  text-align: left;
}

.mobile-menu-item:hover {
  background: rgba(243, 207, 154, 0.1);
  border-color: rgba(243, 207, 154, 0.4);
  transform: translateX(4px);
}

.mobile-menu-item.active {
  background: rgba(243, 207, 154, 0.2);
  border-color: #f3cf9a;
  color: #f3cf9a;
}

.mobile-menu-item.danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

.mobile-menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}

.mobile-menu-coins {
  padding: 16px 18px;
  border-radius: 12px;
  background: rgba(26, 42, 108, 0.5);
  color: #ffdf99;
  border: 2px solid #f3cf9a;
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.help-btn {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 40px;
  padding: 8px 14px;
  color: #fff;
  font-family: Georgia, serif;
  font-size: 1.2rem;
  cursor: pointer;
  transition: 0.2s;
}
.help-btn:hover {
  background: rgba(243, 207, 154, 0.3);
  transform: scale(1.05);
}
.guide-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  pointer-events: auto;
}
.guide-bubble {
  position: fixed;
  width: 280px;
  background: #fffcf0;
  border: 3px solid #f3cf9a;
  border-radius: 24px;
  padding: 16px 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  color: #2d5a6e;
  font-family: Georgia, serif;
  z-index: 201;
  pointer-events: auto;
}
.guide-arrow {
  position: absolute;
  left: 20px;
  bottom: -20px;
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 20px solid #f3cf9a;
}
.guide-content h3 {
  margin: 0 0 8px;
  font-size: 1.2rem;
}
.guide-content p {
  margin: 8px 0;
  font-size: 0.9rem;
  line-height: 1.4;
}
.guide-action {
  font-weight: bold;
  color: #e67e22;
}
.guide-close-btn {
  margin-top: 12px;
  background: #f3cf9a;
  border: none;
  border-radius: 40px;
  padding: 6px 16px;
  cursor: pointer;
  font-weight: bold;
  color: #2d5a6e;
}
.hand-pointer {
  position: fixed;
  font-size: 48px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  pointer-events: none;
  z-index: 202;
  animation: handFloat 1.2s ease-in-out infinite;
}
@keyframes handFloat {
  0% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-15px) rotate(-5deg); }
  100% { transform: translateY(0) rotate(-10deg); }
}
.custom-tooltip {
  position: fixed;
  background: #fffcf3;           /* 羊皮纸底色 */
  color: #2d5a6e;                /* 深蓝绿色文字 */
  padding: 8px 14px;
  border-radius: 12px;
  font-family: Georgia, serif;    /* 与地图标题字体一致 */
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 280px;
  word-wrap: break-word;
  z-index: 300;
  box-shadow: 0 6px 14px rgba(0,0,0,0.2);
  border-left: 5px solid #e2bc7c; /* 金色左边框 */
  pointer-events: none;
  white-space: normal;
  line-height: 1.4;
}
.global-progress {
  margin: 10px 20px 0;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(243, 207, 154, 0.3);
}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-family: Georgia, serif;   
  font-weight: 800;              
  color: #f8fafc;
  font-size: 0.8rem;
  margin-bottom: 4px;
  letter-spacing: 0.02em;
}
.progress-label span:last-child {
  background: rgba(243, 207, 154, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fde68a);
  border-radius: 4px;
  transition: width 0.3s ease;
}
.map-page { min-height: 100vh; padding: 20px; overflow: hidden; background: radial-gradient(circle at 14% 16%, rgba(56, 189, 248, 0.18) 0%, transparent 22%), radial-gradient(circle at 82% 14%, rgba(244, 114, 182, 0.16) 0%, transparent 20%), radial-gradient(circle at 74% 78%, rgba(168, 85, 247, 0.16) 0%, transparent 24%), radial-gradient(circle at 24% 82%, rgba(34, 197, 94, 0.12) 0%, transparent 18%), linear-gradient(160deg, #070a14 0%, #110d1e 42%, #070b12 100%); }
.map-page::before, .map-page::after { content: ''; position: fixed; inset: 0; pointer-events: none; }
.map-page::before { z-index: 0; opacity: 0.92; background-image: radial-gradient(2.2px 2.2px at 24px 36px, rgba(255, 255, 255, 0.95), transparent 58%), radial-gradient(1.8px 1.8px at 84px 118px, rgba(255, 255, 255, 0.8), transparent 58%), radial-gradient(1.9px 1.9px at 156px 58px, rgba(147, 197, 253, 0.82), transparent 58%), radial-gradient(1.7px 1.7px at 208px 174px, rgba(244, 114, 182, 0.76), transparent 58%), radial-gradient(1.4px 1.4px at 116px 196px, rgba(196, 181, 253, 0.78), transparent 58%), radial-gradient(1.6px 1.6px at 52px 162px, rgba(250, 204, 21, 0.7), transparent 58%); background-size: 220px 220px, 280px 280px, 320px 320px, 360px 360px, 260px 260px, 300px 300px; background-position: 0 0, 42px 58px, 112px 36px, 180px 100px, 74px 146px, 150px 14px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.2)); animation: star-twinkle 6.5s ease-in-out infinite alternate; }
.map-page::after { z-index: 0; opacity: 0.5; background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 52%), radial-gradient(circle at 50% -10%, rgba(79, 172, 254, 0.1) 0%, transparent 36%), radial-gradient(circle at 50% 110%, rgba(236, 72, 153, 0.1) 0%, transparent 34%); animation: nebula-shift 14s ease-in-out infinite alternate; }
.app-shell { width: 100%; max-width: 1380px; position: relative; padding-top: 118px; z-index: 1; margin: 0 auto; }
.top-switcher { display: flex; gap: 10px; margin-bottom: 16px; position: absolute; top: 62px; right: 0; z-index: 50; flex-wrap: wrap; justify-content: flex-end; max-width: min(100%, 980px); }
.session-pill { padding: 10px 16px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); border: 2px solid rgba(243, 207, 154, 0.26); color: #f8fafc; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.session-pill span { display: inline-flex; align-items: center; gap: 8px; }
.sync-banner { margin: 10px 20px 0; padding: 10px 14px; border-radius: 16px; background: rgba(37, 99, 235, 0.2); border: 1px solid rgba(147, 197, 253, 0.35); color: #dbeafe; font-weight: 700; }
.sync-banner.error { background: rgba(127, 29, 29, 0.5); border-color: rgba(248, 113, 113, 0.4); color: #fee2e2; }
.switch-btn { border: none; border-radius: 999px; padding: 10px 25px; min-width: 130px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2); transition: 0.2s; font-size: 1.05rem; }
.switch-btn.primary { background: #2c5a6e; color: #fff3c0; border: 2px solid #ffcf7a; }
.switch-btn.secondary { background: #f6e7be; color: #2c5a6e; border: 2px solid #e3be73; }
.switch-btn.danger { background: #8f2f1e; color: #fff4ec; border: 2px solid #ffc1a8; }
.switch-btn:hover { transform: translateY(-2px); }
.switch-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2); }
.board { width: 100%; height: clamp(720px, calc(100vh - 120px), 860px); border-radius: 42px; overflow: hidden; display: none; flex-direction: column; position: relative; }
.board.active { display: flex; animation: fade-in 0.4s ease; }
.header { padding: 16px 30px; display: flex; justify-content: space-between; align-items: center; z-index: 20; }
.header-right { display: flex; align-items: center; gap: 14px; }
.header h1 { font-size: 1.6rem; font-weight: 900; font-family: Georgia, serif; }
.header h1 i { margin-right: 8px; }
.btn-action { border: none; border-radius: 999px; padding: 10px 20px; font-weight: 900; cursor: pointer; transition: 0.1s; font-size: 1rem; display: flex; align-items: center; gap: 8px; }
.btn-action:hover { filter: brightness(1.05); }
.btn-action:active { transform: translateY(4px); box-shadow: 0 0 0 transparent; }
.coin-panel { padding: 10px 20px; border-radius: 999px; font-size: 1.1rem; font-weight: 900; display: flex; align-items: center; gap: 8px; }
.coin-panel small { font-size: 0.76rem; font-weight: 800; opacity: 0.82; letter-spacing: 0.02em; }
.map-area { flex: 1; position: relative; overflow: hidden; }
.y2.board { background: rgba(15, 23, 42, 0.74); border: 3px solid rgba(243, 207, 154, 0.22); box-shadow: 0 0 60px rgba(0, 0, 0, 0.65), inset 0 0 40px rgba(112, 48, 160, 0.18); }
.y2 .header { background: linear-gradient(to bottom, rgba(243, 207, 154, 0.08), transparent); border-bottom: 1px solid rgba(243, 207, 154, 0.14); }
.y2 .header h1 { color: #f3cf9a; text-shadow: 0 0 12px rgba(243, 207, 154, 0.45); }
.y2 .header h1 i { color: #e3b249; }
.y2 .btn-action { background: rgba(255, 255, 255, 0.06); color: #e8edf9; border: 2px solid rgba(243, 207, 154, 0.3); box-shadow: 0 4px 0 rgba(10, 16, 32, 0.45); }
.y2 .coin-panel { background: rgba(26, 42, 108, 0.5); color: #ffdf99; border: 2px solid #f3cf9a; box-shadow: 0 0 18px rgba(243, 207, 154, 0.16); }
.y2 .map-area { background: radial-gradient(circle at 16% 18%, rgba(79, 172, 254, 0.16) 0%, transparent 18%), radial-gradient(circle at 78% 16%, rgba(236, 72, 153, 0.14) 0%, transparent 18%), radial-gradient(circle at 50% 54%, rgba(112, 48, 160, 0.24) 0%, transparent 34%), radial-gradient(circle at 82% 82%, rgba(250, 204, 21, 0.1) 0%, transparent 18%), linear-gradient(180deg, #0a1020 0%, #060913 100%); }
.y3.board { background: rgba(18, 16, 28, 0.82); border: 3px solid rgba(255, 187, 166, 0.2); box-shadow: 0 0 60px rgba(0, 0, 0, 0.68), inset 0 0 40px rgba(249, 115, 22, 0.14); }
.y3 .header { background: linear-gradient(to bottom, rgba(255, 186, 138, 0.1), transparent); border-bottom: 1px solid rgba(255, 187, 166, 0.16); }
.y3 .header h1 { color: #ffd9ba; text-shadow: 0 0 12px rgba(255, 186, 138, 0.35); }
.y3 .header h1 i { color: #f6c453; }
.y3 .btn-action { background: rgba(255, 255, 255, 0.06); color: #fff2e8; border: 2px solid rgba(255, 187, 166, 0.3); box-shadow: 0 4px 0 rgba(28, 10, 8, 0.45); }
.y3 .coin-panel { background: rgba(138, 42, 22, 0.45); color: #ffe7da; border: 2px solid #ffbba6; box-shadow: 0 0 18px rgba(255, 187, 166, 0.18); }
.y3 .map-area { background: radial-gradient(circle at 16% 20%, rgba(96, 165, 250, 0.14) 0%, transparent 18%), radial-gradient(circle at 78% 18%, rgba(244, 63, 94, 0.16) 0%, transparent 20%), radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.22) 0%, transparent 32%), radial-gradient(circle at 76% 78%, rgba(250, 204, 21, 0.12) 0%, transparent 18%), radial-gradient(circle at 28% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 18%), linear-gradient(180deg, #120c1c 0%, #060810 100%); }
.y2-map-shell, .y3-map-shell { position: absolute; inset: 0; }
.y2-map-shell::before, .y2-map-shell::after, .y3-map-shell::before, .y3-map-shell::after { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.y2-map-shell::before { opacity: 0.9; background-image: radial-gradient(2px 2px at 18px 26px, rgba(255, 255, 255, 0.92), transparent 58%), radial-gradient(1.6px 1.6px at 76px 114px, rgba(255, 255, 255, 0.72), transparent 58%), radial-gradient(1.7px 1.7px at 138px 54px, rgba(147, 197, 253, 0.8), transparent 58%), radial-gradient(1.6px 1.6px at 212px 88px, rgba(244, 114, 182, 0.72), transparent 58%), radial-gradient(1.5px 1.5px at 112px 172px, rgba(196, 181, 253, 0.76), transparent 58%); background-size: 180px 180px, 240px 240px, 280px 280px, 320px 320px, 220px 220px; background-position: 0 0, 30px 48px, 100px 26px, 148px 92px, 66px 132px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.16)); animation: map-star-twinkle 5.6s ease-in-out infinite alternate; }
.y2-map-shell::after { opacity: 0.45; background: radial-gradient(circle at 50% 48%, rgba(168, 85, 247, 0.14) 0%, transparent 30%), radial-gradient(circle at 28% 78%, rgba(96, 165, 250, 0.08) 0%, transparent 18%), radial-gradient(circle at 76% 76%, rgba(250, 204, 21, 0.08) 0%, transparent 18%); }
.y3-map-shell::before { opacity: 0.9; background-image: radial-gradient(2px 2px at 24px 30px, rgba(255, 255, 255, 0.94), transparent 58%), radial-gradient(1.6px 1.6px at 88px 126px, rgba(255, 255, 255, 0.72), transparent 58%), radial-gradient(1.8px 1.8px at 154px 60px, rgba(196, 181, 253, 0.8), transparent 58%), radial-gradient(1.7px 1.7px at 210px 96px, rgba(250, 204, 21, 0.68), transparent 58%), radial-gradient(1.5px 1.5px at 110px 176px, rgba(96, 165, 250, 0.74), transparent 58%); background-size: 185px 185px, 245px 245px, 295px 295px, 330px 330px, 225px 225px; background-position: 0 0, 38px 56px, 110px 34px, 160px 96px, 72px 136px; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.16)); animation: map-star-twinkle 5.2s ease-in-out infinite alternate-reverse; }
.y3-map-shell::after { opacity: 0.42; background: radial-gradient(circle at 50% 48%, rgba(249, 115, 22, 0.12) 0%, transparent 28%), radial-gradient(circle at 24% 76%, rgba(168, 85, 247, 0.08) 0%, transparent 18%), radial-gradient(circle at 78% 78%, rgba(56, 189, 248, 0.08) 0%, transparent 18%); }
.orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(120px); z-index: 0; }
.y2-orb { width: 280px; height: 280px; opacity: 0.18; background: #8b5cf6; }
.y2-orb.top-left { top: -80px; left: -80px; }
.y2-orb.bottom-right { right: -80px; bottom: -80px; background: #ec4899; opacity: 0.14; }
.y3-orb { width: 300px; height: 300px; opacity: 0.18; background: #fb7185; }
.y3-orb.top-left { top: -90px; left: -80px; background: #8b5cf6; }
.y3-orb.bottom-right { right: -90px; bottom: -90px; background: #22d3ee; opacity: 0.14; }
.y3-orb.center { left: 50%; top: 50%; width: 360px; height: 360px; transform: translate(-50%, -50%); background: #f97316; opacity: 0.1; }
.y2-magic-svg, .star-svg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; }
.y2-magic-svg { filter: drop-shadow(0 0 18px rgba(112, 48, 160, 0.45)); }
.star-svg { pointer-events: none; filter: drop-shadow(0 0 22px rgba(249, 115, 22, 0.24)); transform: translateY(5%) scale(0.9); transform-origin: center; }
.y2-road-underlay { fill: none; stroke: rgba(255, 255, 255, 0.04); stroke-width: 42; stroke-linecap: round; }
.y2-road-glow { fill: none; stroke: #7030a0; stroke-width: 18; stroke-linecap: round; opacity: 0.42; filter: blur(10px); }
.y2-road-line { fill: none; stroke: url(#y2MagicGradient); stroke-width: 12; stroke-linecap: round; stroke-dasharray: 16 20; animation: y2-flow 24s linear infinite; }
.y2 .node-group { cursor: pointer; }
.y2 .node-circle { fill: #0f172a; stroke: #f3cf9a; stroke-width: 3.5; filter: drop-shadow(0 0 12px rgba(243, 207, 154, 0.65)); transition: all 0.25s ease; }
.y2 .node-icon-svg { fill: #f3cf9a; font-family: 'Font Awesome 6 Free'; font-weight: 900; font-size: 26px; text-anchor: middle; dominant-baseline: middle; pointer-events: none; transition: fill 0.2s ease; }
.y2 .node-text-svg { fill: #f8fafc; font-size: 15px; font-weight: 800; text-anchor: middle; pointer-events: none; }
.y2 .node-group:hover .node-circle { stroke: #ffdd77; filter: drop-shadow(0 0 18px #ffdd77); }
.y2 .node-group:hover .node-icon-svg { fill: #ffdd77; }
.y2 .node-group.locked .node-circle { stroke: #6b7280; filter: grayscale(1) brightness(0.7); opacity: 0.6; }
.y2 .node-group.locked .node-icon-svg, .y2 .node-group.locked .node-text-svg { fill: #9ca3af; }
.y2 .node-group.completed .node-circle { stroke: #fbbf24; fill: #1e2a4a; filter: drop-shadow(0 0 20px #fbbf24); }
.y2 .node-group.completed .node-icon-svg { fill: #fcd34d; }
.star-underlay { fill: none; stroke: rgba(255, 255, 255, 0.04); stroke-width: 92; stroke-linejoin: round; stroke-linecap: round; }
.star-glow { fill: none; stroke: #f97316; stroke-width: 34; stroke-linejoin: round; stroke-linecap: round; opacity: 0.38; filter: blur(12px); }
.star-road { fill: none; stroke: url(#y3StarGradient); stroke-width: 16; stroke-linejoin: round; stroke-linecap: round; stroke-dasharray: 20 18; animation: y3-flow 20s linear infinite; }
.star-core { fill: none; stroke: rgba(255, 237, 213, 0.24); stroke-width: 6; stroke-linejoin: round; stroke-linecap: round; }
.node { --y3-node-size: 56px; --y3-node-offset: 28px; position: absolute; z-index: 15; width: var(--y3-node-size); height: var(--y3-node-size); border-radius: 50%; display: flex; justify-content: center; align-items: center; background: rgba(15, 23, 42, 0.92); border: 3px solid #ffd7a1; color: #fff7ed; font-size: 1.35rem; box-shadow: 0 0 18px rgba(255, 166, 92, 0.22); cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, background 0.2s ease; backdrop-filter: blur(6px); }
.node i, .icon-base { color: #ffd7a1; }
.node:hover { transform: translateY(-4px) scale(1.04); border-color: #ffe6ba; box-shadow: 0 0 24px rgba(255, 183, 77, 0.44); }
.node.locked { filter: grayscale(0.9); opacity: 0.62; cursor: not-allowed; }
.node.locked:hover { transform: none; border-color: #ffbba6; box-shadow: 0 0 18px rgba(255, 166, 92, 0.18); }
.node.completed { background: #1b2336; border-color: #fbbf24; box-shadow: 0 0 24px rgba(251, 191, 36, 0.42); }
.node.completed i, .node.completed .icon-base, .node.completed .icon-top { color: #fcd34d; }
.node.final { border-width: 4px; border-color: #ffe08a; box-shadow: 0 0 26px rgba(255, 224, 138, 0.45); }
.node.final i, .node.final .icon-base { color: #ffe08a; filter: drop-shadow(0 0 6px rgba(255, 224, 138, 0.76)); animation: pulse-star 1.4s infinite; }
.node-icon-stack { position: relative; width: 1.45em; height: 1.45em; display: inline-block; }
.icon-base { position: absolute; left: 50%; top: 54%; transform: translate(-50%, -50%); font-size: 1em; }
.icon-top { position: absolute; right: 0.02em; top: 0.08em; font-size: 0.52em; color: #ffe08a; text-shadow: 0 0 4px rgba(255, 224, 138, 0.65); }
.node-label { position: absolute; top: calc(var(--y3-node-size) + 12px); left: 50%; transform: translateX(-50%); min-width: 140px; text-align: center; font-size: 0.82rem; font-weight: 900; color: #f8fafc; white-space: nowrap; pointer-events: none; text-shadow: 0 0 10px rgba(0, 0, 0, 0.85); }
.n1 { left: calc(48.84% - var(--y3-node-offset)); top: calc(13.88% - var(--y3-node-offset)); } .n2 { left: calc(65.72% - var(--y3-node-offset)); top: calc(25.61% - var(--y3-node-offset)); } .n3 { left: calc(72.71% - var(--y3-node-offset)); top: calc(53.94% - var(--y3-node-offset)); } .n4 { left: calc(65.72% - var(--y3-node-offset)); top: calc(82.27% - var(--y3-node-offset)); } .n5 { left: calc(48.84% - var(--y3-node-offset)); top: calc(95.00% - var(--y3-node-offset)); } .n6 { left: calc(31.96% - var(--y3-node-offset)); top: calc(82.27% - var(--y3-node-offset)); } .n7 { left: calc(24.97% - var(--y3-node-offset)); top: calc(53.94% - var(--y3-node-offset)); } .n8 { left: calc(31.96% - var(--y3-node-offset)); top: calc(25.61% - var(--y3-node-offset)); }
.n5 .node-label { top: auto; bottom: calc(var(--y3-node-size) + 12px); }
.traveler { --traveler-scale: 1; position: absolute; width: 78px; height: 96px; z-index: 18; pointer-events: none; transition: left 0.8s cubic-bezier(0.22, 1, 0.36, 1), top 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.25s ease; transform: translate(-50%, -92%) scale(var(--traveler-scale)); transform-origin: 50% 92%; }
.y3 .traveler { --traveler-scale: 0.86; }
.traveler.walking { animation: bob-walk 0.55s ease-in-out infinite; }
.traveler.reached::after { content: '\2728'; position: absolute; right: -6px; top: -10px; font-size: 1.15rem; animation: sparkle-pop 0.8s ease; }
.traveler-shadow { position: absolute; bottom: 3px; left: 50%; width: 42px; height: 12px; transform: translateX(-50%); background: rgba(0, 0, 0, 0.18); border-radius: 50%; filter: blur(2px); }
.traveler-body { position: absolute; left: 50%; bottom: 8px; width: 54px; height: 70px; transform: translateX(-50%); }
.traveler-face { position: absolute; top: 2px; left: 50%; width: 44px; height: 42px; transform: translateX(-50%); background: #ffe8c7; border: 3px solid #273640; border-radius: 50% 50% 46% 46%; z-index: 3; }
.traveler.reached .traveler-face { box-shadow: 0 0 0 6px rgba(255, 214, 102, 0.18); }
.traveler-hair { position: absolute; top: -2px; left: 50%; width: 48px; height: 24px; transform: translateX(-50%); background: var(--traveler-hair); border: 3px solid #273640; border-bottom: none; border-radius: 20px 20px 10px 10px; z-index: 4; }
.eye { position: absolute; top: 15px; width: 6px; height: 9px; background: #273640; border-radius: 50%; } .eye.left { left: 11px; } .eye.right { right: 11px; }
.blush { position: absolute; top: 22px; width: 8px; height: 5px; background: rgba(255, 140, 140, 0.55); border-radius: 50%; } .blush.left { left: 5px; } .blush.right { right: 5px; }
.mouth { position: absolute; left: 50%; bottom: 8px; width: 10px; height: 5px; transform: translateX(-50%); border-bottom: 3px solid #b55b5b; border-radius: 0 0 10px 10px; }
.traveler-body::after { content: ''; position: absolute; top: 33px; left: 50%; width: 34px; height: 24px; transform: translateX(-50%); background: var(--traveler-outfit); border: 3px solid #273640; border-radius: 14px 14px 10px 10px; z-index: 2; }
.traveler-arm, .traveler-leg { position: absolute; background: #ffe8c7; border: 3px solid #273640; z-index: 1; }
.traveler-arm { top: 38px; width: 10px; height: 22px; border-radius: 10px; } .traveler-arm.left { left: 4px; transform: rotate(18deg); } .traveler-arm.right { right: 4px; transform: rotate(-18deg); }
.traveler-leg { bottom: 0; width: 10px; height: 22px; border-radius: 10px; background: #fff3d9; } .traveler-leg.left { left: 16px; } .traveler-leg.right { right: 16px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(10, 20, 30, 0.85); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 600; }
.game-modal-content { background: #fffcf3; width: 95%; max-width: 1200px; height: 90vh; border-radius: 24px; padding: 25px; border: 3px solid #e2bc7c; box-shadow: 0 25px 40px rgba(0, 0, 0, 0.6); display: flex; flex-direction: column; position: relative; }
.chrome-free-modal { background: transparent; width: 100vw; max-width: 100vw; height: 100vh; padding: 0; border: none; box-shadow: none; }
.absolute-close-btn { position: absolute; top: -20px; right: -20px; width: 55px; height: 55px; border-radius: 50%; background: #e74c3c; color: #fff; border: 4px solid #fff; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); font-size: 1.8rem; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 1000; transition: 0.2s; }
.absolute-close-btn:hover { background: #c0392b; transform: scale(1.15); }
.modal-header { font-size: 1.5rem; color: #2d5a6e; border-bottom: 2px dashed #e7bc7a; padding-bottom: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; font-weight: 900; font-family: Georgia, serif; }
.game-stage { flex: 1; overflow: auto; border-radius: 16px; background: rgba(15, 23, 42, 0.04); }
.native-stage { padding: 0; }
.chrome-free-stage { overflow: visible; border-radius: 0; background: transparent; min-height: 100%; }
.missing-native-game { min-height: 320px; display: grid; place-items: center; padding: 32px; text-align: center; color: #475569; font-weight: 700; }
.game-frame { flex: 1; width: 100%; border: 2px solid #e2bc7c; border-radius: 16px; background: #000; }
.confirm-modal-content { background: #fffcf4; width: 92%; max-width: 520px; border-radius: 26px; padding: 30px; border: 3px solid #e2bc7c; box-shadow: 0 20px 32px rgba(0, 0, 0, 0.32); }
.confirm-modal-content h2 { margin: 0 0 12px; color: #7c2d12; font-family: Georgia, serif; font-size: 1.6rem; }
.confirm-modal-content p { margin: 0 0 22px; color: #6b4f43; line-height: 1.6; font-size: 1rem; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }
.confirm-btn { border: none; border-radius: 999px; padding: 12px 18px; font-weight: 900; cursor: pointer; transition: 0.18s; }
.confirm-btn:hover { transform: translateY(-2px); }
.confirm-btn.cancel { background: rgba(30, 41, 59, 0.08); color: #334155; border: 2px solid rgba(148, 163, 184, 0.28); }
.confirm-btn.reset { background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; box-shadow: 0 8px 18px rgba(185, 28, 28, 0.22); }
@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes star-twinkle { 0% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.015); } 100% { opacity: 0.72; transform: scale(1.03); } }
@keyframes map-star-twinkle { 0% { opacity: 0.42; filter: brightness(0.9); } 50% { opacity: 0.95; filter: brightness(1.25); } 100% { opacity: 0.64; filter: brightness(1); } }
@keyframes nebula-shift { 0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.4; } 100% { transform: translate3d(0, -10px, 0) scale(1.04); opacity: 0.62; } }
@keyframes y2-flow { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
@keyframes y3-flow { from { stroke-dashoffset: 320; } to { stroke-dashoffset: 0; } }
@keyframes bob-walk { 0% { transform: translate(-50%, -92%) scale(var(--traveler-scale)) rotate(-1deg); } 50% { transform: translate(-50%, -96%) scale(var(--traveler-scale)) rotate(1deg); } 100% { transform: translate(-50%, -92%) scale(var(--traveler-scale)) rotate(-1deg); } }
@keyframes sparkle-pop { 0% { opacity: 0; transform: scale(0.4) translateY(8px); } 60% { opacity: 1; transform: scale(1.15) translateY(-2px); } 100% { opacity: 0; transform: scale(1) translateY(-10px); } }
@keyframes pulse-star { 0% { transform: scale(1); opacity: 0.92; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 0.92; } }

@media (max-width: 1023px) {
  .mobile-menu-toggle {
    display: flex;
  }
  
  .top-switcher {
    display: none !important;
  }
  
  .mobile-menu-drawer {
    width: min(280px, 90vw);
  }
}

@media (max-width: 960px) {
  .app-shell { padding-top: 0; }
  .board { height: clamp(640px, 78vh, 760px); }
  .top-switcher { position: static; justify-content: flex-end; margin-bottom: 12px; flex-wrap: wrap; }
  .header { padding: 14px 18px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .header-right { width: 100%; flex-wrap: wrap; }
  .btn-action, .coin-panel, .switch-btn, .session-pill { width: 100%; justify-content: center; }
  .game-modal-content { padding: 18px; width: calc(100% - 24px); }
  .absolute-close-btn { right: 8px; top: 8px; width: 44px; height: 44px; font-size: 1.2rem; }
  .modal-header { padding-right: 44px; font-size: 1.2rem; }
}
</style>
