<template>
  <div class="dark-citadel-root">
    <div class="sky">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="{
          width: `${star.size}px`,
          height: `${star.size}px`,
          left: `${star.left}vw`,
          top: `${star.top}vh`,
          animationDelay: `${star.delay}s`,
        }"
      />
    </div>
    <div class="dusts">
      <div
        v-for="dust in dusts"
        :key="dust.id"
        class="dust"
        :style="{
          left: `${dust.left}vw`,
          top: `${dust.top}vh`,
          animationDuration: `${dust.duration}s`,
          animationDelay: `${dust.delay}s`,
        }"
      />
    </div>
    <div class="moon"></div>

    <div class="topbar">
      <div class="panel title-box">
        <div class="title">{{ t('pages.y3_6.title') }}</div>
        <div class="subtitle">{{ t('pages.y3_6.subtitle') }}</div>
      </div>
      <div class="panel status">
        <div class="stat"><div class="stat-label">{{ t('pages.y3_6.stats.gatesCleared') }}</div><div class="stat-value">{{ clearCountText }}</div></div>
        <div class="stat"><div class="stat-label">{{ t('pages.y3_6.stats.artifacts') }}</div><div class="stat-value">{{ gameState.gems }}</div></div>
        <div class="stat"><div class="stat-label">{{ t('pages.y3_6.stats.level') }}</div><div class="stat-value">{{ gameState.level }}</div></div>
        <div class="stat"><div class="stat-label">{{ t('pages.y3_6.stats.icedAmericanos') }}</div><div class="stat-value">{{ gameState.potions }}</div></div>
      </div>
    </div>

    <div class="scene">
      <div class="road"></div>
      <div class="castle-wrap">
        <div class="castle-glow"></div>
        <div class="wall side-tower left"></div><div class="wall side-tower right"></div>
        <div class="wall back-wall-left"></div><div class="wall back-wall-right"></div>
        <div class="wall center-keep"></div><div class="wall front-wall"></div>
        <div class="spire left"></div><div class="spire right"></div>
        <div class="spire mid-left small"></div><div class="spire mid-right small"></div><div class="spire center"></div>
        <div class="cap left"></div><div class="cap right"></div><div class="cap mid-left"></div><div class="cap mid-right"></div><div class="cap center"></div>
        <div class="flagpole left"></div><div class="flagpole right"></div><div class="flagpole center"></div>
        <div class="round-window" style="left:11%; bottom:55%;"></div><div class="window" style="left:11.5%; bottom:18%;"></div>
        <div class="round-window" style="left:48.7%; bottom:61%;"></div>
        <div class="round-window" style="right:11%; bottom:56%;"></div><div class="window" style="right:11.5%; bottom:18%;"></div>

        <div class="door final-door" :class="{ locked: !allClear, cleared: allClear }" @click="handleFinalDoor">
          <div class="status-tag">{{ allClear ? t('pages.y3_6.doors.finalUnlockedTag') : t('pages.y3_6.doors.finalLockedTag') }}</div>
          <div class="door-label">{{ t('pages.y3_6.doors.finalLabel') }}</div>
        </div>

        <div class="door-row">
          <div
            v-for="stage in localizedStages"
            :key="stage.id"
            class="door trial-door"
            :class="{ locked: isStageLocked(stage.id), cleared: gameState.cleared[stage.id] }"
            :data-level="stage.id"
            @click="openStage(stage.id)"
          >
            <div class="status-tag">{{ getDoorTag(stage.id) }}</div>
            <div class="door-label">{{ stage.doorLabel }}</div>
          </div>
        </div>
      </div>
      <div class="mist"></div><div class="ground"></div>
    </div>

    <div class="hint">{{ t('pages.y3_6.hint') }}</div>

    <div class="modal" :class="{ show: modalVisible }">
      <div ref="modalCard" class="modal-card" @scroll="updateScrollCue">
        <button class="close-btn" type="button" @click="closeModal">×</button>

        <template v-if="modalMode === 'intro' && currentStage">
          <div class="level-header">
            <div>
              <div class="level-title">{{ currentStage.title }}</div>
              <div class="level-desc">{{ currentStage.subtitle }}</div>
            </div>
          </div>
          <div class="battle-grid">
            <div class="box" style="text-align:center;">
              <div class="character-name">{{ t('pages.y3_6.intro.guardianBoss') }}: {{ currentStage.enemy.name }}</div>
              <div style="font-size:80px; margin:20px 0; filter:drop-shadow(0 0 15px #e74c3c);">{{ currentStage.enemy.icon }}</div>
              <div style="color:#ead7a7; font-weight:bold;">{{ t('pages.y3_6.intro.enemyStats', { hp: currentStage.enemy.hp, atk: currentStage.enemy.atk }) }}</div>
            </div>
            <div class="box">
              <div class="character-name">{{ t('pages.y3_6.intro.combatIntel') }}</div>
              <div class="info-list">
                <div v-for="item in currentStageIntel" :key="item" class="info-item" v-html="item"></div>
              </div>
              <div
                class="reward-box"
                :style="gameState.cleared[currentStage.id] ? 'border-color:#2ecc71;' : ''"
                v-html="introRewardHtml"
              ></div>
            </div>
          </div>
          <div class="center-actions"><button class="btn next" type="button" @click="initBattle">{{ t('pages.y3_6.intro.engage') }}</button></div>
        </template>

        <template v-else-if="modalMode === 'battle' && currentStage">
          <div class="roco-game-screen">
            <div class="roco-battle-scene">
              <div class="ground-ellipse ground-enemy"></div>
              <div class="ground-ellipse ground-hero"></div>

              <div class="hud hud-enemy">
                <div class="hud-name"><span>{{ enemyName }}</span> <span class="lvl">{{ battleLevelLabel(currentStage.id * 10 + 20) }}</span></div>
                <div class="hp-bar-bg"><div class="hp-bar-fill" :style="{ width: `${enemyHpPercent}%`, background: '#e53e3e' }"></div></div>
                <div class="hp-text"><span>{{ enemy.hp }}/{{ enemy.maxHp }}</span></div>
              </div>
              <div class="sprite sprite-enemy" :class="{ 'anim-enemy-attack': enemyAttack, 'anim-hit': enemyHit }" style="transform: scaleX(-1);">{{ enemyIcon }}</div>
              <div
                :key="enemyDamage.key"
                class="damage-text"
                :class="{ 'damage-anim': enemyDamage.visible }"
                :style="{ top: '100px', right: '28%', color: enemyDamage.color }"
              >{{ enemyDamage.text }}</div>

              <div class="hud hud-hero">
                <div class="hud-name"><span>{{ heroName }}</span> <span class="lvl">{{ battleLevelLabel(gameState.level * 10 + 10) }}</span></div>
                <div class="hp-bar-bg"><div class="hp-bar-fill" :style="{ width: `${heroHpPercent}%`, background: heroHpBarColor }"></div></div>
                <div class="hp-text"><span>{{ gameState.hero.hp }}/{{ gameState.hero.maxHp }}</span></div>
                <div class="shield-tag" :style="{ display: gameState.hero.shield ? 'block' : 'none' }">{{ t('pages.y3_6.battle.shieldActive') }}</div>
              </div>
              <div class="sprite sprite-hero" :class="{ 'anim-hero-attack': heroAttack, 'anim-hit': heroHit }">{{ gameState.hero.icon }}</div>
              <div
                :key="heroDamage.key"
                class="damage-text"
                :class="{ 'damage-anim': heroDamage.visible }"
                :style="{ bottom: '120px', left: '28%', color: heroDamage.color }"
              >{{ heroDamage.text }}</div>
            </div>

            <div class="ui-bottom">
              <div class="message-box">
                <template v-for="(line, index) in typedMessageLines" :key="`${index}-${line}`">
                  <br v-if="index > 0">
                  <span>{{ line }}</span>
                </template>
              </div>
              <div class="action-menu" :style="{ display: commandMenuVisible ? 'grid' : 'none' }">
                <button
                  v-for="skill in displaySkills"
                  :key="skill.id"
                  class="skill-btn"
                  type="button"
                  :disabled="skill.pp <= 0"
                  @click="useSkill(skill.id)"
                >
                  <div class="skill-name">{{ skill.name }}</div>
                  <div class="skill-type" :class="skill.cssType">{{ skill.cssLabel }}</div>
                  <div class="skill-pp">{{ t('pages.y3_6.battle.ppLabel', { current: skill.pp, max: skill.maxPp }) }}</div>
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="modalMode === 'victory' && currentStage">
          <div class="level-header"><div class="level-title">{{ t('pages.y3_6.settlement.monthConquered') }}</div></div>
          <div class="box" style="text-align:center; padding: 40px;">
            <div style="font-size: 80px; filter: drop-shadow(0 0 20px #2ecc71); margin-bottom: 20px;">✨</div>
            <div style="font-size: 1.2rem; margin-bottom: 20px;"><b>{{ currentStage.enemy.name }}</b> {{ t('pages.y3_6.settlement.monthConqueredDesc') }}</div>
            <div class="reward-box" style="border-color:#f1c40f;" v-html="victoryRewardHtml"></div>
            <div class="center-actions" style="margin-top:30px;">
              <button class="btn next" type="button" @click="closeModal">{{ t('pages.y3_6.settlement.returnToCitadel') }}</button>
              <button
                v-if="allClear"
                class="btn next"
                style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;"
                type="button"
                @click="openFinal"
              >
                {{ t('pages.y3_6.settlement.openSanctuary') }}
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="modalMode === 'defeat'">
          <div class="level-header"><div class="level-title" style="color:#e74c3c;">{{ t('pages.y3_6.settlement.applicationFoiled') }}</div></div>
          <div class="box" style="text-align:center; padding: 40px;">
            <div style="font-size: 80px; filter: grayscale(1); margin-bottom: 20px;">🥀</div>
            <div style="font-size: 1.2rem; margin-bottom: 20px;">{{ t('pages.y3_6.settlement.applicationFoiledDesc') }}</div>
            <div class="info-list" style="text-align:left;">
              <div class="info-item">{{ t('pages.y3_6.settlement.applicationFoiledHint') }}</div>
            </div>
            <div class="center-actions" style="margin-top:30px;">
              <button class="btn next" type="button" @click="openStage(currentStageId)">{{ t('pages.y3_6.settlement.resurrectAndRetaliate') }}</button>
              <button class="btn next" style="background: linear-gradient(135deg, #7f8c8d, #34495e); color:#fff;" type="button" @click="closeModal">{{ t('pages.y3_6.settlement.tacticalRetreat') }}</button>
            </div>
          </div>
        </template>

        <template v-else-if="modalMode === 'final'">
          <div class="final-reward-screen">
            <div class="level-title" style="background: linear-gradient(90deg, #fff, #f1c40f, #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: 'Georgia', serif;">{{ t('pages.y3_6.settlement.finalTitle') }}</div>
            <div class="big-gem">🎓</div>
            <div class="level-desc" style="max-width:800px; margin: 0 auto; font-size: 1.1rem; font-family: 'Georgia', serif;" v-html="t('pages.y3_6.settlement.finalDesc')"></div>
            <div class="box" style="margin-top:30px; max-width:500px; margin-left:auto; margin-right:auto; text-align:left;">
              <div class="character-name">{{ t('pages.y3_6.settlement.tallyTitle') }}</div>
              <div class="info-list">
                <div class="info-item">{{ t('pages.y3_6.settlement.artifactsCollected', { gems: gameState.gems }) }}</div>
                <div class="info-item">{{ t('pages.y3_6.settlement.finalPowerLevel', { level: gameState.level }) }}</div>
                <div class="info-item" v-html="t('pages.y3_6.settlement.honoraryTitle')"></div>
              </div>
            </div>
            <div class="center-actions" style="margin-top:30px;">
              <button class="btn next" type="button" @click="completeNode">{{ t('pages.y3_6.settlement.returnInGlory') }}</button>
            </div>
          </div>
        </template>
      </div>

      <button
        class="modal-scroll-cue"
        :class="{ show: scrollCueVisible }"
        type="button"
        :aria-label="t('pages.y3_6.aria.scrollDown')"
        @click="scrollModal"
      >
        ↓
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete'])
const { t, tm } = useAppI18n()

