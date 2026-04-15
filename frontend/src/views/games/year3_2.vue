<template>
  <div class="bureau-game">
    <button class="close-btn" type="button" :aria-label="t('pages.y3_2.back')" @click="$emit('close')">
      x
    </button>

    <section class="bureau-room">
      <p class="eyebrow">{{ t('pages.y3_2.eyebrow') }}</p>
      <h1>{{ t('pages.y3_2.title') }}</h1>
      <p class="intro">{{ t('pages.y3_2.intro') }}</p>

      <div class="progress-line">
        <span>{{ t('pages.y3_2.fragmentCounter', { current: currentIndex + 1, total: fragments.length }) }}</span>
        <div class="meter"><i :style="{ width: progressPercent + '%' }"></i></div>
      </div>

      <div class="parchment-stage">
        <div
          class="artifact-board"
          :class="[
            boardTone,
            {
              animating: isBoardAnimating,
              'seal-landed': stampState.visible,
            },
          ]"
          :style="boardMotionStyle"
        >
          <div v-if="currentFragment" class="parchment-wrap">
            <article
              class="parchment"
              :class="{
                success: feedback.visible && feedback.type === 'success',
                error: feedback.visible && feedback.type === 'error',
              }"
            >
              <div class="paper-pin" aria-hidden="true"></div>
              <div class="paper-shimmer" aria-hidden="true"></div>

              <Transition name="seal-pop">
                <div
                  v-if="stampState.visible"
                  :key="stampState.serial"
                  class="seal-mark"
                  :class="stampState.type"
                >
                  <span class="seal-label">{{ stampState.label }}</span>
                </div>
              </Transition>

              <p class="fragment-text">"{{ currentFragment.text }}"</p>
            </article>
          </div>

          <Transition name="feedback-rise">
            <div
              v-if="feedback.visible"
              class="feedback-card"
              :class="feedback.type"
              aria-live="polite"
            >
              <strong>{{ feedback.title }}</strong>
              <p>{{ feedback.message }}</p>
            </div>
          </Transition>
        </div>
      </div>

      <div class="stamp-grid">
        <button
          v-for="(option, index) in stampOptions"
          :key="option.id"
          class="stamp-btn"
          :class="[
            option.id,
            {
              active: activeStampTarget === option.id,
            },
          ]"
          :style="{ '--float-delay': `${index * 0.14}s` }"
          type="button"
          :disabled="isResolving"
          @click="stamp(option.id)"
        >
          <span class="stamp-halo" aria-hidden="true"></span>
          <div class="stamp-btn-top">
            <div class="stamp-code">
              <b>{{ option.id.toUpperCase() }}</b>
              <span class="stamp-illustration" aria-hidden="true">
                <i :class="option.iconClass"></i>
              </span>
            </div>
            <span class="stamp-ribbon">{{ option.ribbon }}</span>
          </div>

          <small>{{ option.hint }}</small>

          <div class="stamp-tags" aria-hidden="true">
            <span v-for="chip in option.chips" :key="`${option.id}-${chip}`">{{ chip }}</span>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const STAMP_META = {
  cv: {
    iconClass: 'fas fa-file-lines',
  },
  ps: {
    iconClass: 'fas fa-pen-nib',
  },
  rl: {
    iconClass: 'fas fa-user-tie',
  },
}

const targetByIndex = ['cv', 'ps', 'rl', 'cv', 'ps', 'rl']
const originalTargetPattern = targetByIndex.join('|')

function shuffleArray(items) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function hasSimpleCycle(sequence) {
  for (let period = 1; period <= Math.min(3, sequence.length - 1); period += 1) {
    let matchesCycle = true
    for (let index = 0; index < sequence.length; index += 1) {
      if (sequence[index] !== sequence[index % period]) {
        matchesCycle = false
        break
      }
    }
    if (matchesCycle) return true
  }

  return false
}

function buildFragmentOrder() {
  const baseOrder = targetByIndex.map((_, index) => index)
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const nextOrder = shuffleArray(baseOrder)
    const nextTargets = nextOrder.map((index) => targetByIndex[index])

    if (nextTargets.join('|') === originalTargetPattern) continue
    if (hasSimpleCycle(nextTargets)) continue

    return nextOrder
  }

  return [4, 0, 5, 1, 3, 2]
}

