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

function createLiveStringProxy(readValue) {
  return new Proxy(Object.create(null), {
    get(_target, prop) {
      const value = readValue()
      const safe = typeof value === 'string' ? value : String(value ?? '')

      // Make this object ref-like so reactive containers unwrap it to a primitive string.
      if (prop === '__v_isRef') return true
      if (prop === 'value') return safe
      if (prop === '__raw') return safe
      if (prop === Symbol.toPrimitive) return () => safe
      if (prop === 'valueOf') return () => safe
      if (prop === 'toString') return () => safe

      const next = safe[prop]
      if (typeof next === 'function') return next.bind(safe)
      return next
    },
  })
}

function createLiveMessageProxy(readValue) {
  const objectCache = new Map()
  const stringCache = new Map()
  const primitiveStringKeys = new Set(['id', 'nextId', 'mood', 'type'])

  const pathKeyOf = (path) => path.map((segment) => String(segment)).join('\u0001')

  const resolveAtPath = (path = []) => {
    let value = readValue()
    for (const segment of path) {
      if (value == null) return undefined
      value = value[segment]
    }
    return value
  }

  const shouldKeepPrimitiveString = (path, prop, containerValue) => {
    if (Array.isArray(containerValue)) return true
    if (typeof prop !== 'string') return false
    if (primitiveStringKeys.has(prop)) return true
    if (prop.endsWith('Id')) return true
    return false
  }

  const createStringAtPath = (path) => {
    const cacheKey = pathKeyOf(path)
    if (stringCache.has(cacheKey)) return stringCache.get(cacheKey)

    const proxy = new Proxy(Object.create(null), {
      get(_target, prop) {
        const value = resolveAtPath(path)
        const safe = typeof value === 'string' ? value : String(value ?? '')

        if (prop === '__raw') return safe
        if (prop === Symbol.toPrimitive) return () => safe
        if (prop === 'valueOf') return () => safe
        if (prop === 'toString') return () => safe

        const next = safe[prop]
        if (typeof next === 'function') return next.bind(safe)
        return next
      },
    })

    stringCache.set(cacheKey, proxy)
    return proxy
  }

  const createAtPath = (path = []) => {
    const cacheKey = pathKeyOf(path)
    if (objectCache.has(cacheKey)) return objectCache.get(cacheKey)

    const initial = resolveAtPath(path)
    const target = Array.isArray(initial) ? [] : {}

    const proxy = new Proxy(target, {
      get(_target, prop) {
        if (prop === '__raw') return resolveAtPath(path)
        if (prop === Symbol.toPrimitive) return () => resolveAtPath(path)
        if (prop === 'valueOf') return () => resolveAtPath(path)
        if (prop === 'toString') return () => String(resolveAtPath(path) ?? '')

        const value = resolveAtPath(path)
        if (value == null) return undefined

        const next = value[prop]
        if (typeof next === 'function') return next.bind(value)
        if (next && typeof next === 'object') return createAtPath(path.concat(prop))
        if (typeof next === 'string') {
          if (shouldKeepPrimitiveString(path, prop, value)) return next
          return createStringAtPath(path.concat(prop))
        }
        return next
      },
      has(_target, prop) {
        const value = resolveAtPath(path)
        return Boolean(value && prop in value)
      },
      ownKeys() {
        const value = resolveAtPath(path)
        if (!value || typeof value !== 'object') return []
        return Reflect.ownKeys(value)
      },
      getOwnPropertyDescriptor(_target, prop) {
        const value = resolveAtPath(path)
        if (!value || typeof value !== 'object') return undefined
        const descriptor = Object.getOwnPropertyDescriptor(value, prop)
        if (!descriptor) return undefined
        return { ...descriptor, configurable: true }
      },
    })

    objectCache.set(cacheKey, proxy)
    return proxy
  }

  const initial = readValue()
  if (initial && typeof initial === 'object') return createAtPath()
  return initial
}

export function useAppI18n() {
  const languageStore = useLanguageStore()
  languageStore.hydrate()

  const { currentLanguage } = storeToRefs(languageStore)

  const t = (key, params = {}) => {
    const readValue = () => translate(currentLanguage.value, key, params)
    const initial = readValue()
    if (typeof initial === 'string') return createLiveStringProxy(readValue)
    return initial
  }
  const tm = (key) => createLiveMessageProxy(() => getLocaleMessage(currentLanguage.value, key))
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