const BASE_STAGES = [
  { id: 0, gemReward: 1, enemy: { icon: '🐲', hp: 150, atk: 20 } },
  { id: 1, gemReward: 1, enemy: { icon: '🧟', hp: 200, atk: 30 } },
  { id: 2, gemReward: 1, enemy: { icon: '💀', hp: 280, atk: 45 } },
]

const BASE_SKILLS = [
  { id: 0, pp: 15, maxPp: 15, power: 30, class: 'attack', cssType: 'type-normal' },
  { id: 1, pp: 3, maxPp: 3, power: 80, class: 'heavy', cssType: 'type-fire' },
  { id: 2, pp: 5, maxPp: 5, power: 0, class: 'shield', cssType: 'type-magic' },
  { id: 3, pp: 4, maxPp: 4, power: -80, class: 'heal', cssType: 'type-heal' },
]

const gameState = reactive({
  gems: 0,
  cleared: [false, false, false],
  level: 1,
  potions: 4,
  inBattle: false,
  isAnimating: false,
  hero: { icon: '👨‍🎓', hp: 120, maxHp: 120, shield: false },
})

const enemy = reactive({ hp: 0, maxHp: 0, atk: 0 })
const heroSkillState = reactive(BASE_SKILLS.map((skill) => ({ ...skill })))
const currentStageId = ref(null)
const modalVisible = ref(false)
const modalMode = ref('intro')
const scrollCueVisible = ref(false)
const modalCard = ref(null)
const previousTitle = ref(typeof document !== 'undefined' ? document.title : '')

