import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getLocaleMessage, resolveLocalizedValue, translate } from '@/i18n'
import { useLanguageStore } from '@/stores/language'

const PORTAL_TEXT = {
  zh: {
    login: {
      eyebrow: 'Role-Based Portal',
      title: '学生 / 教师登录',
      subtitle: '学生登录后继续闯关，教师登录后查看学生数据与进度。',
      loginTab: '登录',
      registerTab: '注册',
      displayName: '显示名称',
      email: '邮箱',
      password: '密码',
      role: '角色',
      student: '学生',
      teacher: '教师',
      submitLogin: '登录',
      submitRegister: '创建账号',
      loading: '处理中...',
      switchToRegister: '还没有账户？去注册',
      switchToLogin: '已有账户？去登录',
    },
    map: {
      studentPortal: '学生端',
      logout: '退出登录',
      syncing: '正在同步学习进度...',
      syncFailed: '同步失败',
    },
    teacher: {
      eyebrow: 'Teacher Console',
      title: '教师监控面板',
      subtitle: '查看学生完成度、金币、最近登录与学习更新时间。',
      refresh: '刷新',
      logout: '退出登录',
      students: '学生列表',
      noStudents: '还没有学生数据。',
      summaryStudents: '学生总数',
      summaryActive: '已有进度学生',
      summaryLevels: '总关卡数',
      detailEmpty: '选择左侧学生查看详情。',
      progress: '关卡进度',
      inventory: '奖励记录',
      inventoryEmpty: '还没有兑换记录',
      lastLogin: '最近登录',
      lastProgress: '最近学习时间',
      coins: '金币',
      completed: '完成',
      skipped: '跳过',
      completion: '完成率',
      year2: '大二',
      year3: '大三',
      loading: '加载中...',
      loadingDetail: '正在读取学生详情...',
      traveler: '角色形象',
    },
  },
  en: {
    login: {
      eyebrow: 'Role-Based Portal',
      title: 'Student / Teacher Sign In',
      subtitle: 'Students continue the game journey, teachers monitor student data and progress.',
      loginTab: 'Sign In',
      registerTab: 'Register',
      displayName: 'Display Name',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      student: 'Student',
      teacher: 'Teacher',
      submitLogin: 'Sign In',
      submitRegister: 'Create Account',
      loading: 'Working...',
      switchToRegister: 'Need an account? Register',
      switchToLogin: 'Already have an account? Sign in',
    },
    map: {
      studentPortal: 'Student Portal',
      logout: 'Logout',
      syncing: 'Syncing your learning progress...',
      syncFailed: 'Sync failed',
    },
    teacher: {
      eyebrow: 'Teacher Console',
      title: 'Teacher Monitoring Dashboard',
      subtitle: 'Track student completion, coins, logins, and learning activity.',
      refresh: 'Refresh',
      logout: 'Logout',
      students: 'Students',
      noStudents: 'No student data yet.',
      summaryStudents: 'Students',
      summaryActive: 'Active Learners',
      summaryLevels: 'Total Levels',
      detailEmpty: 'Pick a student from the list to inspect details.',
      progress: 'Progress',
      inventory: 'Reward History',
      inventoryEmpty: 'No redeemed rewards yet.',
      lastLogin: 'Last Login',
      lastProgress: 'Last Study Activity',
      coins: 'Coins',
      completed: 'Completed',
      skipped: 'Skipped',
      completion: 'Completion',
      year2: 'Year 2',
      year3: 'Year 3',
      loading: 'Loading...',
      loadingDetail: 'Loading student detail...',
      traveler: 'Traveler Profile',
    },
  },
}

export function getPortalText(language) {
  return language === 'en' ? PORTAL_TEXT.en : PORTAL_TEXT.zh
}

export function useAppI18n() {
  const languageStore = useLanguageStore()
  languageStore.hydrate()

  const { currentLanguage } = storeToRefs(languageStore)

  const t = (key, params = {}) => translate(currentLanguage.value, key, params)
  const tm = (key) => getLocaleMessage(currentLanguage.value, key)
  const localize = (value) => resolveLocalizedValue(currentLanguage.value, value)

  return {
    currentLanguage,
    isZh: computed(() => currentLanguage.value === 'zh'),
    setLanguage: languageStore.setLanguage,
    toggleLanguage: languageStore.toggleLanguage,
    t,
    tm,
    localize,
  }
}
