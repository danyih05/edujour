import { describe, expect, it } from 'vitest'
import { LEVEL_DEFINITIONS, createInitialLevels, getLevelDefinition } from './levels'

describe('level definitions', () => {
  it('defines the configured gameplay years and level counts', () => {
    expect(Object.keys(LEVEL_DEFINITIONS)).toEqual(['y2', 'y3'])
    expect(LEVEL_DEFINITIONS.y2).toHaveLength(7)
    expect(LEVEL_DEFINITIONS.y3).toHaveLength(8)
  })

  it('unlocks only the first level when a year starts', () => {
    const levels = createInitialLevels('y2')

    expect(levels[0]).toMatchObject({
      id: 1,
      unlocked: true,
      completed: false,
      skipped: false,
    })
    expect(levels.slice(1).every((level) => !level.unlocked)).toBe(true)
  })

  it('copies onboarding metadata into the initial level state', () => {
    const [firstLevel] = createInitialLevels('y3')

    expect(firstLevel.onboarding).toEqual(
      expect.objectContaining({
        title: expect.objectContaining({
          en: 'Timeline Crucible Controls',
        }),
      }),
    )
  })

  it('finds a known level definition', () => {
    expect(getLevelDefinition('y3', 8)).toMatchObject({
      id: 8,
      mapNode: 8,
      file: 'year3_8.vue',
    })
  })

  it('returns empty values for unknown years or levels', () => {
    expect(createInitialLevels('missing')).toEqual([])
    expect(getLevelDefinition('y2', 99)).toBeNull()
  })
})