function splitHintIntoChips(hint) {
  return hint
    .split(/[,/\uFF0C\u3001]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
}

const fragmentOrder = ref(buildFragmentOrder())
const fragments = computed(() => {
  const localized = tm('pages.y3_2.fragments') || []
  const mappedFragments = localized.map((fragment, index) => ({
    ...fragment,
    target: targetByIndex[index],
  }))
  return fragmentOrder.value.map((index) => mappedFragments[index]).filter(Boolean)
})
const stampOptions = computed(() => ['cv', 'ps', 'rl'].map((id) => {
  const hint = t(`pages.y3_2.${id}Hint`)
  const chips = splitHintIntoChips(hint)
  return {
    id,
    iconClass: STAMP_META[id].iconClass,
    ribbon: chips[0] || id.toUpperCase(),
    hint,
    chips,
  }
}))

const currentIndex = ref(0)
const isResolving = ref(false)
const isBoardAnimating = ref(false)
const boardAnimationName = ref('boardShakeA')
const activeStampTarget = ref('')
const BOARD_SHAKE_MS = 940
const STAMP_DELAY_MS = 120
const FEEDBACK_DELAY_MS = 320
const WRONG_RESOLVE_MS = 1220
const SUCCESS_RESOLVE_MS = 1600
const feedback = reactive({
  visible: false,
  type: 'success',
  title: '',
  message: '',
})
const stampState = reactive({
  visible: false,
  type: 'success',
  label: '',
  serial: 0,
})
const timers = new Set()

const currentFragment = computed(() => fragments.value[currentIndex.value])
const progressPercent = computed(() => Math.round((currentIndex.value / fragments.value.length) * 100))
const boardTone = computed(() => {
  if (feedback.visible) return feedback.type
  if (stampState.visible) return stampState.type
  return 'idle'
})
const boardMotionStyle = computed(() => ({
  animationName: isBoardAnimating.value ? boardAnimationName.value : 'none',
  animationDuration: `${BOARD_SHAKE_MS}ms`,
  animationIterationCount: 1,
  animationFillMode: 'both',
  animationTimingFunction: 'cubic-bezier(0.2, 0.92, 0.22, 1)',
}))

function schedule(fn, delay) {
  const timer = window.setTimeout(() => {
    timers.delete(timer)
    fn()
  }, delay)
  timers.add(timer)
  return timer
}

function resetBoardFeedback() {
  feedback.visible = false
  feedback.title = ''
  feedback.message = ''
  stampState.visible = false
  stampState.label = ''
}

function triggerBoardFeedback(type, targetLabel, title, message) {
  feedback.type = type
  feedback.title = title
  feedback.message = message
  feedback.visible = false

  stampState.type = type
  stampState.label = targetLabel.toUpperCase()
  stampState.visible = false
  stampState.serial += 1

  boardAnimationName.value = boardAnimationName.value === 'boardShakeA' ? 'boardShakeB' : 'boardShakeA'
  isBoardAnimating.value = true

  schedule(() => {
    stampState.visible = true
  }, STAMP_DELAY_MS)

  schedule(() => {
    feedback.visible = true
  }, FEEDBACK_DELAY_MS)

  schedule(() => {
    isBoardAnimating.value = false
  }, BOARD_SHAKE_MS)
}

function stamp(target) {
  if (isResolving.value) return

  const fragment = currentFragment.value
  if (!fragment) return

  isResolving.value = true
  activeStampTarget.value = target
  resetBoardFeedback()

  if (target !== fragment.target) {
    triggerBoardFeedback(
      'error',
      target,
      t('pages.y3_2.wrongTitle', { target: fragment.target.toUpperCase() }),
      fragment.note,
    )
    schedule(() => {
      isResolving.value = false
      activeStampTarget.value = ''
    }, WRONG_RESOLVE_MS)
    return
  }

  triggerBoardFeedback('success', target, t('pages.y3_2.correctTitle'), fragment.note)

  schedule(() => {
    resetBoardFeedback()
    currentIndex.value += 1
    isResolving.value = false
    activeStampTarget.value = ''

    if (currentIndex.value >= fragments.value.length) {
      emit('complete', { game: 'artifact-appraisal' })
    }
  }, SUCCESS_RESOLVE_MS)
}

onBeforeUnmount(() => {
  timers.forEach((timer) => window.clearTimeout(timer))
  timers.clear()
})
</script>

<style scoped>
.bureau-game {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(16px, 3vw, 48px);
  color: #f8fafc;
  background:
    radial-gradient(circle at 18% 18%, rgba(251, 191, 36, 0.13), transparent 24%),
    radial-gradient(circle at 78% 14%, rgba(248, 113, 113, 0.24), transparent 30%),
    radial-gradient(circle at 82% 82%, rgba(56, 189, 248, 0.14), transparent 26%),
    linear-gradient(145deg, #111827, #301d38 52%, #101827);
}

.close-btn,
.stamp-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 4;
  width: 38px;
  height: 38px;
  color: #fee2e2;
  background: rgba(2, 6, 23, 0.84);
  border: 1px solid rgba(248, 113, 113, 0.5);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1.28rem;
  font-weight: 900;
  line-height: 1;
}

.bureau-room {
  width: min(980px, 100%);
  text-align: center;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  margin-top: 6px;
  color: #fecaca;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.9rem, 5.2vw, 4.6rem);
  line-height: 0.92;
  text-shadow: 0 8px 28px rgba(0, 0, 0, 0.34);
}

.eyebrow {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.22);
  background: rgba(17, 24, 39, 0.4);
  color: #fda4af;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}

.intro {
  max-width: 640px;
  margin: 14px auto 0;
  color: #dbeafe;
  line-height: 1.55;
  font-size: 0.92rem;
}

.progress-line {
  margin: 18px auto 0;
  max-width: 560px;
  display: grid;
  gap: 6px;
  text-align: left;
  color: #e5e7eb;
  font-weight: 900;
  font-size: 0.86rem;
}

.meter {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
}

.meter i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #fda4af, #fcd34d);
  transition: width 0.25s ease;
}

