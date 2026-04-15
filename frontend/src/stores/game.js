import { defineStore } from 'pinia'
import { createInitialLevels } from '@/config/levels'
import {
  completeLevel as completeLevelRequest,
  getApiErrorMessage,
  getInventory,
  getProgress,
  getShopItems,
  purchaseItem as purchaseItemRequest,
  resetProgress as resetProgressRequest,
  skipLevel as skipLevelRequest,
} from '@/services/backend'
import { useAuthStore } from '@/stores/auth'

const GAME_UI_STORAGE_KEY = 'gradquest-game-ui'

const createYearState = (year, coins) => ({
  coins,
  currentNode: 1,
  levels: createInitialLevels(year),
})

const createDefaultState = () => ({
  year: 'y2',
  hydrated: false,
  loading: false,
  loadedUserId: null,
  loadPromise: null,
  travelerProfile: null,
  shopItems: [],
  inventoryItems: [],
  y2: createYearState('y2', 0),
  y3: createYearState('y3', 0),
})

function mergeLevels(defaultLevels, remoteLevels) {
  if (!Array.isArray(remoteLevels)) return defaultLevels

  return defaultLevels.map((level, index) => {
    const remoteLevel = remoteLevels.find((item) => item.id === level.id)
    if (!remoteLevel) {
      return {
        ...level,
        unlocked: index === 0,
      }
    }

    return {
      ...level,
      unlocked: Boolean(remoteLevel.unlocked || remoteLevel.completed || remoteLevel.skipped || index === 0),
      completed: Boolean(remoteLevel.completed),
      skipped: Boolean(remoteLevel.skipped),
    }
  })
}

function deriveCurrentNode(levels) {
  const clearedLevels = levels.filter((level) => level.completed || level.skipped)
  if (clearedLevels.length > 0) {
    return clearedLevels.at(-1)?.id ?? 1
  }

  const firstAvailable = levels.find((level) => level.unlocked)
  return firstAvailable?.id ?? 1
}

function mergeTravelerProfile(nextProfile, fallbackProfile) {
  if (!nextProfile && !fallbackProfile) return null

  const merged = {
    ...(fallbackProfile || {}),
    ...(nextProfile || {}),
  }

  const fallbackAvatar = fallbackProfile?.avatar || {}
  const nextAvatar = nextProfile?.avatar || {}
  const presetKey =
    nextAvatar.presetKey ||
    nextProfile?.avatarPreset ||
    fallbackAvatar.presetKey ||
    fallbackProfile?.avatarPreset ||
    ''

  const hasAvatarData = Object.keys(fallbackAvatar).length > 0 || Object.keys(nextAvatar).length > 0 || Boolean(presetKey)

  if (hasAvatarData) {
    merged.avatar = {
      ...fallbackAvatar,
      ...nextAvatar,
    }

    if (presetKey) {
      merged.avatar.presetKey = merged.avatar.presetKey || presetKey
      merged.avatarPreset = merged.avatarPreset || presetKey
    }
  }

  return merged
}

