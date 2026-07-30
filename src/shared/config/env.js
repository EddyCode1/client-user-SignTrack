import Constants from 'expo-constants'
import { Platform } from 'react-native'

const GATEWAY_PORT = 5050
const RECOGNITION_PORT = 3001

/**
 * Resuelve la URL base del Gateway según el entorno:
 *  - Override explícito: EXPO_PUBLIC_API_URL  (DuckDNS en HTTPS)
 *  - Emulador Android  : http://10.0.2.2:5050
 *  - Simulador iOS     : http://localhost:5050
 *  - Dispositivo físico: http://<EXPO_PUBLIC_DEV_HOST>:5050
 *  - Producción (EAS)  : Constants.expoConfig.extra.apiUrl
 */
const resolveBaseUrl = () => {
  const override = process.env.EXPO_PUBLIC_API_URL
  if (override) return override.replace(/\/$/, '')

  if (!__DEV__) {
    return Constants.expoConfig?.extra?.apiUrl || 'https://signtrack-kinal.duckdns.org'
  }

  if (Platform.OS === 'android') return `http://10.0.2.2:${GATEWAY_PORT}`
  if (Platform.OS === 'ios') return `http://localhost:${GATEWAY_PORT}`

  const devHost = process.env.EXPO_PUBLIC_DEV_HOST || '192.168.1.160'
  return `http://${devHost}:${GATEWAY_PORT}`
}

/**
 * URL del servicio de reconocimiento (Node.js).
 * En producción Caddy lo expone bajo /recognition-api.
 * En desarrollo accede directo al puerto 3001.
 */
const resolveRecognitionUrl = () => {
  const override = process.env.EXPO_PUBLIC_API_URL
  if (override) return `${override.replace(/\/$/, '')}/recognition-api`

  if (!__DEV__) {
    const base = Constants.expoConfig?.extra?.apiUrl || 'https://signtrack-kinal.duckdns.org'
    return `${base}/recognition-api`
  }

  if (Platform.OS === 'android') return `http://10.0.2.2:${RECOGNITION_PORT}`
  if (Platform.OS === 'ios') return `http://localhost:${RECOGNITION_PORT}`

  const devHost = process.env.EXPO_PUBLIC_DEV_HOST || '192.168.1.160'
  return `http://${devHost}:${RECOGNITION_PORT}`
}

const resolveLiveKitUrl = () => {
  const override = process.env.EXPO_PUBLIC_LIVEKIT_URL
  if (override) return override

  const apiOverride = process.env.EXPO_PUBLIC_API_URL
  if (apiOverride) {
    return apiOverride.replace(/^http/, 'ws').replace(/\/$/, '') + '/livekit'
  }

  if (!__DEV__) {
    return 'wss://signtrack-kinal.duckdns.org/livekit'
  }

  if (Platform.OS === 'android') return `ws://10.0.2.2:7880`
  if (Platform.OS === 'ios') return `ws://localhost:7880`

  const devHost = process.env.EXPO_PUBLIC_DEV_HOST || '192.168.1.160'
  return `ws://${devHost}:7880`
}

const BASE_URL = resolveBaseUrl()

export const API_URL = `${BASE_URL}/api/v1`
export const AUTH_URL = `${BASE_URL}/api/v1/auth`
export const HUB_URL = `${BASE_URL}/hubs`
export const RECOGNITION_URL = resolveRecognitionUrl()
export const LIVEKIT_URL = resolveLiveKitUrl()
export const APP_BASENAME = ''
