// Pantalla de calendario: muestra un calendario mensual, permite crear citas
// y ver/iniciar reuniones asociadas. Comentarios añadidos para explicar
// la intención de cada bloque y las funciones principales.
// - Estado local: items, contacts, loading, selección, formulario
// - Carga de datos: `load()` obtiene citas y directorio
// - Utilidades: `getDaysInMonth`, `isSameDay`, `selectedDayEvents`
// - Acciones: `handleCreate` (crea cita y envía invitaciones),
//   `handleStartMeeting` (inicia reunión y navega a sala)

import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput, Modal, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { createAppointment, getAppointments, startAppointmentMeeting } from '../../../shared/api/services/appointmentService'
import { getDirectory } from '../../../shared/api/services/userService'
import { createRequest } from '../../../shared/api/services/requestService'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'
import { formatDate, formatTime } from '../../../shared/utils/formatters'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const CalendarScreen = ({ navigation }) => {
  const [items, setItems] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [inviteIds, setInviteIds] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [appointments, directory] = await Promise.all([
        getAppointments(),
        getDirectory(''),
      ])
      setItems(Array.isArray(appointments) ? appointments : [])
      setContacts(Array.isArray(directory) ? directory : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return []
    return items.filter((item) => {
      const start = new Date(item.startUtc)
      const end = new Date(item.endUtc)
      const dayStart = new Date(selectedDay)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDay)
      dayEnd.setHours(23, 59, 59, 999)
      return start <= dayEnd && end >= dayStart
    })
  }, [items, selectedDay])

  const toggleInvite = (userId) => {
    setInviteIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleCreate = async () => {
    if (!title.trim()) return
    try {
      const appointment = await createAppointment({
        title: title.trim(),
        startUtc: startDate.toISOString(),
        endUtc: endDate.toISOString(),
        participantUserIds: inviteIds,
      })

      await Promise.all(
        inviteIds.map((toUserId) =>
          createRequest({
            type: 'meeting',
            toUserId,
            appointmentId: appointment.id,
            message: `Invitación a la cita: ${appointment.title}`,
          })
        )
      )

      setTitle('')
      setInviteIds([])
      setShowForm(false)
      load()
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Error al crear cita')
    }
  }

  const handleStartMeeting = async (appointment) => {
    try {
      const updated = await startAppointmentMeeting(appointment.id)
      navigation.navigate('CallRoom', { roomId: updated.roomId })
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo iniciar reunión')
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7
    const days = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    return days
  }

  const days = getDaysInMonth(new Date())

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  }

  const today = new Date()
  const isSameDay = (a, b) => a && b && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Calendario</Text>

      <TouchableOpacity style={styles.newBtn} onPress={() => {
        setShowForm(true)
        const d = new Date()
        d.setHours(9, 0, 0, 0)
        setStartDate(d)
        const e = new Date(d)
        e.setHours(10, 0, 0, 0)
        setEndDate(e)
      }}>
        <Text style={styles.newBtnText}>Nueva cita</Text>
      </TouchableOpacity>

      <View style={[styles.calendarCard, SHADOWS.sm]}>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((label) => (
            <Text key={label} style={styles.weekday}>{label}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((day, index) => {
            const hasEvents = day && items.some((item) => {
              const start = new Date(item.startUtc)
              const end = new Date(item.endUtc)
              const d = new Date(day)
              d.setHours(0, 0, 0, 0)
              const de = new Date(day)
              de.setHours(23, 59, 59, 999)
              return start <= de && end >= d
            })
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day && isSameDay(day, today) && styles.todayCell,
                  day && selectedDay && isSameDay(day, selectedDay) && styles.selectedCell,
                ]}
                onPress={() => day && setSelectedDay(day)}
                disabled={!day}
              >
                <Text style={[styles.dayText, day && isSameDay(day, today) && styles.todayText]}>
                  {day ? day.getDate() : ''}
                </Text>
                {hasEvents && <View style={styles.dot} />}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {selectedDay && (
        <View style={[styles.eventsCard, SHADOWS.sm]}>
          <Text style={styles.eventsTitle}>Eventos del {formatDate(selectedDay.toISOString())}</Text>
          {selectedDayEvents.length === 0 ? (
            <Text style={styles.emptyText}>Sin eventos este día.</Text>
          ) : (
            selectedDayEvents.map((item) => (
              <View key={item.id} style={styles.eventItem}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventMeta}>
                    {formatTime(item.startUtc)} — {formatTime(item.endUtc)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.meetingBtn} onPress={() => handleStartMeeting(item)}>
                  <Text style={styles.meetingBtnText}>Reunión</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agendar cita</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Título de la cita" placeholderTextColor={COLORS.muted} />
            <Text style={styles.label}>Participantes</Text>
            <ScrollView style={styles.contactList}>
              {contacts.length === 0 ? (
                <Text style={styles.emptyText}>No hay contactos disponibles.</Text>
              ) : (
                contacts.map((c) => (
                  <TouchableOpacity key={c._id} style={styles.contactRow} onPress={() => toggleInvite(c._id)}>
                    <Text style={inviteIds.includes(c._id) ? styles.contactSelected : styles.contactName}>
                      {inviteIds.includes(c._id) ? '✓ ' : ''}{c.name} {c.surname} (@{c.username})
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                <Text style={styles.saveBtnText}>Guardar cita</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  newBtn: { marginBottom: SPACING.md },
  newBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '600' },
  calendarCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.lg },
  weekdayRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  weekday: { flex: 1, textAlign: 'center', fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.muted },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  todayCell: { backgroundColor: COLORS.primary + '20' },
  selectedCell: { backgroundColor: COLORS.primary },
  dayText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  todayText: { color: COLORS.primary, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 2 },
  eventsCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.lg },
  eventsTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  eventItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  eventMeta: { fontSize: FONT_SIZE.xs, color: COLORS.muted, marginTop: 2 },
  meetingBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  meetingBtnText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, maxHeight: '80%' },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  contactList: { maxHeight: 200, marginBottom: SPACING.md },
  contactRow: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  contactName: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  contactSelected: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, padding: SPACING.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: SPACING.md, alignItems: 'center' },
  cancelBtnText: { color: COLORS.text, fontWeight: '600' },
  emptyText: { color: COLORS.muted, fontSize: FONT_SIZE.sm, textAlign: 'center', padding: SPACING.md },
})

export default CalendarScreen
