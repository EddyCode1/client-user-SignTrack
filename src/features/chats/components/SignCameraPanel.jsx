// Panel de cámara para reconocimiento de señas.
// - Captura frames periódicamente y pide predicción al servicio
// - Acumula letras estables y permite enviar texto resultante
import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { recognitionClient } from '../../../shared/api/recognitionClient'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const CAPTURE_INTERVAL_MS = 1500
const STABLE_FRAMES_NEEDED = 2

/**
 * Panel de cámara para reconocimiento de señas (letras A-Z).
 * Captura un frame cada 1.5s, lo envía al endpoint /predict-letter,
 * acumula letras estables y llama onSend cuando el usuario confirma.
 */
const SignCameraPanel = ({ onSend, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions()
  const [open, setOpen] = useState(false)
  const [accumulated, setAccumulated] = useState('')
  const [lastLetter, setLastLetter] = useState('')
  const [stableCount, setStableCount] = useState(0)
  const [recognizing, setRecognizing] = useState(false)
  const cameraRef = useRef(null)
  const intervalRef = useRef(null)

  const captureAndPredict = useCallback(async () => {
    if (!cameraRef.current) return
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        base64: false,
        skipProcessing: true,
      })

      const formData = new FormData()
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'frame.jpg',
      })

      const result = await recognitionClient.predictLetter(formData)

      if (result?.success && result.label) {
        const letter = result.label.toUpperCase()
        setLastLetter(letter)
        setStableCount((prev) => {
          const next = prev + 1
          if (next >= STABLE_FRAMES_NEEDED) {
            setAccumulated((acc) => acc + letter)
            return 0
          }
          return next
        })
      }
    } catch {
      /* error silencioso en captura */
    }
  }, [])

  useEffect(() => {
    if (!open) return
    intervalRef.current = setInterval(captureAndPredict, CAPTURE_INTERVAL_MS)
    setRecognizing(true)
    return () => {
      clearInterval(intervalRef.current)
      setRecognizing(false)
    }
  }, [open, captureAndPredict])

  const handleOpen = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert('Permiso requerido', 'Activa el permiso de cámara en la configuración del dispositivo.')
        return
      }
    }
    setOpen(true)
    setAccumulated('')
    setLastLetter('')
  }

  const handleSend = () => {
    const text = accumulated.trim()
    if (!text) return
    onSend?.(text)
    setAccumulated('')
    setLastLetter('')
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    setAccumulated('')
    setLastLetter('')
    onClose?.()
  }

  if (!open) {
    return (
      <TouchableOpacity style={styles.toggleBtn} onPress={handleOpen}>
        <Ionicons name="hand-left-outline" size={20} color={COLORS.primary} />
        <Text style={styles.toggleBtnText}>Señas</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, SHADOWS.md]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reconocimiento de señas</Text>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front" />
        {recognizing && (
          <View style={styles.overlay}>
            <Text style={styles.letterDisplay}>{lastLetter || '—'}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.accumulatedWrap}>
          <Text style={styles.accumulatedLabel}>Texto acumulado:</Text>
          <Text style={styles.accumulatedText} numberOfLines={2}>
            {accumulated || '(mostrando letras...)'}
          </Text>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { setAccumulated(''); setLastLetter('') }}
          >
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, !accumulated && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!accumulated}
          >
            <Text style={styles.sendBtnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  toggleBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },

  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },

  cameraWrap: { height: 200, position: 'relative' },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  letterDisplay: { color: '#fff', fontSize: FONT_SIZE.huge, fontWeight: '700' },

  footer: { padding: SPACING.md },
  accumulatedWrap: { marginBottom: SPACING.sm },
  accumulatedLabel: { fontSize: FONT_SIZE.xs, color: COLORS.muted, marginBottom: 2 },
  accumulatedText: { fontSize: FONT_SIZE.md, color: COLORS.text, fontWeight: '600' },
  footerActions: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'flex-end' },
  clearBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  clearBtnText: { color: COLORS.muted, fontSize: FONT_SIZE.sm },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '700' },
})

export default SignCameraPanel
