<template>
  <aside
    class="welcome-music-control"
    :class="{ playing: isPlaying, muted: isMuted, blocked: isBlocked }"
    :aria-label="copy.panelLabel"
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
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { useWelcomeMusic } from '@/composables/useWelcomeMusic'

const { currentLanguage } = useAppI18n()
const {
  audioSource,
  currentTrack,
  isPlaying,
  isMuted,
  isBlocked,
  hasCompletedOnce,
  loadError,
  initializeWelcomeMusic,
  playWelcomeMusic,
  toggleWelcomeMusicMuted,
} = useWelcomeMusic()

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

function playAgain() {
  void playWelcomeMusic({ restart: true, unmute: true })
}

function toggleMute() {
  toggleWelcomeMusicMuted()
}

onMounted(() => {
  initializeWelcomeMusic()

  if (loadError.value) {
    console.info(`Put your MP3 at frontend/public${audioSource.value}.`)
  }
})
</script>

<style scoped>
.welcome-music-control {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 1250;
  width: min(310px, calc(100vw - 36px));
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
  grid-template-columns: repeat(2, auto);
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

.mute-action {
  color: #dbeafe;
}

.welcome-music-control.muted .mute-action {
  color: #2c5a6e;
  background: #f8d48d;
}

@media (max-width: 768px) {
  .welcome-music-control {
    top: 12px;
    right: 12px;
    width: auto;
    max-width: calc(100vw - 128px);
    padding: 4px;
    border-radius: 999px;
    grid-template-columns: auto;
  }

  .music-status {
    display: none;
  }

  .music-action {
    width: 40px;
    min-width: 40px;
    height: 40px;
    min-height: 40px;
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
