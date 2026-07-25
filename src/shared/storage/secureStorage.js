import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const KEY = 'signtrack_refresh_token'

export const setRefreshToken = async (token) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(KEY, token)
    return
  }
  await SecureStore.setItemAsync(KEY, token)
}

export const getRefreshToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(KEY)
  }
  return SecureStore.getItemAsync(KEY)
}

export const deleteRefreshToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(KEY)
    return
  }
  await SecureStore.deleteItemAsync(KEY)
}
