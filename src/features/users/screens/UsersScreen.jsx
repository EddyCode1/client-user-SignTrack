import { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { deleteUser, getUsers } from '../../../shared/api/services/userService'
import { isAdminRole } from '../../../shared/utils/roles'
import { useAuthStore } from '../../../shared/stores/useAuthStore'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const UsersScreen = () => {
  const currentUser = useAuthStore((state) => state.user)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      Alert.alert('Error', 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleDelete = (userId) => {
    Alert.alert('Eliminar usuario', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try { await deleteUser(userId); load() } catch { Alert.alert('Error', 'Error al eliminar') }
        },
      },
    ])
  }

  const isAdmin = isAdminRole(currentUser?.rol)

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No tienes permisos para ver esta sección.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item._id || item.id)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay usuarios.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.userItem, SHADOWS.sm]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.name || item.username || '?')[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name} {item.surname}</Text>
                <Text style={styles.userMeta}>@{item.username} · {item.rol}</Text>
              </View>
              {item._id !== currentUser?.id && (
                <TouchableOpacity onPress={() => handleDelete(item._id || item.id)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  userItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { color: '#fff', fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  userMeta: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: 2 },
  deleteText: { color: COLORS.error, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
  errorText: { color: COLORS.error, fontSize: FONT_SIZE.md, textAlign: 'center' },
})

export default UsersScreen