export const useGameStore = defineStore('game', {
  state: () => createDefaultState(),
  getters: {
    currentState: (state) => state[state.year],
    currentLevels() {
      return this.currentState.levels
    },
    currentCoins() {
      return this.y2.coins
    },
    travelerAvatar(state) {
      const avatar = state.travelerProfile?.avatar || {}
      const presetKey = avatar.presetKey || state.travelerProfile?.avatarPreset || ''

      return {
        ...avatar,
        ...(presetKey ? { presetKey, avatarPreset: presetKey } : {}),
        hairColor: avatar.hairColor || '#3a2a25',
        outfitColor: avatar.outfitColor || '#ffd46d',
      }
    },
    travelerLook(state) {
      const mapAvatar = state.travelerProfile?.mapAvatar || {}

      return {
        hairColor: mapAvatar.hairColor || '#3a2a25',
        outfitColor: mapAvatar.outfitColor || '#ffd46d',
      }
    },
  },
  actions: {
    hydrate() {
      if (this.hydrated) return

      try {
        const saved = JSON.parse(localStorage.getItem(GAME_UI_STORAGE_KEY) || 'null')
        if (saved?.year === 'y2' || saved?.year === 'y3') {
          this.year = saved.year
        }
      } catch (error) {
        console.warn('Failed to hydrate GradQuest UI state.', error)
      } finally {
        this.hydrated = true
      }
    },

    persistUi() {
      try {
        localStorage.setItem(GAME_UI_STORAGE_KEY, JSON.stringify({ year: this.year }))
      } catch (error) {
        console.warn('Failed to persist GradQuest UI state.', error)
      }
    },

    async ensureLoaded() {
      this.hydrate()

      const authStore = useAuthStore()
      await authStore.hydrate()

      if (!authStore.isStudent) {
        this.clearState()
        return
      }

      if (this.loadedUserId === authStore.user.id && !this.loading) {
        return
      }

      if (this.loadPromise) {
        return this.loadPromise
      }

      this.loadPromise = this.loadStudentData(authStore.user.id)
      return this.loadPromise
    },

    async loadStudentData(userId) {
      this.loading = true
      try {
        const [progressPayload, shopPayload, inventoryPayload] = await Promise.all([
          getProgress(),
          getShopItems(),
          getInventory(),
        ])

        this.applyProgress(progressPayload)
        this.shopItems = shopPayload.items || []
        this.inventoryItems = inventoryPayload.items || []
        this.loadedUserId = userId
      } finally {
        this.loading = false
        this.loadPromise = null
        this.hydrated = true
      }
    },

    applyProgress(payload) {
      const user = payload?.user || {}
      const sharedCoins = Number(user.coins) || 0
      const authStore = useAuthStore()
      const fallbackProfile = this.travelerProfile || authStore.user?.travelerProfile || null

      this.travelerProfile = mergeTravelerProfile(user.travelerProfile || null, fallbackProfile)

      if (authStore.user) {
        authStore.user = {
          ...authStore.user,
          travelerProfile: this.travelerProfile,
        }
        authStore.persistSession()
      }

      ;['y2', 'y3'].forEach((year) => {
        const remoteYear = payload?.years?.[year] || {}
        const mergedLevels = mergeLevels(createInitialLevels(year), remoteYear.levels || [])
        this[year].coins = sharedCoins
        this[year].levels = mergedLevels
        this[year].currentNode = deriveCurrentNode(mergedLevels)
      })
    },

    async refreshCommerce() {
      const [shopPayload, inventoryPayload] = await Promise.all([
        getShopItems(),
        getInventory(),
      ])

      this.shopItems = shopPayload.items || []
      this.inventoryItems = inventoryPayload.items || []
    },

    getLevel(year, levelId) {
      return this[year]?.levels.find((level) => level.id === levelId) ?? null
    },

    isNodeAccessible(year, levelId) {
      const level = this.getLevel(year, levelId)
      return Boolean(level?.unlocked || level?.completed || level?.skipped)
    },

    switchYear(year) {
      if (year !== 'y2' && year !== 'y3') return
      this.year = year
      this.persistUi()
    },

    setCurrentNode(year, levelId) {
      if (!this.getLevel(year, levelId)) return
      this[year].currentNode = levelId
      this.persistUi()
    },

    async completeNode(year, levelId, options = {}) {
      try {
        const payload = await completeLevelRequest({
          year,
          levelId,
          rewardCoins: options.rewardCoins,
          profile: options.profile,
        })
        this.applyProgress(payload)
        return payload
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Failed to save progress.'))
      }
    },

    async skipLevel(levelId) {
      try {
        const payload = await skipLevelRequest({
          year: this.year,
          levelId,
        })
        this.applyProgress(payload)
        return payload
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Failed to skip level.'))
      }
    },

    async purchasePrize(prize) {
      try {
        const payload = await purchaseItemRequest({ itemId: prize.id })
        this.y2.coins = payload.coinsRemaining
        this.y3.coins = payload.coinsRemaining
        await this.refreshCommerce()
        return payload
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Failed to redeem reward.'))
      }
    },

    async resetStore() {
      try {
        const payload = await resetProgressRequest()
        this.applyProgress(payload)
        await this.refreshCommerce()
        this.year = 'y2'
        this.persistUi()
        return payload
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Failed to reset progress.'))
      }
    },

    clearState() {
      const defaults = createDefaultState()
      this.year = defaults.year
      this.loading = false
      this.loadedUserId = null
      this.loadPromise = null
      this.travelerProfile = defaults.travelerProfile
      this.shopItems = defaults.shopItems
      this.inventoryItems = defaults.inventoryItems
      this.y2 = defaults.y2
      this.y3 = defaults.y3
      this.hydrated = true

      try {
        localStorage.removeItem(GAME_UI_STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to clear GradQuest UI state.', error)
      }
    },
  },
})
