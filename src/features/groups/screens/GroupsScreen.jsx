import { useCallback, useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { createGroup, getGroups, joinGroup } from '../../../shared/api/services/groupService'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getGroups()
      setGroups(Array.isArray(data) ? data : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      await createGroup({ name: name.trim(), description: description.trim() })
      setShowCreate(false)
      setName('')
      setDescription('')
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al crear grupo')
    }
  }

  const handleJoin = async (groupId) => {
    try {
      await joinGroup(groupId)
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al unirse')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grupos</Text>

      <TouchableOpacity onPress={() => setShowCreate(!showCreate)}>
        <Text style={styles.actionText}>{showCreate ? 'Cancelar' : 'Crear grupo'}</Text>
      </TouchableOpacity>

      {showCreate && (
        <View style={[styles.createForm, SHADOWS.sm]}>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre del grupo" placeholderTextColor={COLORS.muted} />
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Descripción" placeholderTextColor={COLORS.muted} />
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
            <Text style={styles.submitBtnText}>Crear grupo</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay grupos.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.groupItem, SHADOWS.sm]}
              onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
            >
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                {item.description && <Text style={styles.groupDesc}>{item.description}</Text>}
                <Text style={styles.groupMeta}>
                  {item.memberCount || item.members?.length || 0} miembros
                </Text>
              </View>
              {!item.isMember && (
                <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item.id)}>
                  <Text style={styles.joinBtnText}>Unirse</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  actionText: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '600', marginBottom: SPACING.md },
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
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 10, padding: SPACING.sm, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  groupItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupInfo: { flex: 1 },
  groupName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  groupDesc: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: 2 },
  groupMeta: { fontSize: FONT_SIZE.xs, color: COLORS.muted, marginTop: 4 },
  joinBtn: { backgroundColor: COLORS.success, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  joinBtnText: { color: '#fff', fontWeight: '600', fontSize: FONT_SIZE.sm },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
})

export default GroupsScreen
