import adminClient from '../adminClient'

export const getAppointments = async () => {
  const response = await adminClient.get('/appointments')
  return response.data?.data || response.data || []
}

export const createAppointment = async (payload) => {
  const response = await adminClient.post('/appointments', payload)
  return response.data?.data || response.data
}

export const startAppointmentMeeting = async (appointmentId) => {
  const response = await adminClient.post(`/appointments/${appointmentId}/start-meeting`)
  return response.data?.data || response.data
}
