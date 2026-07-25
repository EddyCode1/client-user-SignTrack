import adminClient from '../adminClient'

export const getUsers = async () => {
  const response = await adminClient.get('/users')
  return response.data?.data || response.data || []
}

export const getUser = async (userId) => {
  const response = await adminClient.get(`/users/${userId}`)
  return response.data?.data || response.data
}

export const getDirectory = async (search = '') => {
  const response = await adminClient.get('/users/directory', { params: { search } })
  return response.data?.data || response.data || []
}

export const updateUser = async (userId, payload) => {
  const response = await adminClient.put(`/users/${userId}`, payload)
  return response.data?.data || response.data
}

export const deleteUser = async (userId) => {
  await adminClient.delete(`/users/${userId}`)
}

export const updateProfile = async (payload) => {
  const response = await adminClient.put('/users/profile', payload)
  return response.data?.data || response.data
}

export const uploadProfilePicture = async (imageUri) => {
  const formData = new FormData()
  formData.append('ProfilePicture', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  })
  const response = await adminClient.put('/users/profile/picture', formData)
  return response.data?.data || response.data
}
