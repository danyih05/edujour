import { ref } from 'vue'

export const MUSIC_TRACKS = {
  login: {
    key: 'login',
    source: '/audio/The_Key_to_the_Willow_Door.mp3',
    label: {
      en: 'Willow Door',
      zh: '登录音乐',
    },
  },
  year2: {
    key: 'year2',
    source: '/audio/welcome.mp3',
    label: {
      en: 'Year 2 Welcome',
      zh: 'Year 2 欢迎音乐',
    },
  },
  year3_8: {
    key: 'year3_8',
    source: '/audio/Three_Hops_and_a_Snap.mp3',
    label: {
      en: 'Three Hops and a Snap',
      zh: 'Year 3-8 音乐',
    },
  },
  year3_6: {
    key: 'year3_6',
    source: '/audio/Where_the_Steel_Settles.mp3',
    label: {
      en: 'Where the Steel Settles',
      zh: 'Year 3-6 战斗音乐',
    },
  },
  year3_7: {
    key: 'year3_7',
    source: '/audio/Xylophone Sorcery.mp3',
    label: {
      en: 'Xylophone Sorcery',
      zh: 'Year 3-7 音乐',
    },
  },
  fightSuccess: {
    key: 'fightSuccess',
    source: '/audio/fightsuccess.mp3',
    label: {
      en: 'Fight Success',
      zh: '战斗胜利音乐',
    },
  },
}

const MUTED_STORAGE_KEY = 'edujour_welcome_music_muted'
const VOLUME_STORAGE_KEY = 'edujour_welcome_music_volume'
const DEFAULT_VOLUME = 0.55

const audioSource = ref('')
const currentTrack = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const isBlocked = ref(false)
const hasCompletedOnce = ref(false)
const loadError = ref('')
const volume = ref(DEFAULT_VOLUME)

let audio = null
let initialized = false
let playRequestId = 0

function readMutedPreference() {
  if (typeof localStorage === 'undefined') {
    return false
  }

  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === 'true'
  } catch (error) {
    console.warn('Failed to read music preference.', error)
    return false
  }
}

function persistMutedPreference(value) {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(MUTED_STORAGE_KEY, value ? 'true' : 'false')
  } catch (error) {
    console.warn('Failed to save music preference.', error)
  }
}

function clampVolume(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_VOLUME
  }

  return Math.min(1, Math.max(0, numericValue))
}

function readVolumePreference() {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_VOLUME
  }

  try {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY)
    return savedVolume === null ? DEFAULT_VOLUME : clampVolume(savedVolume)
  } catch (error) {
    console.warn('Failed to read music volume preference.', error)
    return DEFAULT_VOLUME
  }
}

function persistVolumePreference(value) {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(value))
  } catch (error) {
    console.warn('Failed to save music volume preference.', error)
  }
}

function resolveTrack(track) {
  if (typeof track === 'string') {
    return MUSIC_TRACKS[track] || null
  }

  return track?.source ? track : null
}

function syncMutedPreference(value) {
  isMuted.value = value
  persistMutedPreference(value)

  if (audio) {
    audio.muted = value
  }
}

function syncVolumePreference(value) {
  const nextVolume = clampVolume(value)
  volume.value = nextVolume
  persistVolumePreference(nextVolume)

  if (audio) {
    audio.volume = nextVolume
  }
}

function resetPlaybackState() {
  isPlaying.value = false
  isBlocked.value = false
  hasCompletedOnce.value = false
  loadError.value = ''
}

function handleAudioEnded() {
  isPlaying.value = false
  hasCompletedOnce.value = true
  isBlocked.value = false

  if (audio) {
    audio.currentTime = 0
  }
}

function handleAudioError() {
  isPlaying.value = false
  isBlocked.value = false
  loadError.value = `Audio file unavailable at ${audioSource.value}`
}

function handleUserGestureRetry() {
  if (!audio || !audioSource.value || isMuted.value || isPlaying.value || hasCompletedOnce.value || loadError.value) {
    return
  }

  void playWelcomeMusic({ restart: false })
}

function setAudioTrack(track) {
  const nextTrack = resolveTrack(track)

  if (!nextTrack || currentTrack.value?.source === nextTrack.source) {
    return false
  }

  initializeWelcomeMusic()

  if (!audio) {
    return false
  }

  audio.pause()
  audio.currentTime = 0
  currentTrack.value = nextTrack
  audioSource.value = nextTrack.source
  audio.src = nextTrack.source
  audio.load()
  resetPlaybackState()

  return true
}

export function initializeWelcomeMusic() {
  if (initialized || typeof window === 'undefined') {
    return
  }

  initialized = true
  syncMutedPreference(readMutedPreference())
  syncVolumePreference(readVolumePreference())

  audio = new Audio()
  audio.preload = 'none'
  audio.loop = false
  audio.volume = volume.value
  audio.muted = isMuted.value
  audio.addEventListener('ended', handleAudioEnded)
  audio.addEventListener('error', handleAudioError)

  document.addEventListener('pointerdown', handleUserGestureRetry, true)
  document.addEventListener('click', handleUserGestureRetry, true)
  document.addEventListener('keydown', handleUserGestureRetry, true)
}

export async function playWelcomeMusic(options = {}) {
  const { restart = true, unmute = false } = options

  initializeWelcomeMusic()

  if (!audio || !audioSource.value) {
    return
  }

  if (unmute && isMuted.value) {
    syncMutedPreference(false)
  }

  if (isMuted.value) {
    return
  }

  const requestId = ++playRequestId
  loadError.value = ''

  if (restart) {
    audio.currentTime = 0
  }

  try {
    await audio.play()

    if (requestId !== playRequestId) {
      return
    }

    isPlaying.value = true
    isBlocked.value = false
    hasCompletedOnce.value = false
  } catch (error) {
    if (requestId !== playRequestId) {
      return
    }

    isPlaying.value = false
    isBlocked.value = error?.name === 'NotAllowedError'

    if (!isBlocked.value) {
      loadError.value = `Audio could not play from ${audioSource.value}`
      console.warn('Failed to play music.', error)
    }
  }
}

export function activateWelcomeMusicTrack(track, options = {}) {
  const { play = true, restart = true } = options
  setAudioTrack(track)

  if (play) {
    void playWelcomeMusic({ restart })
  }
}

export function muteWelcomeMusic() {
  syncMutedPreference(true)
  isPlaying.value = false
  isBlocked.value = false

  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

export function unmuteWelcomeMusic() {
  syncMutedPreference(false)
}

export function toggleWelcomeMusicMuted() {
  if (isMuted.value) {
    unmuteWelcomeMusic()
    return
  }

  muteWelcomeMusic()
}

export function setWelcomeMusicVolume(value) {
  initializeWelcomeMusic()
  syncVolumePreference(value)
}

export function useWelcomeMusic() {
  return {
    audioSource,
    currentTrack,
    isPlaying,
    isMuted,
    isBlocked,
    hasCompletedOnce,
    loadError,
    volume,
    initializeWelcomeMusic,
    activateWelcomeMusicTrack,
    playWelcomeMusic,
    muteWelcomeMusic,
    unmuteWelcomeMusic,
    toggleWelcomeMusicMuted,
    setWelcomeMusicVolume,
  }
}
