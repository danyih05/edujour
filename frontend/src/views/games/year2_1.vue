<template>
  <div class="forge">
    <KnowledgeGuidePanel
      class="guide-floating"
      :title="t('pages.y2_1.guide.title')"
      :body="t('pages.y2_1.guide.body')"
      :items="guideItems"
    />
    <div class="topbar">
      <div>
        <h1><i class="fas fa-id-card"></i> {{ t('pages.y2_1.title') }}</h1>
        <p>{{ t('pages.y2_1.subtitle') }}</p>
      </div>
    </div>

    <div class="main">
      <section class="preview">
        <div class="charge-left">{{ t('pages.y2_1.charge', { current: chargedChoices }) }}</div>
        <p class="label">{{ t('pages.y2_1.preview') }}</p>
        <div class="stage">
          <div class="avatar" :style="avatarStyle">
            <div class="halo"></div>
            <div class="sigil"><i class="fas" :class="selectedRoleIcon"></i></div>
            <div class="tool-hand" v-if="selectedTool"><i class="fas" :class="selectedTool.icon"></i></div>
            <div class="hair"></div>
            <div class="face"></div>
            <div class="outfit"></div>
            <div class="shadow"></div>
          </div>
        </div>

        <div class="card">
          <div class="cardhead">
            <h2>{{ t('pages.y2_1.cardTitle') }}</h2>
            <div class="badge"><i class="fas" :class="selectedRoleIcon"></i></div>
          </div>
          <div class="row"><span class="key">{{ t('pages.y2_1.fields.codename') }}</span><span class="value">{{ displayName }}</span></div>
          <div class="row"><span class="key">{{ ui.roleCard }}</span><span class="value">{{ roleCard.label }}</span></div>
          <div class="row"><span class="key">{{ ui.gpaLabel }}</span><span class="value">{{ selectedGpa?.range || ui.awaitingChoice }}</span></div>
          <div class="row"><span class="key">{{ t('pages.y2_1.fields.hair') }}</span><span class="value">{{ selectedHair?.name || t('pages.y2_1.awaitingChoice') }}</span></div>
          <div class="row"><span class="key">{{ t('pages.y2_1.fields.outfit') }}</span><span class="value">{{ selectedOutfit?.name || t('pages.y2_1.awaitingChoice') }}</span></div>
          <div class="row"><span class="key">{{ t('pages.y2_1.fields.tool') }}</span><span class="value">{{ selectedTool?.name || t('pages.y2_1.awaitingChoice') }}</span></div>
          <div class="row"><span class="key">{{ ui.experienceTitle }}</span><span class="value">{{ experienceSummary }}</span></div>
          <div class="row"><span class="key">{{ ui.languageTitle }}</span><span class="value">{{ languageSummary }}</span></div>
          <div class="row"><span class="key">{{ ui.greTitle }}</span><span class="value">{{ greSummary }}</span></div>
        </div>
      </section>

      <section class="panel">
        <p class="label">{{ t('pages.y2_1.console') }}</p>

        <div class="box">
          <label for="codename">{{ t('pages.y2_1.nameLabel') }}</label>
          <input id="codename" v-model.trim="state.name" maxlength="18" :placeholder="t('pages.y2_1.namePlaceholder')">
        </div>

        <div class="groups">
          <div class="group">
            <h3>{{ ui.gpaTitle }}</h3>
            <p>{{ ui.gpaDesc }}</p>
            <div class="grid3">
              <button
                v-for="gpa in gpaOptions"
                :key="gpa.id"
                type="button"
                class="opt"
                :class="{ sel: state.gpaId === gpa.id }"
                @click="state.gpaId = gpa.id"
              >
                <i class="fas" :class="gpa.icon"></i>
                <strong>{{ gpa.label }}</strong>
                <span>{{ gpa.range }}</span>
              </button>
            </div>
          </div>

          <div class="group">
            <h3>{{ t('pages.y2_1.hairTitle') }}</h3>
            <p>{{ t('pages.y2_1.hairDesc') }}</p>
            <div class="grid3">
              <button
                v-for="hair in hairs"
                :key="hair.id"
                type="button"
                class="swatch"
                :class="{ sel: state.hairId === hair.id }"
                @click="state.hairId = hair.id"
              >
                <span class="dot" :style="{ background: hair.color }"></span>
                <strong>{{ hair.name }}</strong>
              </button>
            </div>
          </div>

          <div class="group">
            <h3>{{ t('pages.y2_1.outfitTitle') }}</h3>
            <p>{{ t('pages.y2_1.outfitDesc') }}</p>
            <div class="grid3">
              <button
                v-for="outfit in outfits"
                :key="outfit.id"
                type="button"
                class="swatch"
                :class="{ sel: state.outfitId === outfit.id }"
                @click="state.outfitId = outfit.id"
              >
                <span class="dot" :style="{ background: outfit.color }"></span>
                <strong>{{ outfit.name }}</strong>
              </button>
            </div>
          </div>

          <div class="group">
            <h3>{{ t('pages.y2_1.toolTitle') }}</h3>
            <p>{{ t('pages.y2_1.toolDesc') }}</p>
            <div class="grid3">
              <button
                v-for="tool in tools"
                :key="tool.id"
                type="button"
                class="opt"
                :class="{ sel: state.toolId === tool.id }"
                @click="state.toolId = tool.id"
              >
                <i class="fas" :class="tool.icon"></i>
                <strong>{{ tool.name }}</strong>
                <span>{{ tool.copy }}</span>
              </button>
            </div>
          </div>

          <div class="group">
            <h3>{{ ui.experienceTitle }}</h3>
            <p>{{ ui.experienceDesc }}</p>
            <div class="extra-grid">
              <div v-for="field in experienceFields" :key="field.id" class="mini-card">
                <strong>{{ field.label }}</strong>
                <div class="toggle-row">
                  <button
                    type="button"
                    class="toggle-btn"
                    :class="{ sel: state.experiences[field.id] === 'yes' }"
                    @click="state.experiences[field.id] = 'yes'"
                  >
                    {{ ui.yes }}
                  </button>
                  <button
                    type="button"
                    class="toggle-btn"
                    :class="{ sel: state.experiences[field.id] === 'no' }"
                    @click="state.experiences[field.id] = 'no'"
                  >
                    {{ ui.no }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="group">
            <h3>{{ ui.languageTitle }}</h3>
            <p>{{ ui.languageDesc }}</p>
            <div class="grid3 compact-grid">
              <button
                v-for="option in languageOptions"
                :key="option.id"
                type="button"
                class="opt compact"
                :class="{ sel: state.languageExam === option.id }"
                @click="selectLanguage(option.id)"
              >
                <i class="fas" :class="option.icon"></i>
                <strong>{{ option.label }}</strong>
                <span>{{ option.copy }}</span>
              </button>
            </div>
            <div v-if="state.languageExam === 'ielts' || state.languageExam === 'toefl'" class="inline-input">
              <label for="language-score">{{ ui.languageScoreLabel }}</label>
              <input
                id="language-score"
                v-model.trim="state.languageScore"
                :placeholder="ui.languageScorePlaceholder"
              >
            </div>
          </div>

          <div class="group">
            <h3>{{ ui.greTitle }}</h3>
            <p>{{ ui.greDesc }}</p>
            <div class="grid3 compact-grid">
              <button
                v-for="option in greOptions"
                :key="option.id"
                type="button"
                class="opt compact"
                :class="{ sel: state.greMode === option.id }"
                @click="selectGre(option.id)"
              >
                <i class="fas" :class="option.icon"></i>
                <strong>{{ option.label }}</strong>
                <span>{{ option.copy }}</span>
              </button>
            </div>
            <div v-if="state.greMode === 'has'" class="inline-input">
              <label for="gre-score">{{ ui.greScoreLabel }}</label>
              <input
                id="gre-score"
                v-model.trim="state.greScore"
                :placeholder="ui.greScorePlaceholder"
              >
            </div>
          </div>
        </div>

        <div class="progress">
          <strong>{{ t('pages.y2_1.progressTitle', { current: chargedChoices }) }}</strong>
          <div class="progressbar">
            <div class="fill" :style="{ width: `${chargedChoices * 25}%` }"></div>
          </div>
          <p>{{ progressCopy }}</p>
        </div>

        <div class="foot">
          <button class="primary" :disabled="!sealReady" @click="showSummary = true">{{ t('pages.y2_1.seal') }}</button>
        </div>
      </section>
    </div>

    <div v-if="showSummary" class="modal" @click.self="showSummary = false">
      <div class="modalcard">
        <h2><i class="fas fa-wand-sparkles"></i> {{ t('pages.y2_1.modalTitle') }}</h2>
        <p>{{ ui.modalDesc }}</p>
        <div class="reward-badge">
          +30 {{ t('common.labels.coins') }}
        </div>
        <div class="pill"><i class="fas fa-user"></i> {{ forgedProfile.name }}</div>
        <div class="pill"><i class="fas" :class="selectedRoleIcon"></i> {{ roleCard.label }}</div>
        <div class="pill"><i class="fas fa-chart-simple"></i> {{ selectedGpa?.range }}</div>
        <div class="pill"><i class="fas fa-briefcase"></i> {{ experienceSummary }}</div>
        <div class="pill"><i class="fas fa-language"></i> {{ languageSummary }}</div>
        <div class="pill"><i class="fas fa-square-root-variable"></i> {{ greSummary }}</div>
        <div class="actions">
          <button class="secondary" @click="showSummary = false">{{ t('common.actions.refineAgain') }}</button>
          <button class="primary2" @click="returnToMap">{{ t('common.actions.returnToMap') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import KnowledgeGuidePanel from '@/components/KnowledgeGuidePanel.vue'

const emit = defineEmits(['complete', 'close'])
const { currentLanguage, t } = useAppI18n()

const ZH_COPY = {
  gpaTitle: '2. 选择当前均分 / GPA',
  gpaDesc: '系统会根据 GPA 档位自动生成当前角色卡类型。',
  gpaLabel: '当前均分 / GPA',
  roleCard: '当前角色卡',
  experienceTitle: '经历标签',
  experienceDesc: '补充当前是否已经有实习、科研、比赛和项目。',
  languageTitle: '雅思 / 托福',
  languageDesc: '选择当前的语言考试情况，如果已有成绩请填写分数。',
  languageScoreLabel: '语言成绩',
  languageScorePlaceholder: '例如：IELTS 7.0 / TOEFL 100',
  greTitle: 'GRE 成绩',
  greDesc: '如果已有 GRE 成绩请填写，如果目前没有也请明确选择。',
  greScoreLabel: 'GRE 分数',
  greScorePlaceholder: '例如：325 / 330',
  yes: '有',
  no: '无',
  noneYet: '暂时没有',
  awaitingChoice: '待选择',
  noExperience: '目前暂无相关经历',
  modalDesc: '身份封印后，系统会把 GPA 档位、经历标签、语言成绩和 GRE 信息一起写入角色卡。',
  progressNeedExtra: '四枚徽记已充能，但还需要补全经历、语言考试和 GRE 信息。',
}

const EN_COPY = {
  gpaTitle: '2. Choose Current GPA',
  gpaDesc: 'The system will auto-generate the current role-card type from your GPA band.',
  gpaLabel: 'Current GPA',
  roleCard: 'Current Role Card',
  experienceTitle: 'Experience Tags',
  experienceDesc: 'Add whether you already have internships, research, competitions, and projects.',
  languageTitle: 'IELTS / TOEFL',
  languageDesc: 'Choose your current language-test status. If you already have a score, fill it in.',
  languageScoreLabel: 'Language Score',
  languageScorePlaceholder: 'e.g. IELTS 7.0 / TOEFL 100',
  greTitle: 'GRE Score',
  greDesc: 'Fill in your GRE score if you have one, or explicitly mark that you do not have one yet.',
  greScoreLabel: 'GRE Score',
  greScorePlaceholder: 'e.g. 325 / 330',
  yes: 'Yes',
  no: 'No',
  noneYet: 'Not yet',
  awaitingChoice: 'Pending',
  noExperience: 'No related experience yet',
  modalDesc: 'Once sealed, the role card will store your GPA band, experience tags, language-test score, and GRE info.',
  progressNeedExtra: 'All four sigils are charged, but experience, language, and GRE information still need to be completed.',
}

const gpaDefs = [
  { id: 'scholar', icon: 'fa-crown', range: { zh: 'GPA ≥ 80', en: 'GPA ≥ 80' } },
  { id: 'steady', icon: 'fa-shield-halved', range: { zh: '70 ≤ GPA < 80', en: '70 ≤ GPA < 80' } },
  { id: 'sprint', icon: 'fa-bolt', range: { zh: '60 ≤ GPA < 70', en: '60 ≤ GPA < 70' } },
  { id: 'comeback', icon: 'fa-fire', range: { zh: 'GPA < 60', en: 'GPA < 60' } },
]

const hairDefs = [
  { id: 'walnut', color: '#3a2a25' },
  { id: 'midnight', color: '#1f2937' },
  { id: 'ember', color: '#8a3f1f' },
]

const outfitDefs = [
  { id: 'amber', color: '#ffd46d' },
  { id: 'azure', color: '#7dc6ff' },
  { id: 'rose', color: '#ff9f9f' },
]

const toolDefs = [
  { id: 'quill', icon: 'fa-pen-nib' },
  { id: 'prism', icon: 'fa-gem' },
  { id: 'satchel', icon: 'fa-bag-shopping' },
]

const experienceFieldDefs = [
  { id: 'internship', label: { zh: '实习', en: 'Internship' } },
  { id: 'research', label: { zh: '科研', en: 'Research' } },
  { id: 'competition', label: { zh: '比赛', en: 'Competition' } },
  { id: 'project', label: { zh: '项目', en: 'Project' } },
]

const languageDefs = [
  {
    id: 'ielts',
    icon: 'fa-language',
    label: { zh: '雅思', en: 'IELTS' },
    copy: { zh: '已有雅思成绩或正在准备雅思。', en: 'IELTS is your current track.' },
  },
  {
    id: 'toefl',
    icon: 'fa-book-open',
    label: { zh: '托福', en: 'TOEFL' },
    copy: { zh: '已有托福成绩或正在准备托福。', en: 'TOEFL is your current track.' },
  },
  {
    id: 'none',
    icon: 'fa-hourglass-half',
    label: { zh: '暂无', en: 'None yet' },
    copy: { zh: '目前还没有语言成绩。', en: 'No language score yet.' },
  },
]

const greDefs = [
  {
    id: 'has',
    icon: 'fa-square-root-variable',
    label: { zh: '已有 GRE', en: 'Have GRE' },
    copy: { zh: '已经有 GRE 成绩，可以直接填写。', en: 'You already have a GRE score.' },
  },
  {
    id: 'none',
    icon: 'fa-ban',
    label: { zh: '暂无 GRE', en: 'No GRE yet' },
    copy: { zh: '当前还没有 GRE 成绩。', en: 'You do not have a GRE score yet.' },
  },
]

const state = reactive({
  name: '',
  gpaId: '',
  hairId: '',
  outfitId: '',
  toolId: '',
  experiences: {
    internship: '',
    research: '',
    competition: '',
    project: '',
  },
  languageExam: '',
  languageScore: '',
  greMode: '',
  greScore: '',
})

const showSummary = ref(false)

const ui = computed(() => (currentLanguage.value === 'en' ? EN_COPY : ZH_COPY))

const gpaOptions = computed(() => gpaDefs.map((gpa) => ({
  ...gpa,
  label: currentLanguage.value === 'en'
    ? ({ scholar: 'Scholar Type', steady: 'Steady Type', sprint: 'Sprint Type', comeback: 'Comeback Type' }[gpa.id])
    : ({ scholar: '学霸型', steady: '稳扎型', sprint: '冲刺型', comeback: '逆袭型' }[gpa.id]),
  range: gpa.range[currentLanguage.value === 'en' ? 'en' : 'zh'],
})))

const hairs = computed(() => hairDefs.map((hair) => ({
  ...hair,
  name: t(`pages.y2_1.hairs.${hair.id}`),
})))

const outfits = computed(() => outfitDefs.map((outfit) => ({
  ...outfit,
  name: t(`pages.y2_1.outfits.${outfit.id}`),
})))

const tools = computed(() => toolDefs.map((tool) => ({
  ...tool,
  name: t(`pages.y2_1.tools.${tool.id}.name`),
  copy: t(`pages.y2_1.tools.${tool.id}.copy`),
})))

const experienceFields = computed(() => experienceFieldDefs.map((field) => ({
  ...field,
  label: field.label[currentLanguage.value === 'en' ? 'en' : 'zh'],
})))

const languageOptions = computed(() => languageDefs.map((option) => ({
  ...option,
  label: option.label[currentLanguage.value === 'en' ? 'en' : 'zh'],
  copy: option.copy[currentLanguage.value === 'en' ? 'en' : 'zh'],
})))

const greOptions = computed(() => greDefs.map((option) => ({
  ...option,
  label: option.label[currentLanguage.value === 'en' ? 'en' : 'zh'],
  copy: option.copy[currentLanguage.value === 'en' ? 'en' : 'zh'],
})))

const selectedGpa = computed(() => gpaOptions.value.find((item) => item.id === state.gpaId) ?? null)
const selectedHair = computed(() => hairs.value.find((item) => item.id === state.hairId) ?? null)
const selectedOutfit = computed(() => outfits.value.find((item) => item.id === state.outfitId) ?? null)
const selectedTool = computed(() => tools.value.find((item) => item.id === state.toolId) ?? null)

const guideItems = computed(() => [
  { title: t('pages.y2_1.guide.item1.title'), text: t('pages.y2_1.guide.item1.text') },
  { title: t('pages.y2_1.guide.item2.title'), text: t('pages.y2_1.guide.item2.text') },
])

const displayName = computed(() => state.name || t('common.unnamedTraveler'))

const roleCard = computed(() => {
  if (!selectedGpa.value) {
    return {
      id: 'pending',
      icon: 'fa-star',
      label: ui.value.awaitingChoice,
    }
  }

  return {
    id: selectedGpa.value.id,
    icon: selectedGpa.value.icon,
    label: selectedGpa.value.label,
  }
})

const selectedRoleIcon = computed(() => roleCard.value.icon)

const chargedChoices = computed(() => {
  let charged = 0
  if (selectedGpa.value) charged += 1
  if (selectedHair.value) charged += 1
  if (selectedOutfit.value) charged += 1
  if (selectedTool.value) charged += 1
  return charged
})

const experienceAnswered = computed(() => Object.values(state.experiences).every(Boolean))

const languageAnswered = computed(() => {
  if (!state.languageExam) return false
  if (state.languageExam === 'none') return true
  return Boolean(state.languageScore.trim())
})

const greAnswered = computed(() => {
  if (!state.greMode) return false
  if (state.greMode === 'none') return true
  return Boolean(state.greScore.trim())
})

const sealReady = computed(() => Boolean(
  state.name &&
  selectedGpa.value &&
  selectedHair.value &&
  selectedOutfit.value &&
  selectedTool.value &&
  experienceAnswered.value &&
  languageAnswered.value &&
  greAnswered.value,
))

const experienceSummary = computed(() => {
  if (!experienceAnswered.value) return ui.value.awaitingChoice

  const active = experienceFields.value
    .filter((field) => state.experiences[field.id] === 'yes')
    .map((field) => field.label)

  return active.length ? active.join(' / ') : ui.value.noExperience
})

const languageSummary = computed(() => {
  if (!state.languageExam) return ui.value.awaitingChoice
  if (state.languageExam === 'none') return ui.value.noneYet

  const option = languageOptions.value.find((item) => item.id === state.languageExam)
  return `${option?.label || ''} ${state.languageScore.trim()}`.trim()
})

const greSummary = computed(() => {
  if (!state.greMode) return ui.value.awaitingChoice
  if (state.greMode === 'none') return ui.value.noneYet
  return `GRE ${state.greScore.trim()}`
})

const progressCopy = computed(() => {
  if (!state.name) return t('pages.y2_1.progressNeedName')
  if (chargedChoices.value < 4) return t('pages.y2_1.progressCharging')
  if (!experienceAnswered.value || !languageAnswered.value || !greAnswered.value) return ui.value.progressNeedExtra
  return t('pages.y2_1.progressReady')
})

const avatarStyle = computed(() => ({
  '--hair': selectedHair.value?.color || '#3a2a25',
  '--outfit': selectedOutfit.value?.color || '#ffd46d',
}))

const forgedProfile = computed(() => ({
  name: displayName.value,
  archetype: roleCard.value.label,
  familiar: selectedTool.value?.name || t('pages.y2_1.awaitingChoice'),
  academicProfile: {
    gpaBand: selectedGpa.value?.id || '',
    gpa: selectedGpa.value?.range || '',
    experiences: {
      internship: state.experiences.internship === 'yes',
      research: state.experiences.research === 'yes',
      competition: state.experiences.competition === 'yes',
      project: state.experiences.project === 'yes',
    },
    experienceSummary: experienceSummary.value,
    languageExam: state.languageExam,
    languageScore: state.languageExam === 'none' ? null : state.languageScore.trim(),
    languageSummary: languageSummary.value,
    greScore: state.greMode === 'has' ? state.greScore.trim() : null,
    greSummary: greSummary.value,
  },
  roleCard: {
    id: roleCard.value.id,
    label: roleCard.value.label,
  },
  mapAvatar: {
    hairColor: selectedHair.value?.color || '#3a2a25',
    outfitColor: selectedOutfit.value?.color || '#ffd46d',
  },
  avatar: {
    hairColor: selectedHair.value?.color || '#3a2a25',
    outfitColor: selectedOutfit.value?.color || '#ffd46d',
  },
  sigilIcon: roleCard.value.icon,
}))

function selectLanguage(id) {
  state.languageExam = id
  if (id === 'none') {
    state.languageScore = ''
  }
}

function selectGre(id) {
  state.greMode = id
  if (id === 'none') {
    state.greScore = ''
  }
}

function returnToMap() {
  emit('complete', {
    profile: forgedProfile.value,
  })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.forge {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(14, 20, 35, 0.84);
  color: #eef2ff;
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.topbar {
  margin-bottom: 28px;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(to bottom, rgba(148, 163, 184, 0.08), transparent);
  flex-shrink: 0;
}

.topbar h1 {
  margin: 0;
  font-size: 2rem;
  font-family: Georgia, serif;
  color: #f8d6a2;
  text-shadow: 0 0 16px rgba(248, 214, 162, 0.28);
}

.topbar p {
  margin: 8px 0 0;
  color: #a8b4d1;
  line-height: 1.45;
}

.charge-left {
  position: absolute;
  top: 20px;
  right: 28px;
  padding: 12px 18px;
  border-radius: 999px;
  white-space: nowrap;
  font-weight: 800;
  color: #fde68a;
  background: rgba(30, 41, 59, 0.72);
  border: 1px solid rgba(248, 214, 162, 0.28);
  z-index: 5;
}

.reward-badge {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
  margin: 10px 0 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.main {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.preview,
.panel {
  padding: 24px 28px 28px;
  overflow-y: auto;
  height: 100%;
}

.preview {
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(10, 14, 27, 0.98));
  position: relative;
}

.label {
  margin: 0 0 14px;
  color: #cbd5f5;
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
}

.stage {
  margin-top: 35px;
  min-height: 280px;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: radial-gradient(circle at center, rgba(129, 140, 248, 0.16), transparent 42%), linear-gradient(180deg, rgba(30, 41, 59, 0.72), rgba(15, 23, 42, 0.92));
  border: 1px solid rgba(129, 140, 248, 0.14);
}

.avatar {
  --hair: #3a2a25;
  --outfit: #ffd46d;
  position: relative;
  width: 180px;
  height: 210px;
}

.halo {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 2px solid rgba(248, 214, 162, 0.5);
  box-shadow: 0 0 30px rgba(248, 214, 162, 0.16);
}

.sigil {
  position: absolute;
  left: 50%;
  top: 44px;
  transform: translateX(-50%);
  color: #fde68a;
  font-size: 1.45rem;
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5));
}

.tool-hand {
  position: absolute;
  right: -20px;
  top: 120px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: #1f2937;
  font-size: 1.2rem;
  transform: rotate(15deg);
}

.shadow {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  width: 90px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  filter: blur(4px);
}

.hair {
  position: absolute;
  left: 50%;
  top: 34px;
  transform: translateX(-50%);
  width: 74px;
  height: 34px;
  background: var(--hair, #3a2a25);
  border: 4px solid #273640;
  border-bottom: none;
  border-radius: 24px 24px 12px 12px;
  z-index: 3;
}

.face {
  position: absolute;
  left: 50%;
  top: 42px;
  transform: translateX(-50%);
  width: 66px;
  height: 64px;
  background: #ffe8c7;
  border: 4px solid #273640;
  border-radius: 50% 50% 46% 46%;
  z-index: 2;
}

.face::before,
.face::after {
  content: '';
  position: absolute;
  top: 22px;
  width: 8px;
  height: 10px;
  border-radius: 50%;
  background: #273640;
}

.face::before {
  left: 16px;
}

.face::after {
  right: 16px;
}

.outfit {
  position: absolute;
  left: 50%;
  top: 112px;
  transform: translateX(-50%);
  width: 74px;
  height: 60px;
  background: var(--outfit, #ffd46d);
  border: 4px solid #273640;
  border-radius: 18px 18px 12px 12px;
}

.outfit::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f8fafc;
  border: 3px solid #273640;
}

.card {
  margin-top: 30px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(248, 214, 162, 0.2);
}

.cardhead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cardhead h2 {
  margin: 0;
  font-size: 1.08rem;
  color: #f8d6a2;
  font-family: Georgia, serif;
}

.badge {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fde68a;
  background: rgba(248, 214, 162, 0.08);
  border: 1px solid rgba(248, 214, 162, 0.2);
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  margin-top: 8px;
}

.key {
  color: #94a3b8;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.value {
  color: #f8fafc;
  font-weight: 700;
  text-align: right;
}

.panel {
  background: linear-gradient(180deg, rgba(12, 18, 32, 0.88), rgba(8, 11, 22, 0.96));
}

.box,
.group,
.progress {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.box {
  margin-bottom: 18px;
}

.box label,
.inline-input label {
  display: block;
  margin-bottom: 10px;
  color: #dbe4ff;
  font-weight: 700;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.groups {
  display: grid;
  gap: 18px;
}

.group h3 {
  margin: 0 0 6px;
  color: #f8fafc;
  font-size: 1rem;
}

.group p {
  margin: 0 0 14px;
  color: #94a3b8;
  line-height: 1.45;
  font-size: 0.92rem;
}

.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.opt,
.swatch,
.toggle-btn,
.mini-card {
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  color: #e2e8f0;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.96));
  transition: 0.18s;
}

.opt,
.swatch,
.toggle-btn {
  cursor: pointer;
}

.opt:hover,
.swatch:hover,
.toggle-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(248, 214, 162, 0.42);
}

.opt.sel,
.swatch.sel,
.toggle-btn.sel {
  border-color: #f8d6a2;
  box-shadow: 0 0 0 1px rgba(248, 214, 162, 0.25);
}

.opt {
  min-height: 94px;
  padding: 14px 12px;
  text-align: left;
}

.opt.compact {
  min-height: 82px;
}

.opt i {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  border-radius: 12px;
  color: #f8d6a2;
  background: rgba(248, 214, 162, 0.08);
}

.opt strong {
  display: block;
  margin-bottom: 5px;
  color: #f8fafc;
}

.opt span {
  display: block;
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.35;
}

.swatch {
  padding: 12px;
  text-align: center;
}

.dot {
  display: block;
  width: 34px;
  height: 34px;
  margin: 0 auto 8px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.65);
}

.swatch strong {
  font-size: 0.92rem;
}

.extra-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mini-card {
  padding: 14px;
}

.mini-card strong {
  display: block;
  margin-bottom: 10px;
}

.toggle-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.toggle-btn {
  padding: 10px 12px;
  font-weight: 700;
}

.compact-grid {
  margin-bottom: 14px;
}

.inline-input {
  margin-top: 6px;
}

.progress {
  margin-top: 18px;
}

.progressbar {
  height: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  overflow: hidden;
  margin-top: 10px;
}

.fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, #f472b6, #fbbf24);
  transition: width 0.25s ease;
}

.progress p {
  margin: 12px 0 0;
  color: #cbd5e1;
  line-height: 1.45;
  font-size: 0.92rem;
}

.foot {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.primary,
.primary2,
.secondary {
  border: none;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  padding: 14px 24px;
  font-size: 1rem;
  color: #1f2937;
  background: linear-gradient(135deg, #fde68a, #f8b86f);
  box-shadow: 0 10px 24px rgba(248, 184, 111, 0.24);
}

.primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.modal {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(4, 8, 16, 0.86);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.modalcard {
  width: min(560px, 100%);
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(145deg, #1a2235, #0f172a);
  border: 1px solid rgba(248, 214, 162, 0.22);
  box-shadow: 0 30px 50px rgba(0, 0, 0, 0.45);
}

.modalcard h2 {
  margin: 0 0 10px;
  color: #fde68a;
  font-family: Georgia, serif;
}

.modalcard p {
  margin: 0 0 16px;
  color: #cbd5e1;
  line-height: 1.55;
}

.pill {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  font-weight: 700;
  margin: 0 10px 10px 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.secondary,
.primary2 {
  padding: 12px 18px;
}

.secondary {
  color: #dbe4ff;
  background: rgba(255, 255, 255, 0.08);
}

.primary2 {
  color: #1f2937;
  background: linear-gradient(135deg, #fde68a, #f8b86f);
}

@media (max-width: 920px) {
  .main {
    grid-template-columns: 1fr;
  }

  .preview {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }
}

@media (max-width: 700px) {
  .topbar,
  .preview,
  .panel {
    padding-left: 18px;
    padding-right: 18px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .grid3,
  .extra-grid {
    grid-template-columns: 1fr;
  }

  .guide-floating {
    position: absolute;
    top: 20px;
    right: 24px;
    z-index: 20;
  }
}
</style>