const heroAttack = ref(false)
const enemyAttack = ref(false)
const heroHit = ref(false)
const enemyHit = ref(false)
const heroDamage = reactive({ key: 0, text: '', color: '#ff4757', visible: false })
const enemyDamage = reactive({ key: 0, text: '', color: '#ff4757', visible: false })

const victoryRewardState = ref({ key: 'pages.y3_6.settlement.rewardReplay', params: {} })
const messageLineStates = ref([{ descriptor: { key: 'pages.y3_6.battle.preparing' }, length: 0 }])

let typeWriterRun = 0
let turnWatchdog = null
const timers = new Set()

const stars = Array.from({ length: 50 }, (_, index) => ({
  id: `star-${index}`,
  size: Math.random() * 3 + 1,
  left: Math.random() * 100,
  top: Math.random() * 78,
  delay: Math.random() * 4,
}))

const dusts = Array.from({ length: 10 }, (_, index) => ({
  id: `dust-${index}`,
  left: Math.random() * 100,
  top: 48 + Math.random() * 24,
  duration: 8 + Math.random() * 6,
  delay: Math.random() * 8,
}))

const localizedStageContent = computed(() => tm('pages.y3_6.stages') || [])
const localizedSkillContent = computed(() => tm('pages.y3_6.skills') || [])

const localizedStages = computed(() => BASE_STAGES.map((stage, index) => {
  const localized = localizedStageContent.value[index] || {}
  return {
    ...stage,
    month: localized.month || '',
    title: localized.title || '',
    subtitle: localized.subtitle || '',
    doorLabel: localized.doorLabel || '',
    intel: localized.intel || [],
    enemy: {
      ...stage.enemy,
      name: localized.enemyName || '',
    },
  }
}))

const currentStage = computed(() => (
  currentStageId.value === null ? null : localizedStages.value[currentStageId.value] || null
))

const displaySkills = computed(() => heroSkillState.map((skill, index) => {
  const localized = localizedSkillContent.value[index] || {}
  return {
    ...skill,
    name: localized.name || '',
    cssLabel: localized.cssLabel || '',
    log: localized.log || '',
  }
}))

const clearCountText = computed(() => `${gameState.cleared.filter(Boolean).length} / 3`)
const allClear = computed(() => gameState.cleared.every(Boolean))
const enemyName = computed(() => currentStage.value?.enemy.name || '')
const enemyIcon = computed(() => currentStage.value?.enemy.icon || '')
const heroName = computed(() => t('pages.y3_6.heroName'))
const currentStageIntel = computed(() => currentStage.value?.intel || [])
const introRewardHtml = computed(() => {
  if (!currentStage.value) return ''
  if (gameState.cleared[currentStage.value.id]) {
    return t('pages.y3_6.intro.repeatReward')
  }
  return t('pages.y3_6.intro.firstReward', { count: currentStage.value.gemReward })
})
const heroHpPercent = computed(() => Math.max(0, (gameState.hero.hp / gameState.hero.maxHp) * 100))
const enemyHpPercent = computed(() => Math.max(0, (enemy.hp / enemy.maxHp) * 100))
const heroHpBarColor = computed(() => (
  heroHpPercent.value > 50 ? 'linear-gradient(90deg, #4ed481, #2a9a57)' : heroHpPercent.value > 20 ? '#f1c40f' : '#e74c3c'
))
const victoryRewardHtml = computed(() => resolveDescriptor(victoryRewardState.value))
const typedMessageLines = computed(() => messageLineStates.value.map((line) => (
  stripHtml(resolveDescriptor(line.descriptor)).slice(0, line.length)
)))

function resolveDescriptor(descriptor) {
  if (!descriptor) return ''
  if (descriptor.key) return t(descriptor.key, descriptor.params || {})
  if (typeof descriptor.text === 'string') return descriptor.text
  return ''
}

function stripHtml(text) {
  return String(text).replace(/<\/?b>/g, '')
}

function setManagedTimeout(callback, delay) {
  const timer = window.setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
  return timer
}

function setInstantMessage(descriptor) {
  const text = stripHtml(resolveDescriptor(descriptor))
  messageLineStates.value = [{ descriptor, length: text.length }]
}

function battleLevelLabel(level) {
  return t('pages.y3_6.battle.levelCompact', { level })
}

function isStageLocked(idx) {
  return idx > 0 && !gameState.cleared[idx - 1]
}

function getDoorTag(idx) {
  if (gameState.cleared[idx]) return t('pages.y3_6.doors.slain')
  if (isStageLocked(idx)) return t('pages.y3_6.doors.sealed')
  return localizedStages.value[idx]?.month || ''
}

function syncPotionSkill() {
  heroSkillState[3].pp = gameState.potions
  heroSkillState[3].maxPp = gameState.potions
}

function cancelTypeWriter() {
  typeWriterRun += 1
}

function clearTurnWatchdog() {
  if (!turnWatchdog) return
  window.clearTimeout(turnWatchdog)
  turnWatchdog = null
}

