<template>
  <aside
    ref="controlRef"
    class="welcome-music-control"
    :class="{ playing: isPlaying, muted: isMuted, blocked: isBlocked, dragging: isDragging }"
    :style="controlStyle"
    :aria-label="copy.panelLabel"
    @click.capture="handleControlClickCapture"
    @pointerdown="handleControlPointerDown"
    @pointermove="handleControlPointerMove"
    @pointerup="handleControlPointerEnd"
    @pointercancel="handleControlPointerEnd"
    @dragstart.prevent
  >
    <div class="music-status">
      <span class="music-light" aria-hidden="true"></span>
      <div class="music-copy">
        <strong>{{ trackTitle }}</strong>
        <span>{{ statusText }}</span>
      </div>
    </div>

    <div class="music-actions">
      <button
        type="button"
        class="music-action play-action"
        :aria-label="copy.playAria"
        @click="playAgain"
      >
        <i class="fas fa-rotate-right" aria-hidden="true"></i>
        <span class="btn-label">{{ copy.play }}</span>
      </button>
      <button
        type="button"
        class="music-action mute-action"
        :aria-label="muteAriaLabel"
        @click="toggleMute"
      >
        <i :class="isMuted ? 'fas fa-volume-xmark' : 'fas fa-volume-high'" aria-hidden="true"></i>
        <span class="btn-label">{{ muteLabel }}</span>
      </button>
      <button
        type="button"
        class="music-action volume-action desktop-volume-action"
        :aria-label="copy.volumeToggleAria"
        :aria-expanded="isVolumePanelOpen"
        @click="toggleVolumePanel"
      >
        <i class="fas fa-sliders" aria-hidden="true"></i>
        <span class="btn-label">{{ copy.volume }}</span>
      </button>
    </div>

    <transition name="volume-panel">
      <div
        v-if="isVolumePanelOpen"
        class="volume-popover desktop-volume-panel"
        :class="{ below: shouldOpenVolumePanelBelow }"
        @click.stop
        @pointerdown.stop
        @pointermove.stop
        @pointerup.stop
        @pointercancel.stop
      >
        <div class="volume-popover-head">
          <span>{{ copy.volume }}</span>
          <strong>{{ volumePercent }}%</strong>
          <button
            type="button"
            class="volume-close"
            :aria-label="copy.volumeCloseAria"
            @click="closeVolumePanel"
          >
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
          </button>
        </div>
        <div class="volume-slider-row">
          <i class="fas fa-volume-low" aria-hidden="true"></i>
          <input
            class="volume-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            :value="volumePercent"
            :aria-label="copy.volumeSliderAria"
            @input="setVolumeFromSlider"
          >
          <i class="fas fa-volume-high" aria-hidden="true"></i>
        </div>
      </div>
    </transition>
  </aside>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { useWelcomeMusic } from '@/composables/useWelcomeMusic'

const CONTROL_POSITION_STORAGE_KEY = 'edujour_music_control_position'
const DRAG_THRESHOLD = 6

const { currentLanguage } = useAppI18n()
const {
  audioSource,
  currentTrack,
  isPlaying,
  isMuted,
  isBlocked,
  hasCompletedOnce,
  loadError,
  volume,
  initializeWelcomeMusic,
  playWelcomeMusic,
  toggleWelcomeMusicMuted,
  setWelcomeMusicVolume,
} = useWelcomeMusic()

const initialViewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth
const initialViewportHeight = typeof window === 'undefined' ? 720 : window.innerHeight
const initialControlMargin = initialViewportWidth <= 768 ? 12 : 18
const initialControlHeight = initialViewportWidth <= 768 ? 52 : 60
const controlRef = ref(null)
const controlPosition = ref({
  x: initialControlMargin,
  y: Math.max(initialControlMargin, initialViewportHeight - initialControlMargin - initialControlHeight),
})
const viewportSize = ref({
  width: initialViewportWidth,
  height: initialViewportHeight,
})
const isDragging = ref(false)
const suppressNextClick = ref(false)
const hasCustomControlPosition = ref(false)
const isVolumePanelOpen = ref(false)

const activeDrag = {
  pointerId: null,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  moved: false,
}

