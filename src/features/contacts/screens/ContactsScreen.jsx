// Pantalla de contactos: busca en el directorio y permite iniciar chat
// con un usuario creando una conversación.
import { useCallback, useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getDirectory } from '../../../shared/api/services/userService'
import { createConversation } from '../../../shared/api/services/chatService'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const ContactsScreen = ({ navigation }) => {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDirectory(search)
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [search])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleStartChat = async (userId) => {
    try {
      const conversation = await createConversation({ participantIds: [userId] })
      navigation.navigate('ChatRoom', { conversationId: conversation.id })
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo iniciar chat')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contactos</Text>

      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar usuarios..."
        placeholderTextColor={COLORS.muted}
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item._id || item.id)}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron usuarios.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.userItem, SHADOWS.sm]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.name || item.username || '?')[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name} {item.surname}</Text>
                <Text style={styles.userUsername}>@{item.username}</Text>
              </View>
              <TouchableOpacity style={styles.chatBtn} onPress={() => handleStartChat(item._id || item.id)}>
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  userItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  userUsername: { fontSize: FONT_SIZE.sm, color: COLORS.muted },
  chatBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  chatBtnText: { color: '#fff', fontWeight: '600', fontSize: FONT_SIZE.sm },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
})

export default ContactsScreen
