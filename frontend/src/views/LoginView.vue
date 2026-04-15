<template>
  <div class="login-page">
    <section class="hero-card">
      <div class="hero-copy">
        <div class="brand-lockup">
          <div class="brand-seal">
            <img src="/xjtlu-shield.png" alt="Xi'an Jiaotong-Liverpool University shield">
          </div>
          <div class="brand-meta">
            <span>XJTLU Portal</span>
            <strong>Xi'an Jiaotong-Liverpool University</strong>
          </div>
        </div>

        <p class="eyebrow">{{ copy.login.eyebrow }}</p>
        <h1>{{ copy.login.title }}</h1>
        <p class="subtitle">{{ copy.login.subtitle }}</p>

        <div class="hero-showcase">
          <section class="showcase-card avatar-showcase">
            <div class="showcase-header">
              <div>
                <p class="showcase-kicker">{{ heroShowcaseCopy.avatarsKicker }}</p>
                <strong>{{ heroShowcaseCopy.avatarsTitle }}</strong>
              </div>
              <span class="showcase-pill">{{ avatarOptions.length }} {{ heroShowcaseCopy.avatarsCount }}</span>
            </div>

            <div class="showcase-avatar-row">
              <article
                v-for="option in avatarOptions"
                :key="`hero-${option.key}`"
                class="showcase-avatar-item"
              >
                <AvatarBadge :avatar="option.avatar" size="sm" />
                <span>{{ option.name }}</span>
              </article>
            </div>
          </section>

          <div class="showcase-grid">
            <article class="showcase-card mini-card">
              <p class="showcase-kicker">{{ heroShowcaseCopy.studentKicker }}</p>
              <strong>{{ heroShowcaseCopy.studentTitle }}</strong>
              <span>{{ heroShowcaseCopy.studentBody }}</span>
            </article>

            <article class="showcase-card mini-card accent-card">
              <p class="showcase-kicker">{{ heroShowcaseCopy.teacherKicker }}</p>
              <strong>{{ heroShowcaseCopy.teacherTitle }}</strong>
              <span>{{ heroShowcaseCopy.teacherBody }}</span>
            </article>
          </div>
        </div>
      </div>

      <form class="auth-panel" @submit.prevent="submitForm">
        <div class="mode-toggle">
          <button
            type="button"
            class="mode-btn"
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >
            {{ copy.login.loginTab }}
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
          >
            {{ copy.login.registerTab }}
          </button>
        </div>

        <label v-if="mode === 'register'" class="field">
          <span>{{ copy.login.displayName }}</span>
          <input v-model.trim="form.displayName" type="text" :placeholder="copy.login.displayName">
        </label>

        <label class="field">
          <span>{{ copy.login.email }}</span>
          <input v-model.trim="form.email" type="email" :placeholder="copy.login.email">
        </label>

        <label class="field">
          <span>{{ copy.login.password }}</span>
          <input v-model="form.password" type="password" :placeholder="copy.login.password">
        </label>

        <div class="field">
          <span>{{ copy.login.role }}</span>
          <div class="role-switch">
            <button
              type="button"
              class="role-btn"
              :class="{ active: form.role === 'student' }"
              @click="form.role = 'student'"
            >
              {{ copy.login.student }}
            </button>
            <button
              type="button"
              class="role-btn"
              :class="{ active: form.role === 'teacher' }"
              @click="form.role = 'teacher'"
            >
              {{ copy.login.teacher }}
            </button>
          </div>
        </div>

        <div v-if="mode === 'register'" class="field">
          <span>{{ avatarCopy.title }}</span>
          <small class="field-hint">{{ avatarCopy.subtitle }}</small>
          <div class="avatar-grid">
            <button
              v-for="option in avatarOptions"
              :key="option.key"
              type="button"
              class="avatar-option"
              :class="{ active: form.avatarKey === option.key }"
              @click="form.avatarKey = option.key"
            >
              <AvatarBadge :avatar="option.avatar" size="lg" />
              <strong>{{ option.name }}</strong>
              <small>{{ option.description }}</small>
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button class="submit-btn" type="submit" :disabled="authStore.submitting">
          {{ authStore.submitting ? copy.login.loading : submitLabel }}
        </button>

        <button type="button" class="switch-link" @click="toggleMode">
          {{ mode === 'login' ? copy.login.switchToRegister : copy.login.switchToLogin }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPortalText, useAppI18n } from '@/composables/useAppI18n'
