<template>
  <div class="teacher-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">{{ copy.teacher.eyebrow }}</p>
        <h1>{{ copy.teacher.title }}</h1>
        <p class="subtitle">{{ copy.teacher.subtitle }}</p>
      </div>

      <div class="topbar-actions">
        <div class="teacher-profile-chip">
          <AvatarBadge :avatar="authStore.user?.travelerProfile?.avatar" size="sm" />
          <div>
            <strong>{{ authStore.user?.displayName || authStore.user?.email }}</strong>
            <span>{{ authStore.user?.email }}</span>
          </div>
        </div>
        <button class="topbar-btn" @click="refreshDashboard" :disabled="loading">
          {{ copy.teacher.refresh }}
        </button>
        <button class="topbar-btn danger" @click="handleLogout">
          {{ copy.teacher.logout }}
        </button>
      </div>
    </header>

    <section class="summary-grid">
      <article class="summary-card">
        <span>{{ copy.teacher.summaryStudents }}</span>
        <strong>{{ dashboard?.summary?.totalStudents ?? 0 }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ copy.teacher.summaryActive }}</span>
        <strong>{{ dashboard?.summary?.studentsWithAnyProgress ?? 0 }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ copy.teacher.summaryLevels }}</span>
        <strong>{{ dashboard?.summary?.totalLevels ?? 0 }}</strong>
      </article>
    </section>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

    <section class="dashboard-grid">
      <aside class="student-list-card">
        <div class="card-header">
          <h2>{{ copy.teacher.students }}</h2>
          <span>{{ filteredStudents.length }} / {{ dashboard?.students?.length ?? 0 }}</span>
        </div>

        <label class="search-box">
          <span class="search-label">{{ studentSearchCopy.label }}</span>
          <input
            v-model.trim="studentSearch"
            type="text"
            class="search-input"
            :placeholder="studentSearchCopy.placeholder"
          >
        </label>

        <div class="student-list-scroll">
          <div v-if="loading && !dashboard" class="empty-state">{{ copy.teacher.loading }}</div>
          <div v-else-if="!dashboard?.students?.length" class="empty-state">{{ copy.teacher.noStudents }}</div>
          <div v-else-if="studentSearch && !filteredStudents.length" class="empty-state">{{ studentSearchCopy.empty }}</div>

          <button
            v-for="student in filteredStudents"
            :key="student.id"
            type="button"
            class="student-row"
            :class="{ active: selectedStudentId === student.id, champion: isStudentChampion(student) }"
            @click="loadStudentDetail(student.id)"
          >
            <div class="student-row-main">
              <AvatarBadge :avatar="student.travelerProfile?.avatar" size="sm" />
              <div class="student-row-copy">
                <div class="student-row-header">
                  <strong>{{ student.displayName }}</strong>
                  <span>{{ formatPercent(student.completionRate) }}</span>
                </div>
                <p>{{ student.email }}</p>
                <div class="student-metrics">
                  <span>{{ copy.teacher.coins }} {{ student.coins }}</span>
                  <span>{{ copy.teacher.completed }} {{ student.completedCount }}</span>
                  <span>{{ copy.teacher.skipped }} {{ student.skippedCount }}</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </aside>

      <main class="detail-card">
        <div v-if="detailLoading" class="empty-state">{{ copy.teacher.loadingDetail }}</div>
        <div v-else-if="!studentDetail" class="empty-state">{{ copy.teacher.detailEmpty }}</div>
        <template v-else>
          <div class="detail-header">
            <div class="detail-identity">
              <AvatarBadge :avatar="studentDetail.student.travelerProfile?.avatar" size="md" />
              <div>
                <h2>{{ studentDetail.student.displayName }}</h2>
                <p>{{ studentDetail.student.email }}</p>
              </div>
            </div>
            <div class="detail-stats">
              <span>{{ copy.teacher.coins }} {{ studentDetail.student.coins }}</span>
              <span>{{ copy.teacher.lastLogin }}: {{ formatDate(studentDetail.student.lastLoginAt) }}</span>
              <span>{{ copy.teacher.lastProgress }}: {{ formatLatestProgress(studentDetail.progress?.years) }}</span>
            </div>
          </div>

          <section class="detail-section">
            <h3>{{ copy.teacher.progress }}</h3>
            <div class="progress-grid">
              <article class="progress-card">
                <div class="progress-head">
                  <strong>{{ copy.teacher.year2 }}</strong>
                  <span>{{ studentDetail.progress.years.y2.summary.completed }} / {{ studentDetail.progress.years.y2.levels.length }}</span>
                </div>
                <div class="progress-tags">
                  <span
                    v-for="level in studentDetail.progress.years.y2.levels"
                    :key="`y2-${level.id}`"
                    class="tag"
                    :class="level.status"
                  >
                    {{ level.id }}. {{ level.status }}
                  </span>
                </div>
              </article>

              <article class="progress-card">
                <div class="progress-head">
                  <strong>{{ copy.teacher.year3 }}</strong>
                  <span>{{ studentDetail.progress.years.y3.summary.completed }} / {{ studentDetail.progress.years.y3.levels.length }}</span>
                </div>
                <div class="progress-tags">
                  <span
                    v-for="level in studentDetail.progress.years.y3.levels"
                    :key="`y3-${level.id}`"
                    class="tag"
                    :class="level.status"
                  >
                    {{ level.id }}. {{ level.status }}
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section class="detail-section">
            <h3>{{ copy.teacher.inventory }}</h3>
            <div v-if="!studentDetail.inventory.length" class="empty-inline">{{ copy.teacher.inventoryEmpty }}</div>
            <div v-else class="inventory-grid">
              <article v-for="item in studentDetail.inventory" :key="item.id" class="inventory-card">
                <div class="inventory-icon">{{ item.icon }}</div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.description }}</p>
                <span>{{ item.acquiredAt ? formatDate(item.acquiredAt) : '-' }}</span>
              </article>
            </div>
          </section>
        </template>
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPortalText, useAppI18n } from '@/composables/useAppI18n'
import AvatarBadge from '@/components/AvatarBadge.vue'
import { getApiErrorMessage, getTeacherDashboard, getTeacherStudentDetail } from '@/services/backend'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const { currentLanguage } = useAppI18n()

