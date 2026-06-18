import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: auto-refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  googleAuth: (token) => api.post('/auth/google/', { token }),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  resetPassword: (email) => api.post('/auth/password-reset/', { email }),
  resetPasswordConfirm: (data) => api.post('/auth/password-reset/confirm/', data),
}

// Assessment
export const assessmentAPI = {
  getQuestions: () => api.get('/assessment/questions/'),
  submit: (data) => api.post('/assessment/submit/', data),
  getResult: () => api.get('/assessment/result/'),
  getHistory: () => api.get('/assessment/history/'),
}

// Careers
export const careersAPI = {
  list: () => api.get('/careers/'),
  recommend: () => api.get('/careers/recommend/'),
  readiness: (career) => api.get(`/careers/readiness/?career=${encodeURIComponent(career)}`),
}

// Roadmap
export const roadmapAPI = {
  generate: (career, duration_months) => api.post('/roadmap/generate/', { career, duration_months }),
  getActive: () => api.get('/roadmap/active/'),
  getAll: () => api.get('/roadmap/'),
  completeMilestone: (id) => api.post(`/roadmap/milestones/${id}/complete/`),
}

// Projects
export const projectsAPI = {
  getRecommendations: (career, phase) => api.get(`/projects/recommendations/?career=${encodeURIComponent(career || '')}&phase=${phase || 1}`),
}

export default api
