import api from '@/utils/api'

async function unwrap(promise) {
  const response = await promise
  return response.data?.data
}

export function getApiErrorMessage(error, fallback = 'Request failed.') {
  return error?.response?.data?.error?.message || error?.message || fallback
}

export function login(payload) {
  return unwrap(api.post('/auth/login', payload))
}

export function register(payload) {
  return unwrap(api.post('/auth/register', payload))
}

export function logout() {
  return unwrap(api.post('/auth/logout'))
}

export async function getCurrentUser() {
  const payload = await unwrap(api.get('/auth/me'))
  return payload.user
}

export function getProgress() {
  return unwrap(api.get('/progress'))
}

export function completeLevel(payload) {
  return unwrap(api.post('/progress/complete', payload))
}

export function skipLevel(payload) {
  return unwrap(api.post('/progress/skip', payload))
}

export function resetProgress() {
  return unwrap(api.post('/progress/reset'))
}

export function getShopItems() {
  return unwrap(api.get('/shop/items'))
}

export function purchaseItem(payload) {
  return unwrap(api.post('/shop/purchase', payload))
}

export function getInventory() {
  return unwrap(api.get('/inventory'))
}

export function getTeacherDashboard() {
  return unwrap(api.get('/teacher/students'))
}

export function getTeacherStudentDetail(studentId) {
  return unwrap(api.get(`/teacher/students/${studentId}`))
}