.parchment-stage {
  max-width: 740px;
  margin: 22px auto 0;
  perspective: 1600px;
}

.artifact-board {
  position: relative;
  transform-style: preserve-3d;
  will-change: transform, filter;
  --board-glow: rgba(252, 165, 165, 0.28);
  --board-stroke: rgba(248, 113, 113, 0.52);
}

.artifact-board::before,
.artifact-board::after {
  content: '';
  position: absolute;
  inset: auto;
  pointer-events: none;
}

.artifact-board::before {
  left: 8%;
  right: 8%;
  top: 34px;
  bottom: 30px;
  border-radius: 24px;
  background: radial-gradient(circle at 50% 15%, var(--board-glow), transparent 70%);
  filter: blur(24px);
  opacity: 0.9;
}

.artifact-board::after {
  left: 50%;
  top: 100%;
  width: min(84%, 580px);
  height: 26px;
  transform: translate(-50%, -4px);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(15, 23, 42, 0.5), transparent 70%);
  filter: blur(10px);
  opacity: 0.88;
}

.artifact-board.success {
  --board-glow: rgba(74, 222, 128, 0.22);
  --board-stroke: rgba(74, 222, 128, 0.55);
}

.artifact-board.error {
  --board-glow: rgba(248, 113, 113, 0.22);
  --board-stroke: rgba(248, 113, 113, 0.55);
}

.parchment-wrap {
  position: relative;
  z-index: 1;
  transform-origin: 50% 48%;
}

.parchment {
  position: relative;
  overflow: hidden;
  min-height: 224px;
  display: grid;
  place-items: center;
  padding: clamp(22px, 3.6vw, 42px);
  border-radius: 20px;
  color: #351b0b;
  background:
    linear-gradient(90deg, rgba(120, 53, 15, 0.08) 1px, transparent 1px) 0 0 / 30px 100%,
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.62), transparent 22%),
    linear-gradient(180deg, #fff7ed, #fed7aa);
  border: 3px solid rgba(234, 88, 12, 0.92);
  box-shadow:
    0 26px 46px rgba(0, 0, 0, 0.34),
    0 0 0 6px rgba(248, 113, 113, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  transform-origin: 50% 50%;
  backface-visibility: hidden;
}

.parchment::after {
  content: '';
  position: absolute;
  inset: 14px;
  border-radius: 12px;
  border: 1px solid rgba(180, 83, 9, 0.12);
  pointer-events: none;
}

.paper-pin {
  position: absolute;
  top: 16px;
  left: 22px;
  width: 62px;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.7), rgba(245, 158, 11, 0.3));
  transform: rotate(-8deg);
  box-shadow:
    0 4px 10px rgba(120, 53, 15, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
  opacity: 0.86;
}

.paper-shimmer {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.22) 20%, transparent 40%),
    radial-gradient(circle at 10% 30%, rgba(255, 255, 255, 0.2), transparent 24%);
  background-size: 220% 100%, 100% 100%;
  animation: paperShimmer 7s linear infinite;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.72;
}