import AvatarBadge from '@/components/AvatarBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const gameStore = useGameStore()
const { currentLanguage } = useAppI18n()

const mode = ref('login')
const errorMessage = ref('')
const form = reactive({
  displayName: '',
  email: '',
  password: '',
  role: 'student',
  avatarKey: 'north-star',
})

const copy = computed(() => getPortalText(currentLanguage.value))
const submitLabel = computed(() => (
  mode.value === 'login' ? copy.value.login.submitLogin : copy.value.login.submitRegister
))
const roleMismatchCopy = computed(() => (
  currentLanguage.value === 'en'
    ? {
        teacher: 'This is a teacher account. Please switch to Teacher before signing in.',
        student: 'This is a student account. Please switch to Student before signing in.',
      }
    : {
        teacher: '这是教师账号，请切换到“教师”后再登录。',
        student: '这是学生账号，请切换到“学生”后再登录。',
      }
))
const heroShowcaseCopy = computed(() => (
  currentLanguage.value === 'en'
    ? {
        avatarsKicker: 'Portal Companions',
        avatarsTitle: 'Pick a companion before you start.',
        avatarsCount: 'choices',
        studentKicker: 'Student Path',
        studentTitle: 'Play levels and keep your own progress.',
        studentBody: 'Coins, inventory, and milestones stay with the account.',
        teacherKicker: 'Teacher View',
        teacherTitle: 'Search students and track their progress.',
        teacherBody: 'One dashboard for completion, rewards, and recent activity.',
      }
    : {
        avatarsKicker: '头像预览',
        avatarsTitle: '先挑一个喜欢的动物头像再开始。',
        avatarsCount: '种选择',
        studentKicker: '学生端',
        studentTitle: '闯关、拿金币、保留自己的学习进度。',
        studentBody: '账号会保存进度、奖励和头像，不会每次重来。',
        teacherKicker: '教师端',
        teacherTitle: '搜索学生并查看他们的完成情况。',
        teacherBody: '同一个面板里就能看进度、奖励和最近活动。',
      }
))
const avatarCopy = computed(() => (
  currentLanguage.value === 'en'
    ? {
        title: 'Portal Avatar',
        subtitle: 'Choose one of four animal avatars. Your selection will be saved to the account and shown after sign in.',
      }
    : {
        title: '头像',
        subtitle: '从 4 个动物头像里选 1 个。选择会保存到账号里，登录后学生端和教师端都会显示。',
      }
))
const avatarOptions = computed(() => {
  if (currentLanguage.value === 'en') {
    return [
      {
        key: 'north-star',
        name: 'Cheetah',
        description: 'Spotted cat',
        avatar: {
          presetKey: 'north-star',
          label: 'Cheetah avatar',
        },
      },
      {
        key: 'sunrise-note',
        name: 'Dog',
        description: 'Fluffy puppy',
        avatar: {
          presetKey: 'sunrise-note',
          label: 'Dog avatar',
        },
      },
      {
        key: 'forest-spark',
        name: 'Cat',
        description: 'Stretching cat',
        avatar: {
          presetKey: 'forest-spark',
          label: 'Cat avatar',
        },
      },
      {
        key: 'midnight-wave',
        name: 'Bird',
        description: 'Seaside bird',
        avatar: {
          presetKey: 'midnight-wave',
          label: 'Bird avatar',
        },
      },
    ]
  }

  return [
    {
      key: 'north-star',
      name: '猎豹',
      description: '斑点小豹',
      avatar: {
        presetKey: 'north-star',
        label: '猎豹头像',
      },
    },
    {
      key: 'sunrise-note',
      name: '小狗',
      description: '蓬蓬小狗',
      avatar: {
        presetKey: 'sunrise-note',
        label: '小狗头像',
      },
    },
    {
      key: 'forest-spark',
      name: '黑猫',
      description: '伸懒腰黑猫',
      avatar: {
        presetKey: 'forest-spark',
        label: '黑猫头像',
      },
    },
    {
      key: 'midnight-wave',
      name: '海鸟',
      description: '海边小鸟',
      avatar: {
        presetKey: 'midnight-wave',
        label: '海鸟头像',
      },
    },
  ]
})

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMessage.value = ''
}

