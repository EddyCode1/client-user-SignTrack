import axios from 'axios'
import { useAuthStore } from '../stores/useAuthStore'
import { API_URL } from '../config/env'

const adminClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

adminClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default adminClient
