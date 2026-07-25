import adminClient from '../adminClient'

export const getGroups = async () => {
  const response = await adminClient.get('/groups')
  const data = response.data?.data || response.data || []
  return Array.isArray(data) ? data : []
}

export const getGroup = async (groupId) => {
  const response = await adminClient.get(`/groups/${groupId}`)
  return response.data?.data || response.data
}

export const createGroup = async (payload) => {
  const response = await adminClient.post('/groups', payload)
  return response.data?.data || response.data
}

export const updateGroup = async (groupId, payload) => {
  const response = await adminClient.put(`/groups/${groupId}`, payload)
  return response.data?.data || response.data
}

export const deleteGroup = async (groupId) => {
  await adminClient.delete(`/groups/${groupId}`)
}

export const joinGroup = async (groupId) => {
  const response = await adminClient.post(`/groups/${groupId}/join`)
  return response.data?.data || response.data
}

export const leaveGroup = async (groupId) => {
  await adminClient.post(`/groups/${groupId}/leave`)
}

export const inviteToGroup = async (groupId, userId) => {
  const response = await adminClient.post(`/groups/${groupId}/invite`, { userId })
  return response.data?.data || response.data
}

export const removeMember = async (groupId, userId) => {
  await adminClient.delete(`/groups/${groupId}/members/${userId}`)
}

export const getGroupMembers = async (groupId) => {
  const response = await adminClient.get(`/groups/${groupId}/members`)
  return response.data?.data || response.data || []
}
