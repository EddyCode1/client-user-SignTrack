import { useCallback, useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { createTask, deleteTask, getTasks, updateTask } from '../../../shared/api/services/taskService'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'done', label: 'Completada' },
]

const STATUS_COLORS = {
  pending: COLORS.warning,
  in_progress: COLORS.primary,
  done: COLORS.success,
}

const TasksScreen = () => {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch {
      Alert.alert('Error', 'Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleCreate = async () => {
    if (!title.trim()) return
    try {
      await createTask({ title: title.trim() })
      setTitle('')
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al crear tarea')
    }
  }

  const handleStatus = async (taskId, status) => {
    try {
      await updateTask(taskId, { status })
      load()
    } catch {
      Alert.alert('Error', 'Error al actualizar')
    }
  }

  const handleDelete = (taskId) => {
    Alert.alert('Eliminar tarea', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId)
            load()
          } catch {
            Alert.alert('Error', 'Error al eliminar')
          }
        },
      },
    ])
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas</Text>

      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nueva tarea..."
          placeholderTextColor={COLORS.muted}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
          <Text style={styles.addBtnText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay tareas.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.taskItem, SHADOWS.sm]}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              {item.description && <Text style={styles.taskDesc}>{item.description}</Text>}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || COLORS.muted) + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || COLORS.muted }]}>
                {STATUS_OPTIONS.find((o) => o.value === item.status)?.label || item.status}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {
              const nextStatus = item.status === 'pending' ? 'in_progress' : item.status === 'in_progress' ? 'done' : 'pending'
              handleStatus(item.id, nextStatus)
            }}>
              <Text style={styles.actionText}>Avanzar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  createRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: SPACING.lg, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  taskItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  taskDesc: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  actionText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  deleteText: { color: COLORS.error, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xl },
})

export default TasksScreen
