import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme'

const IncomingCallModal = ({ callerName, roomId, onAccept, onDecline }) => (
  <View style={styles.overlay}>
    <View style={styles.card}>
      <Ionicons name="call-outline" size={48} color={COLORS.success} />
      <Text style={styles.title}>Llamada entrante</Text>
      <Text style={styles.caller}>{callerName || 'Usuario'}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onDecline(roomId)} style={styles.declineBtn}>
          <Ionicons name="close" size={24} color="#fff" />
          <Text style={styles.btnText}>Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAccept(roomId)} style={styles.acceptBtn}>
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.btnText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '80%',
    ...SHADOWS.md,
  },
  title: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginTop: SPACING.sm, color: COLORS.text },
  caller: { fontSize: FONT_SIZE.md, color: COLORS.muted, marginTop: SPACING.xs },
  actions: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.lg },
  declineBtn: {
    backgroundColor: COLORS.error,
    borderRadius: 40,
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 40,
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: FONT_SIZE.xs, marginTop: 2 },
})

export default IncomingCallModal
