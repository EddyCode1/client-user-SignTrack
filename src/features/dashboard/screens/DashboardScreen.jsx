import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../../shared/stores/useAuthStore'
import { isAdminRole } from '../../../shared/utils/roles'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'
import { getCallsHubConnection } from '../../../shared/api/callsHubService'
import { updatePresence } from '../../../shared/api/services/presenceService'

const NAV_ITEMS = [
  { key: 'Profile', icon: 'person-outline', label: 'Mi perfil', color: '#8b5cf6' },
  { key: 'Contacts', icon: 'people-outline', label: 'Contactos', color: '#64748b' },
  { key: 'Groups', icon: 'people-outline', label: 'Grupos', color: COLORS.primary },
  { key: 'Requests', icon: 'notifications-outline', label: 'Solicitudes', color: '#f59e0b' },
  { key: 'Chats', icon: 'chatbubbles-outline', label: 'Chats', color: '#3b82f6' },
  { key: 'Calls', icon: 'call-outline', label: 'Llamadas', color: '#14b8a6' },
  { key: 'Tasks', icon: 'checkbox-outline', label: 'Tareas', color: '#f43f5e' },
  { key: 'Calendar', icon: 'calendar-outline', label: 'Calendario', color: '#6366f1' },
]

const DashboardScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = isAdminRole(user?.rol)
  const firstName = (user?.nombre || 'Usuario').split(' ')[0]
  const [refreshing, setRefreshing] = useState(false)

  // Conectar hub de llamadas en cuanto entra al dashboard para recibir IncomingCall
  useEffect(() => {
    getCallsHubConnection().catch(() => {})
    updatePresence('online').catch(() => {})
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Hola, {firstName}</Text>
      <Text style={styles.subtitle}>Tu espacio de trabajo inclusivo</Text>

      <View style={styles.grid}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.card, SHADOWS.sm]}
            onPress={() => navigation.navigate(item.key)}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {isAdmin && (
          <TouchableOpacity
            style={[styles.card, SHADOWS.sm]}
            onPress={() => navigation.navigate('Users')}
          >
            <View style={[styles.iconWrap, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="shield-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Usuarios</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerEyebrow}>SignTrack Teams</Text>
        <Text style={styles.bannerTitle}>Comunicación inclusiva para todos</Text>
        <Text style={styles.bannerText}>Chat, videollamadas, tareas, calendario y contactos en un solo lugar.</Text>
        <TouchableOpacity style={styles.bannerBtn} onPress={() => navigation.navigate('Groups')}>
          <Text style={styles.bannerBtnText}>Ver mis grupos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  greeting: { fontSize: FONT_SIZE.huge, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.sm,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  bannerEyebrow: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  bannerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: '#fff', marginTop: SPACING.xs },
  bannerText: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)', marginTop: SPACING.xs, lineHeight: 20 },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
  },
  bannerBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm },
})

export default DashboardScreen
