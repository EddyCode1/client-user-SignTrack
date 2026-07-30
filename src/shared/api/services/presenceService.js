import adminClient from '../adminClient'

export const getOnlineUsers = async () => {
  const response = await adminClient.get('/presence/online')
  return response.data?.data || response.data || []
}

export const getPresence = async (userId) => {
  const response = await adminClient.get(`/presence/${userId}`)
  return response.data?.data || response.data
}

export const updatePresence = async (status) => {
  const response = await adminClient.put('/presence', { status })
  return response.data?.data || response.data
}

export const heartbeat = async () => {
  try {
    await adminClient.post('/presence/heartbeat')
  } catch {
    /* heartbeat es best-effort */
  }
}
