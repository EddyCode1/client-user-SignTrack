import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useAuthStore } from '../stores/useAuthStore'
import { HUB_URL } from '../config/env'
import { scheduleReconnect, resetReconnectState } from './hubReconnectManager'

let connection = null
let handlers = { roomEnded: [], participantJoined: [], participantLeft: [], roomUpdated: [] }

const invokeHandlers = (name, ...args) => {
  handlers[name]?.forEach((h) => h(...args))
}

export const getCallsHubConnection = async () => {
  if (connection?.state === 'Connected') return connection

  const token = useAuthStore.getState().token

  connection = new HubConnectionBuilder()
    .withUrl(`${HUB_URL}/calls`, { accessTokenFactory: () => token })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('RoomEnded', (data) => invokeHandlers('roomEnded', data))
  connection.on('ParticipantJoined', (data) => invokeHandlers('participantJoined', data))
  connection.on('ParticipantLeft', (data) => invokeHandlers('participantLeft', data))
  connection.on('RoomUpdated', (data) => invokeHandlers('roomUpdated', data))

  connection.onreconnecting(() => {})
  connection.onreconnected(() => resetReconnectState())
  connection.onclose(() => scheduleReconnect(() => getCallsHubConnection()))

  await connection.start()
  return connection
}

export const joinCallRoomHub = async (roomId) => {
  if (connection?.state === 'Connected') {
    await connection.invoke('JoinRoom', roomId)
  }
}

export const leaveCallRoomHub = async (roomId) => {
  if (connection?.state === 'Connected') {
    await connection.invoke('LeaveRoom', roomId)
  }
}

export const onRoomEnded = (handler) => {
  handlers.roomEnded.push(handler)
  return () => { handlers.roomEnded = handlers.roomEnded.filter((h) => h !== handler) }
}

export const onParticipantJoined = (handler) => {
  handlers.participantJoined.push(handler)
  return () => { handlers.participantJoined = handlers.participantJoined.filter((h) => h !== handler) }
}

export const onParticipantLeft = (handler) => {
  handlers.participantLeft.push(handler)
  return () => { handlers.participantLeft = handlers.participantLeft.filter((h) => h !== handler) }
}
