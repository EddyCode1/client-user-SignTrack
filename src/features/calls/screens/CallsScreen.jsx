import { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { createRoom, getRoomHistory, getRooms } from '../../../shared/api/services/callsService'
import { useAuthStore } from '../../../shared/stores/useAuthStore'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'
import { formatDateTime } from '../../../shared/utils/formatters'

const CallsScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user)
  const [rooms, setRooms] = useState([])
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('active')
  const [title, setTitle] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(8)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getRooms()
      setRooms(Array.isArray(data) ? data : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  useEffect(() => {
    if (tab !== 'history') return
    setHistoryLoading(true)
    getRoomHistory()
      .then((items) => setHistory(Array.isArray(items) ? items : []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [tab])

  const handleCreate = async () => {
    if (!title.trim()) return
    setCreating(true)
    try {
      const room = await createRoom({
        title: title.trim(),
        maxParticipants,
        displayName: user?.username || user?.nombre || undefined,
      })
      setTitle('')
      setShowCreate(false)
      navigation.navigate('CallRoom', { roomId: room.id })
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo crear la reunión')
    } finally {
      setCreating(false)
    }
  }

  const activeRooms = rooms.filter((r) => r.status !== 'ended')

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Llamadas</Text>

      <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(!showCreate)}>
        <Text style={styles.createBtnText}>{showCreate ? 'Cancelar' : 'Nueva reunión'}</Text>
      </TouchableOpacity>

      {showCreate && (
        <View style={[styles.createForm, SHADOWS.sm]}>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Título de la reunión"
            placeholderTextColor={COLORS.muted}
          />
          <TouchableOpacity style={[styles.submitBtn, creating && { opacity: 0.6 }]} onPress={handleCreate} disabled={creating}>
            <Text style={styles.submitBtnText}>{creating ? 'Creando...' : 'Crear reunión'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Activas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Recientes</Text>
        </TouchableOpacity>
      </View>

      {tab === 'active' ? (
        <FlatList
          data={activeRooms}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.emptyText}>No tienes reuniones activas.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.roomItem, SHADOWS.sm]}
              onPress={() => navigation.navigate('CallRoom', { roomId: item.id })}
            >
              <Text style={styles.roomTitle}>{item.title}</Text>
              <Text style={styles.roomMeta}>
                {item.status} · {item.participantCount}/{item.maxParticipants} participantes
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            historyLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
            ) : (
              <Text style={styles.emptyText}>Aún no tienes llamadas terminadas.</Text>
            )
          }
          renderItem={({ item }) => (
            <View style={[styles.historyItem, SHADOWS.sm]}>
              <Text style={styles.roomTitle}>{item.title}</Text>
              <Text style={styles.roomMeta}>
                Terminó: {formatDateTime(item.endedAt)} · {item.participantCount} participantes
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  createBtn: { marginBottom: SPACING.md },
  createBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '600' },
  createForm: { backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  tabTextActive: { color: '#fff' },
  roomItem: { backgroundColor: COLORS.card, borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.sm },
  roomTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  roomMeta: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: 2 },
  historyItem: { backgroundColor: COLORS.card, borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.sm },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
})

export default CallsScreen
