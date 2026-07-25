let reconnectTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const BASE_DELAY = 2000

export const resetReconnectState = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectAttempts = 0
}

export const scheduleReconnect = (reconnectFn) => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    resetReconnectState()
    return
  }

  const delay = BASE_DELAY * Math.pow(2, reconnectAttempts)
  reconnectAttempts += 1

  reconnectTimer = setTimeout(async () => {
    try {
      await reconnectFn()
      resetReconnectState()
    } catch {
      scheduleReconnect(reconnectFn)
    }
  }, delay)
}