async function submitForm() {
  errorMessage.value = ''

  try {
    if (mode.value === 'login') {
      const user = await authStore.login({
        email: form.email,
        password: form.password,
      })

      if (user.role !== form.role) {
        authStore.clearSession()
        gameStore.clearState()
        errorMessage.value = roleMismatchCopy.value[user.role] || 'Role mismatch.'
        return
      }
    } else {
      await authStore.register({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        role: form.role,
        avatarKey: form.avatarKey,
      })
    }

    gameStore.clearState()

    if (authStore.isTeacher) {
      await router.replace({ name: 'teacher-dashboard' })
      return
    }

    await gameStore.ensureLoaded()
    const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirectTarget)
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background:
    linear-gradient(118deg, rgba(4, 10, 18, 0.84) 0%, rgba(9, 18, 30, 0.76) 32%, rgba(11, 27, 37, 0.68) 58%, rgba(24, 53, 43, 0.58) 100%),
    radial-gradient(circle at 14% 18%, rgba(164, 198, 223, 0.18), transparent 20%),
    radial-gradient(circle at 82% 84%, rgba(156, 188, 135, 0.16), transparent 24%),
    url('/xjtlu-station-building.jpg') center center / cover no-repeat;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 32%),
    radial-gradient(circle at 78% 24%, rgba(255, 255, 255, 0.18), transparent 18%),
    radial-gradient(circle at 18% 76%, rgba(245, 158, 11, 0.12), transparent 20%);
  pointer-events: none;
  z-index: 0;
}

.login-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0)),
    repeating-linear-gradient(-7deg, rgba(255, 255, 255, 0.16) 0 2px, transparent 2px 11px);
  opacity: 0.18;
  clip-path: polygon(34% 0, 100% 0, 100% 100%, 52% 100%);
  pointer-events: none;
  z-index: 0;
}

