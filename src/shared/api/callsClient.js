import axios from 'axios'
import { useAuthStore } from '../stores/useAuthStore'
import { API_URL } from '../config/env'

const callsClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

callsClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default callsClient
