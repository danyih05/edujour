import { createRouter, createWebHistory } from 'vue-router'
import GameContainer from '@/views/GameContainer.vue'
import LoginView from '@/views/LoginView.vue'
import MapView from '@/views/MapView.vue'
import TeacherDashboardView from '@/views/TeacherDashboardView.vue'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'map',
      component: MapView,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/game/:id',
      name: 'game',
      component: GameContainer,
      props: true,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/teacher',
      name: 'teacher-dashboard',
      component: TeacherDashboardView,
      meta: {
        requiresAuth: true,
        role: 'teacher',
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.hydrate()

  if (to.name === 'login') {
    if (authStore.isTeacher) {
      return { name: 'teacher-dashboard' }
    }
    if (authStore.isStudent) {
      return { name: 'map' }
    }
    return true
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.role === 'teacher' && !authStore.isTeacher) {
    return authStore.isStudent ? { name: 'map' } : { name: 'login' }
  }

  if (to.meta.role === 'student' && !authStore.isStudent) {
    return authStore.isTeacher ? { name: 'teacher-dashboard' } : { name: 'login' }
  }

  if (to.meta.role === 'student') {
    const gameStore = useGameStore()
    try {
      await gameStore.ensureLoaded()
    } catch (error) {
      console.error(error)
    }
  }

  return true
})

export default router
