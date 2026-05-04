import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from '@/utils/api'
import {
  getApiErrorMessage,
  getCurrentUser,
  getTeacherStudentDetail,
  login,
} from './backend'

describe('backend service helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('unwraps login response payloads', async () => {
    const payload = {
      token: 'token-123',
      user: { id: 7, role: 'student' },
    }
    api.post.mockResolvedValueOnce({ data: { data: payload } })

    await expect(login({ email: 'student@example.com', password: 'secret' })).resolves.toEqual(payload)
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'student@example.com',
      password: 'secret',
    })
  })

  it('returns only the current user from the auth response', async () => {
    const user = { id: 42, email: 'teacher@example.com', role: 'teacher' }
    api.get.mockResolvedValueOnce({ data: { data: { user } } })

    await expect(getCurrentUser()).resolves.toEqual(user)
    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })

  it('builds teacher detail endpoints with the selected student id', async () => {
    const detail = { student: { id: 11 }, progress: { years: {} } }
    api.get.mockResolvedValueOnce({ data: { data: detail } })

    await expect(getTeacherStudentDetail(11)).resolves.toEqual(detail)
    expect(api.get).toHaveBeenCalledWith('/teacher/students/11')
  })

  it('prefers API error messages before local error messages or fallbacks', () => {
    expect(getApiErrorMessage({
      response: {
        data: {
          error: {
            message: 'Email already exists.',
          },
        },
      },
    })).toBe('Email already exists.')

    expect(getApiErrorMessage(new Error('Network down'))).toBe('Network down')
    expect(getApiErrorMessage({}, 'Fallback message.')).toBe('Fallback message.')
  })
})
