import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../../../shared/stores/useAuthStore'
import { getMessages, markConversationRead, sendMessage } from '../../../shared/api/services/chatService'
import { getChatHubConnection, joinConversationHub, leaveConversationHub, onReceiveMessage, onUserTyping, sendTypingHub } from '../../../shared/api/chatHubService'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const ChatRoomScreen = ({ route, navigation }) => {
  const { conversationId } = route.params
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id || currentUser?._id
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hubReady, setHubReady] = useState(false)
  const [typingUserId, setTypingUserId] = useState(null)
  const flatListRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const typingClearRef = useRef(null)

  const appendMessage = (msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const page = await getMessages(conversationId)
      setMessages(page.messages || [])
    } catch {
      // error silencioso
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    loadMessages()
    markConversationRead(conversationId).catch(() => {})
  }, [conversationId, loadMessages])

  useEffect(() => {
    let cancelled = false

    const setupHub = async () => {
      try {
        await getChatHubConnection()
        if (cancelled) return
        await joinConversationHub(conversationId)
        if (!cancelled) setHubReady(true)
      } catch {
        // hub no disponible
      }
    }

    setupHub()

    const offMessage = onReceiveMessage((msg) => {
      if (msg.conversationId === conversationId) {
        appendMessage(msg)
      }
    })

    const offTyping = onUserTyping(({ conversationId: cid, userId, isTyping }) => {
      if (cid !== conversationId || userId === currentUserId) return
      if (isTyping) {
        setTypingUserId(userId)
        clearTimeout(typingClearRef.current)
        typingClearRef.current = setTimeout(() => setTypingUserId(null), 3000)
      } else {
        setTypingUserId(null)
      }
    })

    return () => {
      cancelled = true
      offMessage()
      offTyping()
      leaveConversationHub(conversationId)
      setHubReady(false)
      clearTimeout(typingTimeoutRef.current)
      clearTimeout(typingClearRef.current)
    }
  }, [conversationId, currentUserId])

  const handleTextChange = (value) => {
    setText(value)
    if (!hubReady) return

    sendTypingHub(conversationId, value.length > 0)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingHub(conversationId, false)
    }, 1200)
  }

  const handleSend = async () => {
    const content = text.trim()
    if (!content) return
    setSending(true)
    try {
      await sendTypingHub(conversationId, false)
      const msg = await sendMessage(conversationId, content)
      appendMessage(msg)
      setText('')
    } catch {
      // error
    } finally {
      setSending(false)
    }
  }

  const renderMessage = ({ item: msg }) => {
    const mine = msg.senderUserId === currentUserId
    const isTranslation = msg.type === 'translation'
    return (
      <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
        <View
          style={[
            styles.msgBubble,
            mine
              ? styles.msgBubbleMine
              : isTranslation
                ? styles.msgBubbleTranslation
                : styles.msgBubbleOther,
          ]}
        >
          {isTranslation && (
            <Text style={styles.translationLabel}>Traducción señas</Text>
          )}
          <Text style={[styles.msgText, mine && { color: '#fff' }]}>{msg.content}</Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, hubReady ? styles.statusOnline : styles.statusOffline]} />
            <Text style={styles.statusText}>{hubReady ? 'En vivo' : 'Conectando...'}</Text>
          </View>
          <TouchableOpacity onPress={loadMessages}>
            <Text style={styles.refreshBtn}>Actualizar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={<Text style={styles.emptyText}>Escribe el primer mensaje.</Text>}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {typingUserId && (
          <Text style={styles.typingText}>Alguien está escribiendo...</Text>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={COLORS.muted}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Text style={styles.sendBtnText}>{sending ? '...' : 'Enviar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.md },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  statusOnline: { backgroundColor: COLORS.success },
  statusOffline: { backgroundColor: COLORS.warning },
  statusText: { fontSize: FONT_SIZE.xs, color: COLORS.muted },
  refreshBtn: { marginLeft: 'auto', color: COLORS.muted, fontSize: FONT_SIZE.sm },
  messagesList: { padding: SPACING.md, flexGrow: 1 },
  msgRow: { marginBottom: SPACING.sm },
  msgRowMine: { alignItems: 'flex-end' },
  msgRowOther: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '80%', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 16 },
  msgBubbleMine: { backgroundColor: COLORS.primary },
  msgBubbleOther: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  msgBubbleTranslation: { backgroundColor: '#f3e8ff', borderWidth: 1, borderColor: '#d8b4fe' },
  msgText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  translationLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7, marginBottom: 2 },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
  typingText: { fontSize: FONT_SIZE.xs, color: COLORS.muted, fontStyle: 'italic', paddingHorizontal: SPACING.md, marginBottom: 4 },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    maxHeight: 100,
    color: COLORS.text,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm },
})

export default ChatRoomScreen
