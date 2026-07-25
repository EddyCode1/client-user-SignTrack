import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { authService } from '../../../shared/api/services/authService'
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme'

const ResetPasswordScreen = ({ navigation, route }) => {
  const tokenParam = route?.params?.token || ''
  const [token, setToken] = useState(tokenParam)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const result = await authService.resetPassword(token, password)
    if (result.success) {
      Alert.alert('Éxito', 'Contraseña actualizada')
      navigation.navigate('Login')
    } else {
      Alert.alert('Error', result.error)
    }
    setLoading(false)
  }

  const isValid = token && password.length >= 8 && password === confirm

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>Ingresa el token de recuperación y tu nueva contraseña.</Text>

        <Text style={styles.label}>Token de recuperación</Text>
        <TextInput style={styles.input} value={token} onChangeText={setToken} />

        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry />

        {password && confirm && password !== confirm && (
          <Text style={styles.error}>Las contraseñas no coinciden</Text>
        )}

        <TouchableOpacity style={[styles.button, (!isValid || loading) && styles.buttonDisabled]} onPress={handleSubmit} disabled={!isValid || loading}>
          <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Restablecer contraseña'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Volver al login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: 'center', padding: SPACING.xl },
  title: { fontSize: FONT_SIZE.huge, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: SPACING.md, fontSize: FONT_SIZE.sm },
  error: { color: COLORS.error, fontSize: FONT_SIZE.xs, marginTop: SPACING.xs },
})

export default ResetPasswordScreen