.fragment-text {
  position: relative;
  z-index: 1;
  font-family: Georgia, 'Times New Roman', serif;
  max-width: 88%;
  font-size: clamp(1rem, 2.7vw, 2.18rem);
  line-height: 1.26;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.28);
}

.parchment.success {
  border-color: #16a34a;
  box-shadow:
    0 26px 46px rgba(0, 0, 0, 0.34),
    0 0 0 6px rgba(134, 239, 172, 0.2);
}

.parchment.error {
  border-color: #dc2626;
  box-shadow:
    0 26px 46px rgba(0, 0, 0, 0.34),
    0 0 0 6px rgba(252, 165, 165, 0.2);
}

.seal-mark {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 116px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 4px double currentColor;
  background:
    radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.18), transparent 28%),
    rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
  font-weight: 1000;
  letter-spacing: 0.14em;
  transform: rotate(-16deg);
  transform-origin: center;
  pointer-events: none;
  isolation: isolate;
  animation: sealFloat 1.45s ease-in-out infinite;
}

.seal-mark::before,
.seal-mark::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  inset: 6px;
  border: 2px solid currentColor;
  opacity: 0.9;
}

.seal-mark::after {
  inset: -6px;
  border-style: solid;
  border-width: 2px;
  opacity: 0.42;
}

.seal-mark.success {
  color: rgba(22, 163, 74, 0.85);
  box-shadow:
    0 0 0 4px rgba(34, 197, 94, 0.12) inset,
    0 12px 20px rgba(22, 101, 52, 0.18);
}

.seal-mark.error {
  color: rgba(220, 38, 38, 0.82);
  box-shadow:
    0 0 0 4px rgba(239, 68, 68, 0.12) inset,
    0 12px 20px rgba(127, 29, 29, 0.18);
}

.seal-label {
  position: relative;
  z-index: 1;
  font-size: 1.14rem;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.16);
}

.feedback-card {
  position: relative;
  z-index: 1;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  text-align: left;
  border: 2px solid rgba(148, 163, 184, 0.3);
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.88)),
    rgba(15, 23, 42, 0.84);
  box-shadow:
    0 16px 28px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.feedback-card strong {
  display: block;
  color: #fff;
  font-size: 0.94rem;
}

.feedback-card p {
  margin-top: 6px;
  color: #e5e7eb;
  line-height: 1.48;
  font-size: 0.86rem;
}

.feedback-card.success {
  border-color: rgba(74, 222, 128, 0.48);
  background: linear-gradient(135deg, rgba(20, 83, 45, 0.92), rgba(6, 78, 59, 0.84));
}

.feedback-card.error {
  border-color: rgba(248, 113, 113, 0.46);
  background: linear-gradient(135deg, rgba(127, 29, 29, 0.92), rgba(120, 53, 15, 0.8));
}

.artifact-board.animating .parchment {
  animation: paperFlutter 0.94s ease both;
}

.artifact-board.animating .fragment-text {
  animation: textSwing 0.94s ease both;
}

.artifact-board.animating .feedback-card {
  animation: feedbackEcho 0.94s ease both;
}

.artifact-board.seal-landed .seal-mark {
  animation-duration: 1.2s;
}

.stamp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.stamp-btn {
  --stamp-accent: rgba(254, 202, 202, 0.6);
  --stamp-soft: rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  min-height: 158px;
  padding: 16px;
  border: 2px solid var(--stamp-accent);
  color: #fff7fb;
  background: linear-gradient(180deg, rgba(8, 13, 26, 0.95), rgba(31, 20, 34, 0.9));
  cursor: pointer;
  text-align: left;
  box-shadow:
    0 16px 30px rgba(2, 6, 23, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    opacity 0.16s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.stamp-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: none;
  opacity: 0;
  pointer-events: none;
}

.stamp-halo {
  position: absolute;
  inset: auto auto -48px -24px;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--stamp-soft), transparent 66%);
  pointer-events: none;
}

