import messagingClient from '../messagingClient'

export const getConversations = async () => {
  const response = await messagingClient.get('/conversations')
  return response.data?.data || response.data || []
}

export const getMessages = async (conversationId, params = {}) => {
  const response = await messagingClient.get(`/conversations/${conversationId}/messages`, { params })
  return response.data?.data || response.data || { messages: [] }
}

export const sendMessage = async (conversationId, content) => {
  const response = await messagingClient.post(`/conversations/${conversationId}/messages`, { content })
  return response.data?.data || response.data
}

export const markConversationRead = async (conversationId) => {
  await messagingClient.post(`/conversations/${conversationId}/read`)
}

export const createConversation = async (payload) => {
  const response = await messagingClient.post('/conversations', payload)
  return response.data?.data || response.data
}
