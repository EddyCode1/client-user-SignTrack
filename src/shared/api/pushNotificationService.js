import { Platform } from 'react-native'
import { useAuthStore } from '../stores/useAuthStore'
import { API_URL } from '../config/env'

export const registerPushToken = async (token) => {
  try {
    const authToken = useAuthStore.getState().token
    await fetch(`${API_URL}/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
      }),
    })
  } catch {
    // registro opcional de push
  }
}

export const unregisterPushToken = async (token) => {
  try {
    const authToken = useAuthStore.getState().token
    await fetch(`${API_URL}/push/unregister`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    })
  } catch {
    // error silencioso
  }
}
