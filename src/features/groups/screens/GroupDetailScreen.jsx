import { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native'
import { getGroup, getGroupMembers, inviteToGroup, leaveGroup, removeMember } from '../../../shared/api/services/groupService'
import { createTask, deleteTask, getTasks, updateTask } from '../../../shared/api/services/taskService'
import { useAuthStore } from '../../../shared/stores/useAuthStore'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const GroupDetailScreen = ({ route, navigation }) => {
  const { groupId } = route.params
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id || currentUser?._id
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')
  const [taskTitle, setTaskTitle] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [groupData, membersData, tasksData] = await Promise.all([
        getGroup(groupId),
        getGroupMembers(groupId),
        getTasks({ groupId }),
      ])
      setGroup(groupData)
      setMembers(Array.isArray(membersData) ? membersData : [])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
    } catch {
      Alert.alert('Error', 'Error al cargar grupo')
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => { load() }, [load])

  const isAdmin = group?.createdBy === currentUserId || currentUser?.rol === 'ADMIN_ROLE'

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return
    try {
      await createTask({ title: taskTitle.trim(), groupId })
      setTaskTitle('')
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al crear tarea')
    }
  }

  const handleTaskStatus = async (taskId, status) => {
    try {
      await updateTask(taskId, { status })
      load()
    } catch {
      Alert.alert('Error', 'Error al actualizar tarea')
    }
  }

  const handleDeleteTask = (taskId) => {
    Alert.alert('Eliminar tarea', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try { await deleteTask(taskId); load() } catch { Alert.alert('Error', 'Error al eliminar') }
        },
      },
    ])
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    try {
      await inviteToGroup(groupId, inviteEmail.trim())
      setInviteEmail('')
      Alert.alert('Éxito', 'Invitación enviada')
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al invitar')
    }
  }

  const handleRemoveMember = (userId) => {
    Alert.alert('Eliminar miembro', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try { await removeMember(groupId, userId); load() } catch { Alert.alert('Error', 'Error') }
        },
      },
    ])
  }

  const handleLeave = () => {
    Alert.alert('Salir del grupo', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive',
        onPress: async () => {
          try { await leaveGroup(groupId); navigation.goBack() } catch { Alert.alert('Error', 'Error') }
        },
      },
    ])
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{group?.name || 'Grupo'}</Text>
      {group?.description && <Text style={styles.desc}>{group.description}</Text>}

      <View style={styles.tabs}>
        {['members', 'tasks'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'members' ? 'Miembros' : 'Tareas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
        <Text style={styles.leaveBtnText}>Salir del grupo</Text>
      </TouchableOpacity>

      {activeTab === 'members' ? (
        <View>
          <View style={styles.inviteRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={inviteEmail} onChangeText={setInviteEmail} placeholder="Email para invitar" placeholderTextColor={COLORS.muted} />
            <TouchableOpacity style={styles.smallBtn} onPress={handleInvite}>
              <Text style={styles.smallBtnText}>Invitar</Text>
            </TouchableOpacity>
          </View>

          {members.map((member) => (
            <View key={member.userId || member.id} style={[styles.memberItem, SHADOWS.sm]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(member.name || member.username || '?')[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{member.name} {member.surname}</Text>
                <Text style={styles.memberUsername}>@{member.username}</Text>
              </View>
              {isAdmin && member.userId !== currentUserId && (
                <TouchableOpacity onPress={() => handleRemoveMember(member.userId)}>
                  <Text style={styles.removeText}>Quitar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View>
          <View style={styles.createTaskRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={taskTitle} onChangeText={setTaskTitle} placeholder="Nueva tarea..." placeholderTextColor={COLORS.muted} />
            <TouchableOpacity style={styles.smallBtn} onPress={handleCreateTask}>
              <Text style={styles.smallBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No hay tareas en este grupo.</Text>
          ) : (
            tasks.map((task) => (
              <View key={task.id} style={[styles.taskItem, SHADOWS.sm]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.assigneeId && <Text style={styles.taskMeta}>Asignada</Text>}
                </View>
                <TouchableOpacity onPress={() => handleTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done')}>
                  <Text style={styles.actionText}>
                    {task.status === 'done' ? 'Reabrir' : 'Completar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text },
  desc: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  tabs: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tab: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  tabTextActive: { color: '#fff' },
  leaveBtn: { marginBottom: SPACING.md },
  leaveBtnText: { color: COLORS.error, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  inviteRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  smallBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: SPACING.md, justifyContent: 'center' },
  smallBtnText: { color: '#fff', fontWeight: '600' },
  memberItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { color: '#fff', fontWeight: '700' },
  memberName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  memberUsername: { fontSize: FONT_SIZE.sm, color: COLORS.muted },
  removeText: { color: COLORS.error, fontSize: FONT_SIZE.sm },
  createTaskRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  taskItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  taskMeta: { fontSize: FONT_SIZE.xs, color: COLORS.muted, marginTop: 2 },
  actionText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  deleteText: { color: COLORS.error, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
})

export default GroupDetailScreen