const copy = computed(() => (
  currentLanguage.value === 'en'
    ? {
        panelLabel: 'Music controls',
        title: 'Music',
        playing: 'Playing once',
        muted: 'Muted',
        blocked: 'Tap play to start',
        complete: 'Finished',
        ready: 'Ready',
        unavailable: 'Missing MP3',
        play: 'Play (Replay)',
        playAria: 'Play current music',
        mute: 'Mute',
        unmute: 'Unmute',
        muteAria: 'Mute music',
        unmuteAria: 'Unmute music',
        volume: 'Volume',
        volumeToggleAria: 'Open volume slider',
        volumeCloseAria: 'Collapse volume slider',
        volumeSliderAria: 'Music volume',
      }
    : {
        panelLabel: '音乐控制',
        title: '音乐',
        playing: '播放中',
        muted: '已静音',
        blocked: '点击播放',
        complete: '已播完',
        ready: '准备播放',
        unavailable: '缺少 MP3',
        play: '播放(再播)',
        playAria: '播放当前音乐',
        mute: '静音',
        unmute: '开声',
        muteAria: '静音音乐',
        unmuteAria: '开启音乐声音',
        volume: '音量',
        volumeToggleAria: '展开音量滑杆',
        volumeCloseAria: '收起音量滑杆',
        volumeSliderAria: '音乐音量',
      }
))

const trackTitle = computed(() => (
  currentTrack.value?.label?.[currentLanguage.value] ||
  currentTrack.value?.label?.en ||
  copy.value.title
))

const statusText = computed(() => {
  if (loadError.value) return copy.value.unavailable
  if (isMuted.value) return copy.value.muted
  if (isPlaying.value) return copy.value.playing
  if (isBlocked.value) return copy.value.blocked
  if (hasCompletedOnce.value) return copy.value.complete
  return copy.value.ready
})

const muteLabel = computed(() => (isMuted.value ? copy.value.unmute : copy.value.mute))
const muteAriaLabel = computed(() => (isMuted.value ? copy.value.unmuteAria : copy.value.muteAria))
const volumePercent = computed(() => Math.round(volume.value * 100))
const shouldOpenVolumePanelBelow = computed(() => controlPosition.value.y < 124)
const controlStyle = computed(() => ({
  left: `${controlPosition.value.x}px`,
  top: `${controlPosition.value.y}px`,
}))

function clampNumber(value, min, max) {
  const safeMax = max < min ? min : max
  return Math.min(Math.max(value, min), safeMax)
}

function getControlMetrics() {
  const isMobile = viewportSize.value.width <= 768
  const fallbackWidth = isMobile ? 102 : 340
  const fallbackHeight = isMobile ? 52 : 60

  return {
    margin: isMobile ? 12 : 18,
    width: controlRef.value?.offsetWidth || fallbackWidth,
    height: controlRef.value?.offsetHeight || fallbackHeight,
  }
}

function buildDefaultControlPosition() {
  const { margin, height } = getControlMetrics()

  return {
    x: margin,
    y: Math.max(margin, viewportSize.value.height - margin - height),
  }
}

function clampControlPosition(position) {
  const { margin, width, height } = getControlMetrics()

  return {
    x: clampNumber(position.x, margin, viewportSize.value.width - margin - width),
    y: clampNumber(position.y, margin, viewportSize.value.height - margin - height),
  }
}

function loadControlPosition() {
  try {
    const raw = localStorage.getItem(CONTROL_POSITION_STORAGE_KEY)

    if (!raw) {
      return buildDefaultControlPosition()
    }

    const parsed = JSON.parse(raw)
    if (typeof parsed?.x !== 'number' || typeof parsed?.y !== 'number') {
      return buildDefaultControlPosition()
    }

    hasCustomControlPosition.value = true
    return clampControlPosition(parsed)
  } catch (error) {
    return buildDefaultControlPosition()
  }
}

function persistControlPosition() {
  try {
    localStorage.setItem(CONTROL_POSITION_STORAGE_KEY, JSON.stringify(controlPosition.value))
  } catch (error) {
    console.warn('Failed to persist music control position.', error)
  }
}

function refreshViewportSize() {
  viewportSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  controlPosition.value = hasCustomControlPosition.value
    ? clampControlPosition(controlPosition.value)
    : buildDefaultControlPosition()
}

function isInteractiveControlTarget(target) {
  return Boolean(target?.closest?.('button, input, .volume-popover'))
}

function handleControlPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) {
    return
  }

  if (isInteractiveControlTarget(event.target)) {
    return
  }

  activeDrag.pointerId = event.pointerId
  activeDrag.startX = event.clientX
  activeDrag.startY = event.clientY
  activeDrag.originX = controlPosition.value.x
  activeDrag.originY = controlPosition.value.y
  activeDrag.moved = false
  suppressNextClick.value = false

  event.currentTarget?.setPointerCapture?.(event.pointerId)
}

function handleControlPointerMove(event) {
  if (activeDrag.pointerId !== event.pointerId) {
    return
  }

  const deltaX = event.clientX - activeDrag.startX
  const deltaY = event.clientY - activeDrag.startY

  if (!activeDrag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
    return
  }

  event.preventDefault()
  activeDrag.moved = true
  isDragging.value = true
  controlPosition.value = clampControlPosition({
    x: activeDrag.originX + deltaX,
    y: activeDrag.originY + deltaY,
  })
}

