import { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { acceptRequest, getInbox, getSentRequests, rejectRequest, cancelRequest } from '../../../shared/api/services/requestService'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'
import { formatDateTime } from '../../../shared/utils/formatters'

const RequestsScreen = () => {
  const [tab, setTab] = useState('inbox')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = tab === 'inbox' ? await getInbox() : await getSentRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [tab])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleAccept = async (requestId) => {
    try {
      await acceptRequest(requestId)
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al aceptar')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId)
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al rechazar')
    }
  }

  const handleCancel = async (requestId) => {
    try {
      await cancelRequest(requestId)
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al cancelar')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitudes</Text>

      <View style={styles.tabs}>
        {['inbox', 'sent'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'inbox' ? 'Recibidas' : 'Enviadas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay solicitudes.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.requestItem, SHADOWS.sm]}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestTitle}>
                  {item.type === 'friend' ? 'Solicitud de amistad' :
                   item.type === 'meeting' ? 'Invitación a reunión' :
                   item.type === 'group' ? 'Invitación a grupo' : 'Solicitud'}
                </Text>
                <Text style={styles.requestMeta}>{item.message || ''}</Text>
                <Text style={styles.requestDate}>{formatDateTime(item.createdAt)}</Text>
              </View>
              <View style={styles.actions}>
                {item.status === 'pending' && tab === 'inbox' && (
                  <>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                      <Text style={styles.actionBtnText}>Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                      <Text style={styles.actionBtnText}>Rechazar</Text>
                    </TouchableOpacity>
                  </>
                )}
                {item.status === 'pending' && tab === 'sent' && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
                    <Text style={styles.actionBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'pending' && (
                  <Text style={[styles.statusText, {
                    color: item.status === 'accepted' ? COLORS.success : COLORS.muted
                  }]}>
                    {item.status === 'accepted' ? 'Aceptada' : item.status === 'rejected' ? 'Rechazada' : item.status}
                  </Text>
                )}
              </View>
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
  tabs: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  tabTextActive: { color: '#fff' },
  requestItem: { backgroundColor: COLORS.card, borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.sm },
  requestInfo: { marginBottom: SPACING.sm },
  requestTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  requestMeta: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: 2 },
  requestDate: { fontSize: FONT_SIZE.xs, color: COLORS.muted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  acceptBtn: { backgroundColor: COLORS.success, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  rejectBtn: { backgroundColor: COLORS.error, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  cancelBtn: { backgroundColor: COLORS.muted, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: FONT_SIZE.sm },
  statusText: { fontSize: FONT_SIZE.sm, fontWeight: '600', paddingVertical: SPACING.sm },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
})

export default RequestsScreen
