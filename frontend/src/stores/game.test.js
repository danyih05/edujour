import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from './game'

describe('game store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts on year 2 with only the first node unlocked', () => {
    const store = useGameStore()

    expect(store.year).toBe('y2')
    expect(store.y2.levels[0]).toMatchObject({
      id: 1,
      unlocked: true,
      completed: false,
    })
    expect(store.y2.levels[1].unlocked).toBe(false)
  })

  it('saves completed level results locally and unlocks the next node', () => {
    const store = useGameStore()

    store.saveLevelResult('y2', 1, {
      resultData: { score: 100 },
      language: 'en',
    })

    expect(store.isLevelCompleted('y2', 1)).toBe(true)
    expect(store.getLevel('y2', 2).unlocked).toBe(true)

    const savedResults = JSON.parse(localStorage.getItem('gradquest-game-results'))
    expect(savedResults.year2_1).toMatchObject({
      completed: true,
      passed: true,
      language: 'en',
      resultData: { score: 100 },
    })
  })

  it('hydrates saved UI year and local game results', () => {
    localStorage.setItem('gradquest-game-ui', JSON.stringify({ year: 'y3' }))
    localStorage.setItem('gradquest-game-results', JSON.stringify({
      year3_1: {
        completed: true,
        passed: true,
      },
    }))

    const store = useGameStore()
    store.hydrate()

    expect(store.year).toBe('y3')
    expect(store.isLevelCompleted('y3', 1)).toBe(true)
    expect(store.getLevel('y3', 2).unlocked).toBe(true)
  })

  it('applies remote progress while keeping shared coins in sync', () => {
    const store = useGameStore()

    store.applyProgress({
      user: {
        coins: 80,
        travelerProfile: {
          avatarPreset: 'north-star',
        },
      },
      years: {
        y2: {
          levels: [
            { id: 1, completed: true, skipped: false, unlocked: true },
          ],
        },
      },
    })

    expect(store.y2.coins).toBe(80)
    expect(store.y3.coins).toBe(80)
    expect(store.getLevel('y2', 1).completed).toBe(true)
    expect(store.getLevel('y2', 2).unlocked).toBe(true)
    expect(store.travelerAvatar.presetKey).toBe('north-star')
  })
})
