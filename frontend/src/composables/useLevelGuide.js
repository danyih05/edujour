import { getLevelDefinition } from '@/config/levels'

export function useLevelGuide(year, levelId) {
  const definition = getLevelDefinition(year, levelId) || {}

  return {
    definition,
    guide: definition.guide || null,
    rewardCoins: Number(definition.rewardCoins) || 0,
  }
}