function startTurnWatchdog() {
  clearTurnWatchdog()
  turnWatchdog = window.setTimeout(() => {
    if (!gameState.inBattle || !gameState.isAnimating || !enemyName.value) return
    if (gameState.hero.hp <= 0 || enemy.hp <= 0) return
    showCommandMenu()
  }, 12000)
}

function updateScrollCue() {
  if (!modalVisible.value || !modalCard.value) {
    scrollCueVisible.value = false
    return
  }
  const canScroll = modalCard.value.scrollHeight - modalCard.value.clientHeight > 14
  const atBottom = modalCard.value.scrollTop + modalCard.value.clientHeight >= modalCard.value.scrollHeight - 14
  scrollCueVisible.value = canScroll && !atBottom
}

function resetModalScroll() {
  nextTick(() => {
    if (modalCard.value) {
      modalCard.value.scrollTop = 0
    }
    window.requestAnimationFrame(updateScrollCue)
    setManagedTimeout(updateScrollCue, 120)
  })
}

function scrollModal() {
  if (!modalCard.value) return
  modalCard.value.scrollBy({ top: Math.round(modalCard.value.clientHeight * 0.75), behavior: 'smooth' })
  setManagedTimeout(updateScrollCue, 360)
}

function openStage(idx) {
  if (idx > 0 && !gameState.cleared[idx - 1]) return
  currentStageId.value = idx
  modalMode.value = 'intro'
  modalVisible.value = true
  resetModalScroll()
}

function renderRocoBattleUI() {
  modalMode.value = 'battle'
  setInstantMessage({ key: 'pages.y3_6.battle.preparing' })
  commandMenuVisible.value = false
  heroAttack.value = false
  enemyAttack.value = false
  heroHit.value = false
  enemyHit.value = false
  heroDamage.visible = false
  enemyDamage.visible = false
  resetModalScroll()
}

function initBattle() {
  if (!currentStage.value) return

  const lvlBonus = (gameState.level - 1) * 30
  gameState.hero.maxHp = 120 + lvlBonus
  gameState.hero.hp = gameState.hero.maxHp
  gameState.hero.shield = false
  heroSkillState.forEach((skill) => {
    if (skill.id !== 3) skill.pp = skill.maxPp
  })
  syncPotionSkill()

  enemy.hp = currentStage.value.enemy.hp
  enemy.maxHp = currentStage.value.enemy.hp
  enemy.atk = currentStage.value.enemy.atk

  gameState.inBattle = true
  gameState.isAnimating = true

  renderRocoBattleUI()

  setManagedTimeout(() => {
    typeWriter({ key: 'pages.y3_6.battle.wildAppears', params: { enemy: enemyName.value } }, () => {
      setManagedTimeout(() => {
        showCommandMenu()
      }, 800)
    })
  }, 500)
}

function typeWriter(descriptor, callback, clear = true) {
  const runId = ++typeWriterRun

  if (clear) {
    messageLineStates.value = [{ descriptor, length: 0 }]
  } else {
    messageLineStates.value = [...messageLineStates.value, { descriptor, length: 0 }]
  }

  const targetLine = messageLineStates.value.length - 1
  const speed = 30

  function type() {
    if (runId !== typeWriterRun) return
    const line = messageLineStates.value[targetLine]
    if (!line) return
    const fullText = stripHtml(resolveDescriptor(line.descriptor))
    if (line.length < fullText.length) {
      const nextLines = messageLineStates.value.slice()
      nextLines[targetLine] = { ...nextLines[targetLine], length: nextLines[targetLine].length + 1 }
      messageLineStates.value = nextLines
      setManagedTimeout(type, speed)
    } else if (callback && runId === typeWriterRun) {
      setManagedTimeout(() => {
        if (runId === typeWriterRun) callback()
      }, 500)
    }
  }

  type()
}

const commandMenuVisible = ref(false)

function showCommandMenu() {
  cancelTypeWriter()
  clearTurnWatchdog()
  setInstantMessage({ key: 'pages.y3_6.battle.awaitingCommand' })
  commandMenuVisible.value = true
  gameState.isAnimating = false
}

function holdCommandMenu() {
  gameState.isAnimating = true
  commandMenuVisible.value = false
  startTurnWatchdog()
}

async function popDamage(target, text, color) {
  const state = target === 'hero' ? heroDamage : enemyDamage
  state.text = text
  state.color = color
  state.visible = false
  state.key += 1
  await nextTick()
  state.visible = true
}

function useSkill(skillIdx) {
  if (!gameState.inBattle || gameState.isAnimating) return
  const skillState = heroSkillState[skillIdx]
  const skill = displaySkills.value[skillIdx]
  if (!skillState || !skill || skillState.pp <= 0) return

  holdCommandMenu()

  skillState.pp -= 1
  if (skillIdx === 3) {
    gameState.potions -= 1
    syncPotionSkill()
  }

  typeWriter({ key: 'pages.y3_6.battle.heroAction', params: { log: stripHtml(skill.log) } }, () => {
    if (skillState.class === 'attack' || skillState.class === 'heavy') {
      heroAttack.value = true
      setManagedTimeout(() => {
        const damage = skillState.power + Math.floor(Math.random() * 15) + (gameState.level - 1) * 10
        enemy.hp = Math.max(0, enemy.hp - damage)
        enemyHit.value = true
        popDamage('enemy', `-${damage}`, '#ff4757')

        setManagedTimeout(() => {
          heroAttack.value = false
          enemyHit.value = false
          checkWinOrNext()
        }, 400)
      }, 200)
    } else if (skillState.class === 'heal') {
      const heal = Math.abs(skillState.power) + (gameState.level * 15)
      gameState.hero.hp = Math.min(gameState.hero.maxHp, gameState.hero.hp + heal)
      popDamage('hero', `+${heal}`, '#48bb78')
      setManagedTimeout(() => checkWinOrNext(), 800)
    } else if (skillState.class === 'shield') {
      gameState.hero.shield = true
      setManagedTimeout(() => checkWinOrNext(), 800)
    } else {
      setManagedTimeout(() => checkWinOrNext(), 400)
    }
  })
}

function checkWinOrNext() {
  if (enemy.hp <= 0) {
    clearTurnWatchdog()
    typeWriter({ key: 'pages.y3_6.battle.enemyCrushed', params: { enemy: enemyName.value } }, () => {
      setManagedTimeout(() => winStage(), 1200)
    })
  } else {
    enemyTurn()
  }
}

