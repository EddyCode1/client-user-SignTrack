import { useEffect, useRef, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCallsHubConnection, onIncomingCall } from '../../../shared/api/callsHubService'
import { navigationRef } from '../../../navigation/AppNavigator'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

/**
 * Modal global de llamada entrante.
 * - Se suscribe al hub de llamadas y muestra una UI simple para
 *   aceptar o rechazar la llamada.
 * - Usa `navigationRef` para navegar a la sala cuando se acepta.
 */
const IncomingCallModal = () => {
  const [call, setCall] = useState(null)
  const offRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        await getCallsHubConnection()
        if (cancelled) return

        offRef.current = onIncomingCall(({ roomId, roomTitle, fromDisplayName }) => {
          setCall({ roomId, roomTitle, fromDisplayName })
          Vibration.vibrate([500, 500, 500, 500], true)
        })
      } catch {
        /* hub no disponible todavía */
      }
    }

    init()

    return () => {
      cancelled = true
      offRef.current?.()
      Vibration.cancel()
    }
  }, [])

  const handleAccept = () => {
    Vibration.cancel()
    const { roomId } = call
    setCall(null)
    if (navigationRef.isReady()) {
      navigationRef.navigate('CallRoom', { roomId })
    }
  }

  const handleDecline = () => {
    Vibration.cancel()
    setCall(null)
  }

  if (!call) return null

  return (
    <Modal transparent animationType="slide" visible statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.card, SHADOWS.md]}>
          <Ionicons name="call" size={40} color={COLORS.primary} style={styles.icon} />
          <Text style={styles.from}>{call.fromDisplayName || 'Alguien'}</Text>
          <Text style={styles.title}>{call.roomTitle || 'te invita a una llamada'}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.decline]} onPress={handleDecline}>
              <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.btnText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.accept]} onPress={handleAccept}>
              <Ionicons name="call" size={24} color="#fff" />
              <Text style={styles.btnText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  icon: { marginBottom: SPACING.md },
  from: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  title: { fontSize: FONT_SIZE.md, color: COLORS.muted, marginBottom: SPACING.xl },
  actions: { flexDirection: 'row', gap: SPACING.xl },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    width: 72,
    height: 72,
    gap: 4,
  },
  decline: { backgroundColor: COLORS.error },
  accept: { backgroundColor: COLORS.success },
  btnText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '600' },
})

export default IncomingCallModal