const dashboard = ref(null)
const studentDetail = ref(null)
const selectedStudentId = ref(null)
const studentSearch = ref('')
const loading = ref(false)
const detailLoading = ref(false)
const errorMessage = ref('')

const copy = computed(() => getPortalText(currentLanguage.value))
const studentSearchCopy = computed(() => (
  currentLanguage.value === 'en'
    ? {
        label: 'Search Students',
        placeholder: 'Search by name or email',
        empty: 'No matching students found.',
      }
    : {
        label: '搜索学生',
        placeholder: '输入学生姓名或邮箱',
        empty: '没有找到匹配的学生。',
      }
))
const filteredStudents = computed(() => {
  const students = dashboard.value?.students || []
  const keyword = studentSearch.value.trim().toLowerCase()

  if (!keyword) return students

  return students.filter((student) => {
    const displayName = String(student.displayName || '').toLowerCase()
    const email = String(student.email || '').toLowerCase()
    return displayName.includes(keyword) || email.includes(keyword)
  })
})

function formatDate(value) {
  if (!value) return '-'

  try {
    return new Intl.DateTimeFormat(currentLanguage.value === 'en' ? 'en-US' : 'zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch (error) {
    return value
  }
}

function formatPercent(value) {
  const percent = Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : 0
  return `${percent}%`
}

function formatLatestProgress(years) {
  const timestamps = ['y2', 'y3']
    .flatMap((year) => years?.[year]?.levels?.map((level) => level.updatedAt) || [])
    .filter(Boolean)
    .sort()

  return timestamps.length ? formatDate(timestamps.at(-1)) : '-'
}

function isStudentChampion(student) {
  return Number(student?.completionRate) >= 1
}

async function loadDashboard(shouldSelect = true) {
  loading.value = true
  errorMessage.value = ''

  try {
    dashboard.value = await getTeacherDashboard()

    if (!dashboard.value.students?.length) {
      studentDetail.value = null
      selectedStudentId.value = null
      return
    }

    const nextStudentId = selectedStudentId.value && dashboard.value.students.some((student) => student.id === selectedStudentId.value)
      ? selectedStudentId.value
      : dashboard.value.students[0].id

    if (shouldSelect) {
      await loadStudentDetail(nextStudentId)
    }
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Failed to load teacher dashboard.')
  } finally {
    loading.value = false
  }
}

async function loadStudentDetail(studentId) {
  detailLoading.value = true
  selectedStudentId.value = studentId
  errorMessage.value = ''

  try {
    studentDetail.value = await getTeacherStudentDetail(studentId)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Failed to load student detail.')
  } finally {
    detailLoading.value = false
  }
}

async function refreshDashboard() {
  await loadDashboard(true)
}

async function handleLogout() {
  await authStore.logout()
  gameStore.clearState()
  await router.replace({ name: 'login' })
}

onMounted(async () => {
  await loadDashboard(true)
})
</script>

<style scoped>
.teacher-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at 16% 18%, rgba(56, 189, 248, 0.12), transparent 18%),
    radial-gradient(circle at 82% 18%, rgba(251, 146, 60, 0.12), transparent 18%),
    linear-gradient(160deg, #08111d 0%, #0f2033 40%, #102a24 100%);
  color: #eff6ff;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #fde68a;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-family: Georgia, serif;
}