.stamp-btn:hover:not(:disabled) {
  transform: translateY(-6px) rotateX(6deg);
  border-color: color-mix(in srgb, var(--stamp-accent) 80%, #fff 20%);
  box-shadow:
    0 20px 34px rgba(2, 6, 23, 0.34),
    0 0 0 4px rgba(255, 255, 255, 0.04);
}

.stamp-btn.active {
  transform: translateY(0) scale(0.98);
  box-shadow:
    0 14px 24px rgba(2, 6, 23, 0.34),
    0 0 0 4px color-mix(in srgb, var(--stamp-accent) 24%, transparent);
}

.stamp-btn:disabled {
  cursor: default;
  opacity: 0.8;
}

.stamp-btn.cv {
  --stamp-accent: rgba(56, 189, 248, 0.8);
  --stamp-soft: rgba(56, 189, 248, 0.22);
}

.stamp-btn.ps {
  --stamp-accent: rgba(251, 191, 36, 0.78);
  --stamp-soft: rgba(251, 191, 36, 0.22);
}

.stamp-btn.rl {
  --stamp-accent: rgba(251, 113, 133, 0.78);
  --stamp-soft: rgba(251, 113, 133, 0.22);
}

.stamp-btn-top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.stamp-code {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stamp-code b {
  display: block;
  font-size: clamp(1.7rem, 3.8vw, 3.05rem);
  line-height: 0.92;
}

.stamp-illustration {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 1.25rem;
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  animation: iconFloat 3.3s ease-in-out infinite;
  animation-delay: var(--float-delay);
}

.stamp-ribbon {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stamp-btn small {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 14px;
  color: #f8fafc;
  line-height: 1.42;
  font-size: 0.84rem;
  min-height: 2.5em;
}

.stamp-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.stamp-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.36);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fef2f2;
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1;
}

.seal-pop-enter-active {
  animation: stampIn 0.42s cubic-bezier(0.12, 1, 0.28, 1.06);
}

.seal-pop-leave-active,
.feedback-rise-enter-active,
.feedback-rise-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.seal-pop-enter-from,
.seal-pop-leave-to,
.feedback-rise-enter-from,
.feedback-rise-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes boardShakeA {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }

  12% {
    transform: translate3d(-18px, -3px, 0) rotate(-2.2deg) scale(1.01);
  }

  26% {
    transform: translate3d(16px, 2px, 0) rotate(1.8deg) scale(1.01);
  }

  42% {
    transform: translate3d(-12px, -1px, 0) rotate(-1.18deg);
  }

  58% {
    transform: translate3d(9px, 1px, 0) rotate(0.88deg);
  }

  74% {
    transform: translate3d(-5px, 0, 0) rotate(-0.36deg);
  }
}

@keyframes boardShakeB {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }

  12% {
    transform: translate3d(18px, -3px, 0) rotate(2.16deg) scale(1.01);
  }

  26% {
    transform: translate3d(-16px, 2px, 0) rotate(-1.76deg) scale(1.01);
  }

  42% {
    transform: translate3d(12px, -1px, 0) rotate(1.14deg);
  }

  58% {
    transform: translate3d(-9px, 1px, 0) rotate(-0.82deg);
  }

  74% {
    transform: translate3d(5px, 0, 0) rotate(0.34deg);
  }
}

@keyframes stampIn {
  0% {
    opacity: 0;
    transform: translate(10px, -28px) rotate(-16deg) scale(1.18);
    filter: blur(1px);
  }

  62% {
    opacity: 1;
    transform: translate(-2px, 3px) rotate(-16deg) scale(0.94);
    filter: blur(0);
  }

  78% {
    transform: translate(0, -2px) rotate(-16deg) scale(1.03);
  }

  100% {
    opacity: 1;
    transform: rotate(-16deg) scale(1);
  }
}

@keyframes sealFloat {
  0%,
  100% {
    transform: rotate(-16deg) translateY(0);
  }

  50% {
    transform: rotate(-14deg) translateY(-3px);
  }
}

@keyframes paperFlutter {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  28% {
    transform: rotate(-1.1deg) scale(1.006);
  }

  56% {
    transform: rotate(0.9deg) scale(1.01);
  }

  82% {
    transform: rotate(-0.3deg);
  }
}

@keyframes textSwing {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  28% {
    transform: translateY(3px) rotate(-0.6deg);
  }

  54% {
    transform: translateY(-2px) rotate(0.5deg);
  }
}

@keyframes feedbackEcho {
  0%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(4px);
  }

  56% {
    transform: translateY(-3px);
  }
}

@keyframes paperShimmer {
  0% {
    background-position: 120% 0, 0 0;
  }

  100% {
    background-position: -120% 0, 0 0;
  }
}

@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 720px) {
  .stamp-grid {
    grid-template-columns: 1fr;
  }

  .stamp-btn {
    min-height: auto;
  }

  .parchment {
    min-height: 240px;
    padding-top: 58px;
  }

  .seal-mark {
    width: 96px;
    top: 10px;
    right: 10px;
    border-width: 4px;
  }

  .seal-label {
    font-size: 1rem;
  }

  .paper-pin {
    width: 52px;
  }
}
</style>
