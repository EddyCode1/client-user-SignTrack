import axios from 'axios'
import { useAuthStore } from '../stores/useAuthStore'
import { API_URL } from '../config/env'

const messagingClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

messagingClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default messagingClient