.subtitle {
  margin: 12px 0 0;
  color: #d6e2ff;
  max-width: 44rem;
  line-height: 1.65;
}

.topbar-actions,
.summary-grid,
.dashboard-grid,
.progress-grid,
.inventory-grid {
  display: grid;
  gap: 14px;
}

.topbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

.topbar-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  color: #0f172a;
  background: #fef3c7;
}

.topbar-btn.danger {
  background: #fee2e2;
  color: #991b1b;
}

.teacher-profile-chip,
.student-row-main,
.detail-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.teacher-profile-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.teacher-profile-chip strong,
.teacher-profile-chip span {
  display: block;
}

.teacher-profile-chip strong {
  color: #fef3c7;
  font-size: 0.92rem;
}

.teacher-profile-chip span {
  color: #cbd5e1;
  font-size: 0.78rem;
}

.summary-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 20px;
}

.summary-card,
.student-list-card,
.detail-card {
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.22);
}

.summary-card {
  padding: 18px 20px;
  display: grid;
  gap: 8px;
}

.summary-card span {
  color: #cbd5e1;
}

.summary-card strong {
  font-size: 2rem;
  color: #fef3c7;
}

.error-banner {
  margin: 0 0 20px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(127, 29, 29, 0.8);
  color: #fee2e2;
}

.dashboard-grid {
  grid-template-columns: 360px minmax(0, 1fr);
  align-items: start;
}

.student-list-card,
.detail-card {
  padding: 18px;
}

.student-list-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card-header,
.student-row-header,
.progress-head,
.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.card-header {
  align-items: center;
  margin-bottom: 14px;
}

.card-header h2,
.detail-header h2 {
  margin: 0;
  font-family: Georgia, serif;
}

.search-box {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.search-label {
  color: #dbeafe;
  font-size: 0.84rem;
  font-weight: 800;
}

.search-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: #eff6ff;
  font: inherit;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: 2px solid rgba(253, 230, 138, 0.2);
  border-color: rgba(253, 230, 138, 0.35);
}

.student-list-scroll {
  min-height: 0;
  max-height: min(68vh, calc(100vh - 260px));
  overflow-y: auto;
  padding-right: 6px;
}

.student-list-scroll::-webkit-scrollbar {
  width: 8px;
}

.student-list-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
}

.student-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(253, 230, 138, 0.35);
  border-radius: 999px;
}

.student-row {
  position: relative;
  width: 100%;
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.student-row.active {
  border-color: rgba(253, 230, 138, 0.45);
  background: rgba(234, 179, 8, 0.12);
}

.student-row.champion {
  border-color: rgba(250, 204, 21, 0.92);
  box-shadow:
    0 0 0 1px rgba(253, 224, 71, 0.75),
    0 0 22px rgba(250, 204, 21, 0.28),
    inset 0 0 18px rgba(250, 204, 21, 0.08);
}

.student-row.champion::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 18px;
  border: 1px solid rgba(255, 244, 180, 0.72);
  box-shadow: 0 0 18px rgba(255, 215, 0, 0.2);
  pointer-events: none;
}

.student-row-copy {
  flex: 1;
  min-width: 0;
}

.student-row p,
.inventory-card p,
.detail-header p {
  margin: 6px 0 0;
  color: #cbd5e1;
  line-height: 1.5;
}

.student-metrics,
.detail-stats,
.progress-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.student-metrics,
.detail-stats {
  margin-top: 10px;
  color: #fde68a;
  font-size: 0.88rem;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h3 {
  margin: 0 0 12px;
  color: #fef3c7;
}

.progress-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.progress-card,
.inventory-card {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tag {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: rgba(148, 163, 184, 0.18);
}

.tag.completed {
  background: rgba(34, 197, 94, 0.2);
  color: #dcfce7;
}

.tag.skipped {
  background: rgba(251, 191, 36, 0.18);
  color: #fef3c7;
}

.tag.unlocked {
  background: rgba(59, 130, 246, 0.18);
  color: #dbeafe;
}

.tag.locked {
  background: rgba(71, 85, 105, 0.35);
  color: #cbd5e1;
}

.inventory-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.inventory-icon {
  font-size: 1.8rem;
}

.inventory-card span {
  color: #cbd5e1;
  font-size: 0.86rem;
}

.empty-state,
.empty-inline {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  color: #d6e2ff;
  text-align: center;
}

@media (max-width: 980px) {
  .topbar,
  .dashboard-grid,
  .summary-grid,
  .progress-grid {
    grid-template-columns: 1fr;
  }

  .topbar-actions {
    justify-content: flex-start;
  }

  .teacher-profile-chip {
    width: 100%;
  }

  .student-list-scroll {
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
}
</style>
