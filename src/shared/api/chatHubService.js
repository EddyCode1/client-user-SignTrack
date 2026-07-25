import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useAuthStore } from '../stores/useAuthStore'
import { HUB_URL } from '../config/env'
import { scheduleReconnect, resetReconnectState } from './hubReconnectManager'

let connection = null
let handlers = { receiveMessage: [], userTyping: [], conversationUpdated: [] }

const invokeHandlers = (name, ...args) => {
  handlers[name]?.forEach((h) => h(...args))
}

export const getChatHubConnection = async () => {
  if (connection?.state === 'Connected') return connection

  const token = useAuthStore.getState().token

  connection = new HubConnectionBuilder()
    .withUrl(`${HUB_URL}/chat`, { accessTokenFactory: () => token })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('ReceiveMessage', (data) => invokeHandlers('receiveMessage', data))
  connection.on('UserTyping', (data) => invokeHandlers('userTyping', data))
  connection.on('ConversationUpdated', (data) => invokeHandlers('conversationUpdated', data))

  connection.onreconnecting(() => {})
  connection.onreconnected(() => resetReconnectState())
  connection.onclose(() => scheduleReconnect(() => getChatHubConnection()))

  await connection.start()
  return connection
}

export const joinConversationHub = async (conversationId) => {
  if (connection?.state === 'Connected') {
    await connection.invoke('JoinConversation', conversationId)
  }
}

export const leaveConversationHub = async (conversationId) => {
  if (connection?.state === 'Connected') {
    await connection.invoke('LeaveConversation', conversationId)
  }
}

export const sendTypingHub = async (conversationId, isTyping) => {
  if (connection?.state === 'Connected') {
    await connection.invoke('SendTyping', conversationId, isTyping)
  }
}

export const onReceiveMessage = (handler) => {
  handlers.receiveMessage.push(handler)
  return () => { handlers.receiveMessage = handlers.receiveMessage.filter((h) => h !== handler) }
}

export const onUserTyping = (handler) => {
  handlers.userTyping.push(handler)
  return () => { handlers.userTyping = handlers.userTyping.filter((h) => h !== handler) }
}
