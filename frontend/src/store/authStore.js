import { create } from 'zustand'
import { authAPI } from '@/utils/api'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const [userRes, profileRes] = await Promise.all([
        authAPI.me(),
        authAPI.getProfile(),
      ])
      set({
        user: userRes.data,
        profile: profileRes.data,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    const profileRes = await authAPI.getProfile()
    set({ user: data.user, profile: profileRes.data, isAuthenticated: true })
    return data
  },

  register: async (formData) => {
    const { data } = await authAPI.register(formData)
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    set({ user: data.user, profile: null, isAuthenticated: true })
    return data
  },

  googleLogin: async (token) => {
    const { data } = await authAPI.googleAuth(token)
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    set({ user: data.user, isAuthenticated: true })
    return data
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token')
    try { await authAPI.logout(refresh) } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, profile: null, isAuthenticated: false })
  },

  updateProfile: async (data) => {
    const res = await authAPI.updateProfile(data)
    set({ profile: res.data })
    return res.data
  },

  updateMe: async (data) => {
    const res = await authAPI.updateMe(data)
    set({ user: res.data })
    return res.data
  },
}))

export default useAuthStore