function handleControlPointerEnd(event) {
  if (activeDrag.pointerId !== event.pointerId) {
    return
  }

  if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  suppressNextClick.value = activeDrag.moved
  isDragging.value = false

  if (activeDrag.moved) {
    hasCustomControlPosition.value = true
    persistControlPosition()
  }

  activeDrag.pointerId = null
  activeDrag.moved = false
}

function handleControlClickCapture(event) {
  if (!suppressNextClick.value) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  suppressNextClick.value = false
}

function playAgain() {
  void playWelcomeMusic({ restart: true, unmute: true })
}

function toggleMute() {
  toggleWelcomeMusicMuted()
}

function toggleVolumePanel() {
  isVolumePanelOpen.value = !isVolumePanelOpen.value
}

function closeVolumePanel() {
  isVolumePanelOpen.value = false
}

function setVolumeFromSlider(event) {
  const nextPercent = Number(event.target?.value)
  if (!Number.isFinite(nextPercent)) {
    return
  }

  setWelcomeMusicVolume(nextPercent / 100)
}

onMounted(() => {
  initializeWelcomeMusic()

  if (loadError.value) {
    console.info(`Put your MP3 at frontend/public${audioSource.value}.`)
  }

  nextTick(() => {
    controlPosition.value = loadControlPosition()
  })

  window.addEventListener('resize', refreshViewportSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshViewportSize)
})
</script>

<style scoped>
.welcome-music-control {
  position: fixed;
  left: 18px;
  top: 18px;
  z-index: 1250;
  width: min(340px, calc(100vw - 36px));
  padding: 10px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border-radius: 18px;
  background: rgba(7, 12, 22, 0.9);
  border: 1px solid rgba(243, 207, 154, 0.24);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(8px);
  color: #f8fafc;
  cursor: grab;
  touch-action: none;
  user-select: none;
  will-change: left, top;
}

.welcome-music-control.dragging {
  cursor: grabbing;
}

.welcome-music-control.dragging .music-action {
  cursor: grabbing;
}

.music-status {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.music-light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 0 rgba(148, 163, 184, 0);
}

.welcome-music-control.playing .music-light {
  background: #34d399;
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.7);
}

.welcome-music-control.muted .music-light {
  background: #f97316;
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.5);
}

.welcome-music-control.blocked .music-light {
  background: #facc15;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.45);
}

.music-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.music-copy strong,
.music-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-copy strong {
  font-size: 0.82rem;
  font-weight: 900;
  color: #fef3c7;
}

.music-copy span {
  font-size: 0.74rem;
  color: #cbd5e1;
  font-weight: 700;
}

.music-actions {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 6px;
}

.music-action {
  min-height: 38px;
  padding: 0 11px;
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.music-action:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.16);
}

.play-action {
  color: #fff7ed;
  background: linear-gradient(135deg, #d97706, #ea580c);
}

.volume-action {
  width: 38px;
  min-width: 38px;
  padding: 0;
  color: #e0f2fe;
}

.volume-action[aria-expanded="true"] {
  color: #2c5a6e;
  background: #c7e8f3;
}

.volume-action .btn-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.volume-popover {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  width: min(280px, calc(100vw - 36px));
  padding: 12px;
  border-radius: 16px;
  background: rgba(7, 12, 22, 0.94);
  border: 1px solid rgba(243, 207, 154, 0.28);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(10px);
  cursor: default;
  touch-action: auto;
}

.volume-popover.below {
  top: calc(100% + 8px);
  bottom: auto;
}

.volume-popover-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  color: #f8fafc;
  font-size: 0.78rem;
  font-weight: 900;
}

.volume-popover-head strong {
  color: #fef3c7;
  font-size: 0.82rem;
}

.volume-close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  cursor: pointer;
}

.volume-close:hover {
  background: rgba(255, 255, 255, 0.18);
}

.volume-slider-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  color: #c7e8f3;
}

.volume-slider {
  width: 100%;
  accent-color: #f8d48d;
  cursor: pointer;
}

.volume-panel-enter-active,
.volume-panel-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.volume-panel-enter-from,
.volume-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.volume-popover.below.volume-panel-enter-from,
.volume-popover.below.volume-panel-leave-to {
  transform: translateY(-8px);
}

.mute-action {
  color: #dbeafe;
}

.welcome-music-control.muted .mute-action {
  color: #2c5a6e;
  background: #f8d48d;
}

@media (max-width: 768px) {
  .welcome-music-control {
    width: auto;
    max-width: calc(100vw - 128px);
    padding: 4px;
    border-radius: 999px;
    grid-template-columns: auto;
  }

  .desktop-volume-action {
    display: none;
  }

  .desktop-volume-panel {
    display: none;
  }

  .music-status {
    display: none;
  }

  .music-actions {
    grid-template-columns: repeat(2, auto);
  }

  .music-action {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    padding: 0;
  }

  .btn-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
}
</style>