function enemyTurn() {
  typeWriter({ key: 'pages.y3_6.battle.enemyCounterattack', params: { enemy: enemyName.value } }, () => {
    enemyAttack.value = true

    setManagedTimeout(() => {
      let damage = enemy.atk + Math.floor(Math.random() * 20)
      if (gameState.hero.shield) {
        damage = Math.floor(damage * 0.3)
        gameState.hero.shield = false
        typeWriter({ key: 'pages.y3_6.battle.shieldAbsorbed' }, null, false)
      }

      gameState.hero.hp = Math.max(0, gameState.hero.hp - damage)
      heroHit.value = true
      popDamage('hero', `-${damage}`, '#ff4757')

      setManagedTimeout(() => {
        enemyAttack.value = false
        heroHit.value = false

        if (gameState.hero.hp <= 0) {
          clearTurnWatchdog()
          typeWriter({ key: 'pages.y3_6.battle.heroCrushed' }, () => {
            setManagedTimeout(() => loseStage(), 1500)
          })
        } else {
          showCommandMenu()
        }
      }, 400)
    }, 200)
  })
}

function winStage() {
  if (!currentStage.value) return

  clearTurnWatchdog()
  cancelTypeWriter()
  gameState.inBattle = false
  gameState.isAnimating = false

  let rewardKey = 'pages.y3_6.settlement.rewardReplay'
  let rewardParams = {}

  if (!gameState.cleared[currentStage.value.id]) {
    gameState.cleared[currentStage.value.id] = true
    gameState.gems += currentStage.value.gemReward
    gameState.level += 1
    gameState.potions += 1
    syncPotionSkill()
    rewardKey = 'pages.y3_6.settlement.rewardFirst'
    rewardParams = { count: currentStage.value.gemReward, level: gameState.level }
  }

  victoryRewardState.value = { key: rewardKey, params: rewardParams }
  modalMode.value = 'victory'
  resetModalScroll()
}

function loseStage() {
  clearTurnWatchdog()
  cancelTypeWriter()
  gameState.inBattle = false
  gameState.isAnimating = false
  modalMode.value = 'defeat'
  resetModalScroll()
}

function openFinal() {
  modalMode.value = 'final'
  modalVisible.value = true
  resetModalScroll()
}

function completeNode() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'gradquest:node-complete',
      payload: { year: 'y3', nodeId: 6 },
    }, '*')
  }
  window.alert(t('pages.y3_6.alerts.returnToMap'))
  emit('complete', { year: 'y3', nodeId: 6 })
}

function handleFinalDoor() {
  if (allClear.value) {
    openFinal()
  } else {
    window.alert(t('pages.y3_6.alerts.sanctuarySealed'))
  }
}

function closeModal() {
  if (gameState.inBattle && !window.confirm(t('pages.y3_6.battle.confirmFlee'))) return
  cancelTypeWriter()
  clearTurnWatchdog()
  modalVisible.value = false
  gameState.inBattle = false
  updateScrollCue()
}

watch([modalVisible, modalMode], () => {
  resetModalScroll()
})

watchEffect(() => {
  document.title = t('pages.y3_6.documentTitle')
})

onMounted(() => {
  syncPotionSkill()
  setInstantMessage({ key: 'pages.y3_6.battle.preparing' })
  window.addEventListener('resize', updateScrollCue)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScrollCue)
  cancelTypeWriter()
  clearTurnWatchdog()
  timers.forEach((timer) => window.clearTimeout(timer))
  timers.clear()
  if (previousTitle.value) {
    document.title = previousTitle.value
  }
})
</script>

<style scoped>
.dark-citadel-root,
.dark-citadel-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  user-select: none;
}

.dark-citadel-root {
  --fire1: #fff0bf;
  --fire2: #efc268;
  --fire3: #d88435;
  position: relative;
  overflow: hidden;
  color: #fff;
  min-height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background:
    radial-gradient(circle at 78% 15%, rgba(220, 230, 255, .12), transparent 18%),
    radial-gradient(circle at 16% 18%, rgba(255, 255, 255, .04), transparent 12%),
    linear-gradient(to bottom, #03050b 0%, #07101d 26%, #0c1730 58%, #132443 100%);
}

.sky,
.dusts {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, .65);
  animation: twinkle 3.2s infinite ease-in-out;
}

.dust {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, .8), rgba(180, 195, 255, .35), transparent 75%);
  animation: drift 12s linear infinite;
  opacity: .55;
}

.moon {
  position: absolute;
  right: 7%;
  top: 6%;
  width: 175px;
  height: 175px;
  border-radius: 50%;
  z-index: 2;
  background: radial-gradient(circle, #f8fbff 0%, #dfe8ff 55%, #c6d0e8 82%, rgba(255, 255, 255, .04) 100%);
  box-shadow: 0 0 36px rgba(218, 228, 255, .55), 0 0 120px rgba(170, 190, 240, .24);
}

.moon::after {
  content: '';
  position: absolute;
  right: 18px;
  top: 20px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(180, 192, 220, .14);
}

.topbar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: min(1280px, calc(100% - 32px));
  display: flex;
  gap: 14px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  z-index: 40;
}

.panel {
  backdrop-filter: blur(14px);
  background: linear-gradient(180deg, rgba(255, 255, 255, .10), rgba(255, 255, 255, .04));
  border: 1px solid rgba(255, 255, 255, .13);
  border-radius: 20px;
  box-shadow: 0 0 24px rgba(0, 0, 0, .25), inset 0 0 18px rgba(255, 255, 255, .02);
  padding: 16px 22px;
}

.title-box {
  min-width: 520px;
}

.title {
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, #fff, #f0deb0, #dfe8ff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  font-family: Georgia, serif;
}

.subtitle {
  margin-top: 8px;
  color: #e8edff;
  line-height: 1.65;
  font-size: 14px;
  opacity: .96;
  font-family: Georgia, serif;
}

.status {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat {
  min-width: 100px;
  text-align: center;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .10);
}

.stat-label {
  font-size: 12px;
  color: #dbe5ff;
  font-weight: bold;
}

.stat-value {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 900;
  color: #ecd9a7;
}

.scene {
  position: relative;
  width: 100%;
  min-height: 640px;
  height: clamp(640px, calc(100vh - 220px), 860px);
  overflow: hidden;
}

