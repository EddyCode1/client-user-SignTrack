import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { useAuthStore } from '../stores/useAuthStore'
import { HUB_URL } from '../config/env'
import { scheduleReconnect, resetReconnectState } from './hubReconnectManager'

let connection = null
let connectionPromise = null
const joinedRooms = new Set()

const getToken = () => useAuthStore.getState().token || ''

// Al reconectar SignalR no restaura los grupos del hub — hay que volver a unirse
const rejoinActiveRooms = async () => {
  for (const roomId of joinedRooms) {
    try {
      await connection?.invoke('JoinCallRoom', roomId)
    } catch {
      /* sala ya no existe o usuario salió */
    }
  }
}

export const getCallsHubConnection = async () => {
  if (connection?.state === HubConnectionState.Connected) return connection
  if (connectionPromise) return connectionPromise

  connectionPromise = (async () => {
    if (!connection) {
      connection = new HubConnectionBuilder()
        .withUrl(`${HUB_URL}/calls`, { accessTokenFactory: () => getToken() })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build()

      connection.onreconnecting(() => {})
      connection.onreconnected(async () => {
        resetReconnectState()
        await rejoinActiveRooms()
      })
      connection.onclose(() => scheduleReconnect(() => getCallsHubConnection()))
    }

    if (connection.state === HubConnectionState.Disconnected) {
      await connection.start()
    }

    return connection
  })()

  try {
    return await connectionPromise
  } finally {
    connectionPromise = null
  }
}

export const joinCallRoomHub = async (roomId) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('JoinCallRoom', roomId)
  joinedRooms.add(roomId)
}

export const leaveCallRoomHub = async (roomId) => {
  joinedRooms.delete(roomId)
  if (!connection || connection.state !== HubConnectionState.Connected) return
  try {
    await connection.invoke('LeaveCallRoom', roomId)
  } catch {
    /* hub puede estar reconectando */
  }
}

export const sendOfferHub = async (roomId, targetUserId, sdp) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('SendOffer', roomId, targetUserId, sdp)
}

export const sendAnswerHub = async (roomId, targetUserId, sdp) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('SendAnswer', roomId, targetUserId, sdp)
}

export const sendIceCandidateHub = async (roomId, targetUserId, candidate) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('SendIceCandidate', roomId, targetUserId, candidate)
}

export const inviteToCallHub = async (roomId, targetUserId) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('InviteToCall', roomId, targetUserId)
}

export const disconnectCallsHub = async () => {
  if (connection) {
    await connection.stop()
    connection = null
    joinedRooms.clear()
  }
}

// ── Listeners de eventos del hub ──────────────────────────────────────────────

const on = (event, handler) => {
  if (!connection) return () => {}
  connection.on(event, handler)
  return () => connection?.off(event, handler)
}

export const onExistingParticipants = (handler) => on('ExistingParticipants', handler)
export const onParticipantJoined = (handler) => on('ParticipantJoined', handler)
export const onParticipantLeft = (handler) => on('ParticipantLeft', handler)
export const onReceiveOffer = (handler) => on('ReceiveOffer', handler)
export const onReceiveAnswer = (handler) => on('ReceiveAnswer', handler)
export const onReceiveIceCandidate = (handler) => on('ReceiveIceCandidate', handler)
export const onRoomEnded = (handler) => on('RoomEnded', handler)
export const onRoomUpdated = (handler) => on('RoomUpdated', handler)

/**
 * Se emite en cualquier pantalla (grupo por-usuario del hub).
 * Requiere que getCallsHubConnection() haya creado la conexión primero.
 */
export const onIncomingCall = (handler) => on('IncomingCall', handler)
