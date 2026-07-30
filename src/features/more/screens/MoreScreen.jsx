import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const MORE_ITEMS = [
  { label: 'Tareas', icon: 'checkbox-outline', route: 'Tasks' },
  { label: 'Calendario', icon: 'calendar-outline', route: 'Calendar' },
  { label: 'Contactos', icon: 'people-outline', route: 'Contacts' },
  { label: 'Grupos', icon: 'people-circle-outline', route: 'Groups' },
  { label: 'Solicitudes', icon: 'notifications-outline', route: 'Requests' },
  { label: 'Perfil', icon: 'person-outline', route: 'Profile' },
]

const MoreScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Más</Text>

      {MORE_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.item, SHADOWS.sm]}
          onPress={() => navigation.navigate(item.route)}
        >
          <Ionicons name={item.icon} size={24} color={COLORS.primary} />
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} style={styles.chevron} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  chevron: { marginLeft: 'auto' },
})

export default MoreScreen