.ground {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 19vh;
  background: linear-gradient(to top, #0f1a12, #17251b 40%, transparent);
  z-index: 3;
}

.mist {
  position: absolute;
  left: 0;
  bottom: 8vh;
  width: 100%;
  height: 12vh;
  background: linear-gradient(to right, rgba(255,255,255,.03), rgba(220,228,255,.11), rgba(255,255,255,.03));
  filter: blur(18px);
  z-index: 4;
}

.road {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 30vw;
  min-width: 320px;
  height: 18vh;
  background: linear-gradient(to top, rgba(122,129,141,.46), rgba(255,255,255,.10), transparent);
  clip-path: polygon(40% 100%, 60% 100%, 74% 0, 26% 0);
  z-index: 4;
}

.castle-wrap { position: absolute; left: 50%; bottom: 8vh; transform: translateX(-50%); width: min(1200px, calc(100% - 32px)); height: 70vh; z-index: 10; }
.castle-glow { position: absolute; left: 50%; bottom: 8%; transform: translateX(-50%); width: 78%; height: 56%; border-radius: 50%; background: radial-gradient(circle, rgba(170,185,230,.12), rgba(240,200,120,.05), transparent 72%); filter: blur(30px); z-index: 0; }
.wall { position: absolute; border: 4px solid rgba(195,204,222,.95); box-shadow: inset 0 0 18px rgba(255,255,255,.05), 0 0 20px rgba(0,0,0,.18); background: linear-gradient(to bottom, #959daa 0%, #737c89 18%, #535d69 52%, #36404b 78%, #232a33 100%); }
.back-wall-left, .back-wall-right { bottom: 0; width: 17%; height: 48%; z-index: 5; border-radius: 4px; }
.back-wall-left { left: 18%; } .back-wall-right { right: 18%; }
.front-wall { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 52%; height: 30%; z-index: 8; border-radius: 4px; }
.center-keep { position: absolute; left: 50%; bottom: 24%; transform: translateX(-50%); width: 16%; height: 62%; z-index: 7; border-radius: 4px; }
.side-tower { position: absolute; bottom: 0; width: 18%; height: 74%; z-index: 4; border-radius: 4px; }
.side-tower.left { left: 4%; } .side-tower.right { right: 4%; }
.side-tower::before, .back-wall-left::before, .back-wall-right::before, .front-wall::before, .center-keep::before {
  content: ""; position: absolute; left: -4px; top: -22px; width: calc(100% + 8px); height: 22px;
  background: linear-gradient(135deg, transparent 10px, rgba(170,179,194,.96) 0) top left, linear-gradient(225deg, transparent 10px, rgba(170,179,194,.96) 0) top right, linear-gradient(315deg, transparent 10px, rgba(170,179,194,.96) 0) bottom right, linear-gradient(45deg, transparent 10px, rgba(170,179,194,.96) 0) bottom left;
  background-size: 50% 50%; background-repeat: no-repeat;
}
.spire { position: absolute; width: 0; height: 0; border-left: 44px solid transparent; border-right: 44px solid transparent; border-bottom: 120px solid #262b38; z-index: 9; filter: drop-shadow(0 0 10px rgba(0,0,0,.35)); }
.spire.small { border-left-width: 34px; border-right-width: 34px; border-bottom-width: 96px; }
.spire.left { left: 7.8%; bottom: 77%; } .spire.right { right: 7.8%; bottom: 77%; } .spire.mid-left { left: 25.6%; bottom: 51%; } .spire.mid-right { right: 25.6%; bottom: 51%; } .spire.center { left: 50%; bottom: 88%; transform: translateX(-50%); }
.cap { position: absolute; width: 12px; height: 28px; border-radius: 6px 6px 0 0; background: linear-gradient(to bottom, #efddaa, #c79d52); z-index: 10; box-shadow: 0 0 12px rgba(239,221,170,.24); }
.cap.left { left: 11.1%; bottom: 95.3%; } .cap.right { right: 11.1%; bottom: 95.3%; } .cap.mid-left { left: 28.1%; bottom: 63%; } .cap.mid-right { right: 28.1%; bottom: 63%; } .cap.center { left: 50%; bottom: 108%; transform: translateX(-50%); }
.flagpole { position: absolute; width: 3px; height: 86px; background: rgba(230,235,245,.95); z-index: 10; }
.flagpole::after { content: ""; position: absolute; left: 3px; top: 10px; width: 34px; height: 16px; background: linear-gradient(90deg, #6c1c29, #972b39); clip-path: polygon(0 0, 100% 18%, 82% 50%, 100% 82%, 0 100%); animation: wave 2.2s infinite ease-in-out; }
.flagpole.left { left: 11.2%; bottom: 79%; } .flagpole.right { right: 11.2%; bottom: 79%; } .flagpole.center { left: 50%; bottom: 90%; transform: translateX(-50%); }
.window { position: absolute; width: 24px; height: 74px; border-radius: 14px 14px 4px 4px; background: linear-gradient(to bottom, var(--fire1), var(--fire2) 42%, var(--fire3) 100%); border: 2px solid rgba(235,220,175,.9); box-shadow: 0 0 18px rgba(240,194,104,.34); z-index: 9; }
.round-window { position: absolute; width: 54px; height: 54px; border-radius: 50%; background: radial-gradient(circle, #fff, #f1ddb0, #d08d44); border: 2px solid rgba(235,220,175,.9); box-shadow: 0 0 14px rgba(240,194,104,.28); z-index: 9; }

.door-row { position: absolute; left: 50%; bottom: 0.5%; transform: translateX(-50%); width: 62%; display: flex; justify-content: center; gap: 24px; align-items: end; z-index: 12; pointer-events: none; }
.door { position: relative; pointer-events: auto; cursor: pointer; display: flex; align-items: end; justify-content: center; text-align: center; padding: 10px; color: #f5f1e6; font-size: 14px; font-weight: 800; border: 4px solid rgba(215,191,133,.92); box-shadow: 0 0 20px rgba(0,0,0,.25), inset 0 0 14px rgba(255,255,255,.04); transition: transform .22s ease, filter .22s ease, box-shadow .22s ease; overflow: hidden; background: linear-gradient(to bottom, rgba(255,255,255,.08), rgba(255,255,255,.02)), linear-gradient(to bottom, #5d4832, #382b1d 46%, #181109 100%); }
.door::before { content: ""; position: absolute; inset: 4px; border-radius: inherit; background: linear-gradient(to bottom, rgba(255,255,255,.10), rgba(255,255,255,.02)), repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 2px, transparent 2px 18px); pointer-events: none; }
.door::after { content: ""; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle, #fff5d4, #d5a64d); box-shadow: 0 0 10px rgba(213,166,77,.6); }
.door:hover { transform: translateY(-6px) scale(1.03); filter: brightness(1.05); box-shadow: 0 0 28px rgba(0,0,0,.3), 0 0 16px rgba(235,220,175,.10), inset 0 0 14px rgba(255,255,255,.05); }
.door-label { width: 100%; padding: 4px 6px; line-height: 1.2; border-radius: 10px; background: rgba(8, 12, 22, .42); border: 1px solid rgba(255,255,255,.08); position: relative; z-index: 2; font-size: 11px; text-align: center; }
.status-tag { position: absolute; top: 7px; right: 7px; font-size: 11px; padding: 3px 8px; border-radius: 999px; background: rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,.12); z-index: 2; font-weight: bold; }
.door.locked { filter: grayscale(.2) brightness(.82); pointer-events: none; }
.door.cleared .status-tag { background: rgba(50,120,76,.8); color: #e2ffe9; border-color: #2ecc71;}

.trial-door { width: 15%; height: 110px; border-radius: 28px 28px 10px 10px; }
.final-door { position: absolute; left: 50%; bottom: 32%; transform: translateX(-50%); width: 16%; height: 128px; border-radius: 24px 24px 10px 10px; z-index: 11; background: linear-gradient(to bottom, rgba(255,255,255,.10), rgba(255,255,255,.03)), linear-gradient(to bottom, #6b573b, #45331f 44%, #1c140c 100%); box-shadow: 0 0 20px rgba(0,0,0,.28), 0 0 18px rgba(235,220,175,.10), inset 0 0 14px rgba(255,255,255,.05); }
.final-door:hover { transform: translateX(-50%) translateY(-6px) scale(1.03); }

.hint { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 25; width: min(820px, calc(100% - 24px)); background: rgba(8, 12, 24, .82); border: 1px solid rgba(255,255,255,.10); padding: 8px 18px; border-radius: 999px; color: #e8edff; text-align: center; backdrop-filter: blur(10px); box-shadow: 0 0 14px rgba(0,0,0,.18); font-weight: bold; font-size: 0.9rem; line-height: 1.28; pointer-events: none;}

.modal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(5, 7, 14, .84); z-index: 60; padding: 18px; }
.modal.show { display: flex; }
.modal-card { position: relative; width: min(1120px, 96vw); max-height: 92vh; overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; border-radius: 22px; padding: 24px; background: linear-gradient(180deg, rgba(17,22,38,.98), rgba(10,14,24,.98)), radial-gradient(circle at top right, rgba(255,255,255,.06), transparent 30%); border: 1px solid rgba(255,255,255,.12); box-shadow: 0 0 38px rgba(0,0,0,.3); }
.modal-scroll-cue { position: fixed; right: 34px; bottom: 34px; width: 48px; height: 48px; border-radius: 50%; border: 2px solid rgba(255,255,255,.72); background: rgba(8, 12, 24, .86); color: #fff; font-size: 28px; line-height: 1; cursor: pointer; z-index: 130; display: none; box-shadow: 0 8px 20px rgba(0,0,0,.36); }
.modal-scroll-cue.show { display: grid; place-items: center; }
.modal-scroll-cue:hover { background: rgba(232,210,155,.95); color: #1a202c; }
.close-btn { position: absolute; top: 12px; right: 12px; width: 42px; height: 42px; border-radius: 50%; border: none; background: rgba(255,255,255,.08); color: #fff; font-size: 22px; cursor: pointer; z-index: 100; font-weight: bold;}
.close-btn:hover { background: #e74c3c; }

.level-header { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.level-title { font-size: 26px; font-weight: 900; color: #ead7a7; font-family: "Georgia", serif;}
.level-desc { margin-top: 8px; color: #e4eaff; line-height: 1.7; font-size: 15px; max-width: 760px; font-family: "Georgia", serif;}
.battle-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 18px; margin-top: 18px; }
.box { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.10); border-radius: 18px; padding: 18px; }
.character-name { font-size: 20px; font-weight: 900; margin-bottom: 10px; color: #f9d976; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 8px;}
.info-list { margin-top: 14px; display: grid; gap: 10px; }
.info-item { padding: 12px 14px; border-radius: 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); color: #edf1ff; line-height: 1.6; font-size: 0.95rem;}
.reward-box { margin-top: 16px; padding: 16px; border-radius: 18px; background: linear-gradient(135deg, rgba(232,210,155,.10), rgba(255,255,255,.04)); border: 1px solid rgba(232,210,155,.22); color: #f1e3be; }
.center-actions { display: flex; justify-content: center; gap: 15px; margin-top: 16px; }
.btn.next { background: linear-gradient(135deg, #e8d29b, #ba944e); color: #2c2110; font-weight: bold; font-size: 1.1rem; padding: 12px 30px; border: none; border-radius: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.3);}
.btn.next:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.5); filter: brightness(1.1);}

.roco-game-screen {
  width: 100%; max-width: min(1040px, 100%); height: clamp(540px, calc(100dvh - 120px), 660px); background: #000;
  border: 4px solid rgba(255,255,255,0.1); border-radius: 15px; position: relative;
  box-shadow: 0 0 30px rgba(0,0,0,0.6); overflow: hidden;
  display: flex; flex-direction: column; margin: 0 auto;
}

.roco-battle-scene {
  flex: 1; position: relative;
  background: linear-gradient(to bottom, #1a2a6c, #112 60%, #2c3e50);
  overflow: hidden;
}

.ground-ellipse {
  position: absolute; border-radius: 50%; background: rgba(0,0,0,0.4);
  box-shadow: 0 0 20px rgba(0,0,0,0.6);
}
.ground-hero { bottom: 20px; left: 15%; width: 250px; height: 60px; }
.ground-enemy { top: 120px; right: 15%; width: 250px; height: 60px; }

.sprite {
  position: absolute; font-size: 110px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5));
  transition: transform 0.3s;
}
.sprite-hero { bottom: 40px; left: 20%; z-index: 10; }
.sprite-enemy { top: 70px; right: 20%; z-index: 5; }

.anim-hero-attack { animation: heroRush 0.6s ease-in-out; }
@keyframes heroRush {
  0% { transform: translate(0, 0); }
  40% { transform: translate(400px, -100px) scale(1.2); filter: drop-shadow(0 0 20px #e74c3c); }
  60% { transform: translate(400px, -100px) scale(1.2); filter: drop-shadow(0 0 20px #e74c3c); }
  100% { transform: translate(0, 0); }
}
.anim-enemy-attack { animation: enemyRush 0.6s ease-in-out; }
@keyframes enemyRush {
  0% { transform: translate(0, 0) scaleX(-1); }
  40% { transform: translate(-400px, 100px) scale(1.2) scaleX(-1); filter: drop-shadow(0 0 20px #e74c3c); }
  60% { transform: translate(-400px, 100px) scale(1.2) scaleX(-1); filter: drop-shadow(0 0 20px #e74c3c); }
  100% { transform: translate(0, 0) scaleX(-1); }
}
.anim-hit { animation: takeDamage 0.5s; }
@keyframes takeDamage {
  0%, 100% { filter: brightness(1) drop-shadow(0 10px 10px rgba(0,0,0,0.5)); transform: translateX(0); }
  20%, 60% { filter: brightness(2) drop-shadow(0 0 20px rgba(231,76,60,1)); transform: translateX(-15px); }
  40%, 80% { filter: brightness(2) drop-shadow(0 0 20px rgba(231,76,60,1)); transform: translateX(15px); }
}

.damage-text {
  position: absolute; font-size: 40px; font-weight: 900; color: #ff3333;
  text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff;
  z-index: 20; opacity: 0; pointer-events: none;
}
.damage-anim { animation: floatUp 1s ease-out forwards; }
@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0) scale(0.5); }
  20% { transform: translateY(-30px) scale(1.2); }
  100% { opacity: 0; transform: translateY(-80px) scale(1); }
}

.hud {
  position: absolute; background: rgba(255,255,255,0.95); color: #2d3748;
  border: 4px solid #cbd5e0; border-radius: 12px; padding: 12px 18px; width: 300px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5); z-index: 15;
}
.hud-enemy { top: 25px; left: 25px; }
.hud-hero { bottom: 35px; right: 25px; }
.hud-name { font-weight: 900; font-size: 1.15rem; margin-bottom: 8px; display: flex; justify-content: space-between;}
.hud-name span.lvl { font-weight: bold; font-size: 1rem; color: #d69e2e; }
.hp-bar-bg { width: 100%; height: 14px; background: #a0aec0; border-radius: 7px; overflow: hidden; border: 1px solid #718096;}
.hp-bar-fill { height: 100%; transition: width 0.5s ease-out, background-color 0.3s; }
.hp-text { text-align: right; font-size: 0.9rem; font-weight: bold; margin-top: 4px; }
.shield-tag { color: #3182ce; font-size: 0.85rem; font-weight: bold; margin-top: 4px; display: none; }

.ui-bottom {
  min-height: 146px; flex: 0 0 146px; background: linear-gradient(to bottom, #2d3748, #1a202c);
  border-top: 4px solid #f6e05e; display: flex; align-items: stretch;
}
.message-box {
  flex: 1; min-width: 0; padding: 12px 18px; font-size: 1rem; line-height: 1.35; font-weight: bold;
  color: #fff; border-right: 4px solid #4a5568; display: flex; align-items: center; text-shadow: 0 2px 4px rgba(0,0,0,0.5); font-family: "Georgia", serif;
}
.action-menu {
  width: 500px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(56px, 1fr));
  padding: 10px; gap: 10px; display: none; align-content: center;
}
.skill-btn {
  background: linear-gradient(to bottom, #fffaf0, #e2e8f0); border: 3px solid #a0aec0;
  min-height: 56px; padding: 5px 8px; border-radius: 10px; cursor: pointer; display: flex; flex-direction: column;
  justify-content: center; align-items: center; transition: 0.15s;
}
.skill-btn:hover { background: #fefcbf; border-color: #d69e2e; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
.skill-btn:active { transform: scale(0.95); }
.skill-btn:disabled { filter: grayscale(1); opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none;}
.skill-name { font-weight: 900; font-size: 0.92rem; color: #2d3748; line-height: 1.08; text-align: center; }
.skill-pp { font-size: 0.72rem; color: #718096; font-weight: bold; margin-top: 2px; }
.skill-type { font-size: 0.66rem; padding: 1px 6px; border-radius: 4px; color: #fff; margin-top: 2px; font-weight: bold;}
.type-normal { background: #a0aec0; } .type-fire { background: #e53e3e; } .type-magic { background: #805ad5; } .type-heal { background: #38b2ac; }

.final-reward-screen { text-align: center; padding: 18px 8px 8px; }
.big-gem { font-size: 124px; filter: drop-shadow(0 0 24px rgba(232,210,155,.5)); margin: 16px 0; }

@keyframes twinkle { 0%,100% { opacity: .22; transform: scale(1); } 50% { opacity: .9; transform: scale(1.5); } }
@keyframes drift { 0% { transform: translate(0,0) scale(.8); opacity: 0; } 15% { opacity: .55; } 100% { transform: translate(70px,-180px) scale(1.25); opacity: 0; } }
@keyframes wave { 0%,100% { transform: skewY(0deg); } 50% { transform: skewY(7deg); } }

@media (max-width: 1100px) {
  .title-box {
    min-width: 0;
    width: 100%;
  }

  .topbar {
    width: min(95vw, 1080px);
  }

  .battle-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .topbar {
    top: 10px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .status {
    width: 100%;
  }

  .stat {
    flex: 1 1 calc(50% - 12px);
  }

  .door-row {
    width: 80%;
    gap: 12px;
  }

  .trial-door,
  .final-door {
    width: 28%;
    min-width: 92px;
  }

  .final-door {
    width: 24%;
  }

  .modal-card {
    padding: 18px;
  }

  .roco-game-screen {
    height: auto;
    min-height: 620px;
  }

  .ui-bottom {
    height: auto;
    flex-direction: column;
  }

  .message-box {
    min-height: 92px;
    border-right: none;
    border-bottom: 4px solid #4a5568;
  }

  .action-menu {
    width: 100%;
  }
}
</style>
