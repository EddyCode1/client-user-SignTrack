import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { authService } from '../../../shared/api/services/authService'
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme'

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const result = await authService.forgotPassword(email)
    if (result.success) setSent(true)
    else Alert.alert('Error', result.error)
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Te enviaremos instrucciones si el correo está registrado.</Text>

        {sent ? (
          <View>
            <Text style={styles.infoText}>
              Si el correo existe en SignTrack, recibirás un enlace de recuperación.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.button}>
              <Text style={styles.buttonText}>Volver al login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar enlace'}</Text>
            </TouchableOpacity>
          </View>
        )}

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
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
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
  infoText: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginBottom: SPACING.md, lineHeight: 20 },
})

export default ForgotPasswordScreen