.hero-card {
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  padding: 28px;
  border-radius: 34px;
  position: relative;
  z-index: 1;
  background:
    linear-gradient(135deg, rgba(8, 15, 24, 0.52), rgba(12, 22, 34, 0.36) 46%, rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(18px);
}

.hero-copy {
  min-height: 100%;
  padding: 18px 10px;
  display: flex;
  flex-direction: column;
  color: #f8fafc;
}

.brand-lockup {
  max-width: 34rem;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.brand-seal {
  width: 82px;
  min-width: 82px;
  aspect-ratio: 1;
  padding: 8px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(224, 233, 245, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.34);
  box-shadow: 0 18px 30px rgba(5, 12, 20, 0.26);
}

.brand-seal img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-meta {
  display: grid;
  gap: 5px;
}

.brand-meta span {
  color: #dbeafe;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.brand-meta strong {
  font-size: 1rem;
  line-height: 1.35;
  color: #f8fafc;
}

.eyebrow {
  margin: 0 0 14px;
  color: #fde68a;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  line-height: 1.05;
  font-family: Georgia, serif;
}

.subtitle {
  max-width: 34rem;
  margin: 18px 0 0;
  color: #d9e4f7;
  font-size: 1rem;
  line-height: 1.75;
}

.hero-showcase {
  margin-top: auto;
  padding-top: 28px;
  display: grid;
  gap: 14px;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.showcase-card {
  border-radius: 24px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(9, 17, 28, 0.28));
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.avatar-showcase {
  position: relative;
  overflow: hidden;
}

.avatar-showcase::after {
  content: '';
  position: absolute;
  inset: auto -18% -42% 38%;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(253, 224, 71, 0.18), transparent 68%);
  pointer-events: none;
}

.showcase-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.showcase-kicker {
  margin: 0 0 6px;
  color: #fde68a;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.showcase-header strong,
.mini-card strong {
  display: block;
  font-size: 1rem;
  line-height: 1.4;
}

.showcase-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fef3c7;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.showcase-avatar-row {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.showcase-avatar-item {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
}

.showcase-avatar-item span {
  color: #e2e8f0;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}

.mini-card span {
  display: block;
  margin-top: 8px;
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 0.9rem;
}

.accent-card {
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.16), rgba(15, 23, 42, 0.22));
}

.auth-panel {
  padding: 22px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(251, 247, 239, 0.92), rgba(244, 236, 222, 0.9));
  border: 1px solid rgba(226, 188, 124, 0.56);
  box-shadow:
    0 20px 40px rgba(7, 14, 22, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
}

.mode-toggle,
.role-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mode-btn,
.role-btn,
.submit-btn,
.switch-link {
  border: none;
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
  transition: 0.2s ease;
}

.mode-btn,
.role-btn {
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  font-weight: 800;
}

.mode-btn.active,
.role-btn.active {
  background: linear-gradient(135deg, #14532d, #15803d);
  color: #f0fdf4;
  box-shadow: 0 8px 18px rgba(21, 128, 61, 0.22);
}

.field {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  color: #334155;
  font-weight: 700;
}

.field-hint {
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
  font-weight: 600;
}

.field input {
  width: 100%;
  padding: 13px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.86);
  color: #0f172a;
}

.field input:focus {
  outline: 2px solid rgba(21, 128, 61, 0.22);
  border-color: #15803d;
}

.error-message {
  margin: 18px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
  font-weight: 700;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.avatar-option {
  padding: 14px 12px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.82);
  color: #0f172a;
  text-align: center;
  display: grid;
  justify-items: center;
  gap: 10px;
}

.avatar-option strong {
  font-size: 0.95rem;
}

.avatar-option small {
  color: #64748b;
  line-height: 1.45;
}

.avatar-option.active {
  border-color: rgba(21, 128, 61, 0.55);
  background: linear-gradient(180deg, rgba(220, 252, 231, 0.92), rgba(255, 255, 255, 0.94));
  box-shadow: 0 10px 22px rgba(21, 128, 61, 0.12);
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #d97706, #ea580c);
  color: #fff7ed;
  font-weight: 900;
  box-shadow: 0 12px 20px rgba(234, 88, 12, 0.2);
}

.submit-btn:hover:enabled,
.switch-link:hover {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  cursor: wait;
  opacity: 0.8;
}

.switch-link {
  width: 100%;
  margin-top: 12px;
  padding: 12px 18px;
  background: transparent;
  color: #475569;
  font-weight: 700;
}

@media (max-width: 860px) {
  .login-page {
    background:
      linear-gradient(125deg, rgba(4, 10, 18, 0.88) 0%, rgba(9, 18, 30, 0.8) 44%, rgba(24, 53, 43, 0.64) 100%),
      radial-gradient(circle at 14% 18%, rgba(164, 198, 223, 0.14), transparent 22%),
      radial-gradient(circle at 80% 84%, rgba(156, 188, 135, 0.14), transparent 24%),
      url('/xjtlu-station-building.jpg') 64% center / cover no-repeat;
  }

  .login-page::after {
    clip-path: polygon(0 0, 100% 0, 100% 46%, 26% 78%, 0 70%);
    opacity: 0.12;
  }

  .hero-card {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .brand-lockup {
    gap: 14px;
    margin-bottom: 18px;
  }

  .brand-seal {
    width: 72px;
    min-width: 72px;
    border-radius: 22px;
  }

  .auth-panel {
    padding: 18px;
  }

  .avatar-grid {
    grid-template-columns: 1fr;
  }

  .showcase-grid,
  .showcase-avatar-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .brand-lockup {
    align-items: flex-start;
  }
}
</style>
