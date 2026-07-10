// Pantalla de lista de conversaciones: carga conversaciones,
// soporta refrescar y navegar a `ChatRoom`.
// Comentarios por bloque añadidos para cada sección importante.
import { useCallback, useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getConversations } from '../../../shared/api/services/chatService'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const ChatsScreen = ({ navigation }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getConversations()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      // error silencioso
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const onRefresh = () => {
    setRefreshing(true)
    load()
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aún no tienes conversaciones.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chatItem, SHADOWS.sm]}
            onPress={() => navigation.navigate('ChatRoom', { conversationId: item.id })}
          >
            <View style={styles.chatInfo}>
              <Text style={styles.chatTitle}>
                {item.title || (item.type === 'group' ? `Grupo ${item.groupId}` : 'Chat directo')}
              </Text>
              <Text style={styles.chatPreview} numberOfLines={1}>
                {item.lastMessagePreview || 'Sin mensajes'}
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  chatItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInfo: { flex: 1 },
  chatTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  chatPreview: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: 2 },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  emptyContainer: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.muted, fontSize: FONT_SIZE.md },
})

export default ChatsScreen
