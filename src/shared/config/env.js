import Constants from 'expo-constants'
import { Platform } from 'react-native'

const getBaseUrl = () => {
  if (Platform.OS === 'web') return ''
  if (__DEV__) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
    return `http://${host}:5000`
  }
  return Constants.expoConfig?.extra?.apiUrl || 'https://api.signtrack.app'
}

export const API_URL = `${getBaseUrl()}/api/v1`
export const AUTH_URL = `${getBaseUrl()}/api/v1/auth`
export const HUB_URL = `${getBaseUrl()}/hubs`
export const APP_BASENAME = ''
