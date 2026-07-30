import callsClient from '../callsClient'

export const getRooms = async () => {
  const response = await callsClient.get('/rooms')
  return response.data?.data || response.data || []
}

export const getRoom = async (roomId) => {
  const response = await callsClient.get(`/rooms/${roomId}`)
  return response.data?.data || response.data
}

export const createRoom = async (payload) => {
  const response = await callsClient.post('/rooms', payload)
  return response.data?.data || response.data
}

export const joinRoom = async (roomId, displayName) => {
  const response = await callsClient.post(`/rooms/${roomId}/join`, { displayName })
  return response.data?.data || response.data
}

export const getRoomHistory = async () => {
  const response = await callsClient.get('/rooms/history')
  return response.data?.data || response.data || []
}

export const getLiveKitToken = async (roomId) => {
  const response = await callsClient.post(`/rooms/${roomId}/livekit-token`)
  return response.data?.data || response.data
}

export const endRoom = async (roomId) => {
  const response = await callsClient.post(`/rooms/${roomId}/end`)
  return response.data?.data || response.data
}

export const leaveRoom = async (roomId) => {
  const response = await callsClient.post(`/rooms/${roomId}/leave`)
  return response.data?.data || response.data
}
