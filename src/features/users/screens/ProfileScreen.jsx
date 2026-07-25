import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { useAuthStore } from '../../../shared/stores/useAuthStore'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const ProfileScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ])
  }

  if (!user) return null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.nombre || user.username || 'U')[0]?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.card, SHADOWS.sm]}>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{user.nombre || user.name || '-'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Usuario</Text>
          <Text style={styles.value}>@{user.username || '-'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email || '-'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{user.rol || '-'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  avatarWrap: { alignItems: 'center', marginVertical: SPACING.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: FONT_SIZE.huge, fontWeight: '700' },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.lg, marginBottom: SPACING.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  label: { fontSize: FONT_SIZE.sm, color: COLORS.muted },
  value: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border },
  logoutBtn: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  logoutBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },
})

export default ProfileScreen
