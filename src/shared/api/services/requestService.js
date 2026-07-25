import adminClient from '../adminClient'

export const getInbox = async () => {
  const response = await adminClient.get('/requests/inbox')
  return response.data?.data || response.data || []
}

export const getSentRequests = async () => {
  const response = await adminClient.get('/requests/sent')
  return response.data?.data || response.data || []
}

export const createRequest = async (payload) => {
  const response = await adminClient.post('/requests', payload)
  return response.data?.data || response.data
}

export const acceptRequest = async (requestId) => {
  const response = await adminClient.post(`/requests/${requestId}/accept`)
  return response.data?.data || response.data
}

export const rejectRequest = async (requestId) => {
  const response = await adminClient.post(`/requests/${requestId}/reject`)
  return response.data?.data || response.data
}

export const cancelRequest = async (requestId) => {
  await adminClient.delete(`/requests/${requestId}`)
}
