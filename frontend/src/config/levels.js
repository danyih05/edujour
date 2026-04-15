const levelDefinitions = {
  y2: [
    { id: 1, mapNode: 1, i18nKey: 'levels.y2.1', file: 'year2_1.vue' },
    { id: 2, mapNode: 2, i18nKey: 'levels.y2.2', file: 'year2_2.vue' },
    { id: 3, mapNode: 3, i18nKey: 'levels.y2.3', file: 'year2_3.vue' },
    { id: 4, mapNode: 4, i18nKey: 'levels.y2.4', file: 'year2_4.vue' },
    { id: 5, mapNode: 5, i18nKey: 'levels.y2.5', file: 'year2_5.vue' },
    { id: 6, mapNode: 6, i18nKey: 'levels.y2.6', file: 'year2_6.vue' },
    { id: 7, mapNode: 7, i18nKey: 'levels.y2.7', file: 'year2_7.vue' },
  ],
  y3: [
    { id: 1, mapNode: 1, i18nKey: 'levels.y3.1', file: 'year3_1.vue' },
    { id: 2, mapNode: 2, i18nKey: 'levels.y3.2', file: 'year3_2.vue' },
    { id: 3, mapNode: 3, i18nKey: 'levels.y3.3', file: 'year3_3.vue' },
    { id: 4, mapNode: 4, i18nKey: 'levels.y3.4', file: 'year3_4.vue' },
    { id: 5, mapNode: 5, i18nKey: 'levels.y3.5', file: 'year3_5.vue' },
    { id: 6, mapNode: 6, i18nKey: 'levels.y3.6', file: 'year3_6.vue' },
    { id: 7, mapNode: 7, i18nKey: 'levels.y3.7', file: 'year3_7.vue' },
    { id: 8, mapNode: 8, i18nKey: 'levels.y3.8', file: 'year3_8.vue' },
  ],
}

export const LEVEL_DEFINITIONS = levelDefinitions

export const createInitialLevels = (year) => (
  (levelDefinitions[year] || []).map((level, index) => ({
    ...level,
    unlocked: index === 0,
    completed: false,
    skipped: false,
  }))
)

export const getLevelDefinition = (year, levelId) => (
  levelDefinitions[year]?.find((level) => level.id === levelId) ?? null
)
