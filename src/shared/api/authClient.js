import axios from 'axios'
import { useAuthStore } from '../stores/useAuthStore'
import { AUTH_URL } from '../config/env'

const authClient = axios.create({
  baseURL: AUTH_URL,
  headers: { 'Content-Type': 'application/json' },
})

authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) delete config.headers['Content-Type']
  return config
})

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default authClient
