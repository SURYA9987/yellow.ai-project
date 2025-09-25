import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token management
let authToken = localStorage.getItem('chattyagent_token')

export function setToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem('chattyagent_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    localStorage.removeItem('chattyagent_token')
    delete api.defaults.headers.common['Authorization']
  }
}

export function getToken() {
  return authToken
}

// Set initial token if exists
if (authToken) {
  setToken(authToken)
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      setToken(null)
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Projects API
export const projectsAPI = {
  create: (projectData) => api.post('/projects', projectData),
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
}

// Chat API
export const chatAPI = {
  create: (chatData) => api.post('/chat', chatData),
  getAll: (params = {}) => api.get('/chat', { params }),
  getById: (id) => api.get(`/chat/${id}`),
  sendMessage: (messageData) => api.post('/chat/message', messageData),
  delete: (id) => api.delete(`/chat/${id}`)
}

// Files API
export const filesAPI = {
  upload: (projectId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/files/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  getProjectFiles: (projectId) => api.get(`/files/${projectId}`),
  delete: (projectId, fileId) => api.delete(`/files/${projectId}/${fileId}`)
}

export default api