import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { authService } from '../../../shared/api/services/authService'
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme'

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({ name: '', surname: '', username: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.name || !form.surname || !form.username || !form.email || !form.password || !form.phone) {
      Alert.alert('Error', 'Todos los campos son requeridos')
      return
    }
    setLoading(true)
    const result = await authService.register(form)
    if (result.success) {
      Alert.alert('Éxito', 'Usuario registrado exitosamente')
      navigation.navigate('Login')
    } else {
      Alert.alert('Error', result.error)
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a la plataforma inclusiva SignTrack</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={(v) => handleChange('name', v)} />

          <Text style={styles.label}>Apellido</Text>
          <TextInput style={styles.input} value={form.surname} onChangeText={(v) => handleChange('surname', v)} />

          <Text style={styles.label}>Usuario</Text>
          <TextInput style={styles.input} value={form.username} onChangeText={(v) => handleChange('username', v)} autoCapitalize="none" />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={(v) => handleChange('email', v)} autoCapitalize="none" keyboardType="email-address" />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={form.password} onChangeText={(v) => handleChange('password', v)} secureTextEntry />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput style={styles.input} value={form.phone} onChangeText={(v) => handleChange('phone', v)} keyboardType="phone-pad" maxLength={8} />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: SPACING.xl },
  title: { fontSize: FONT_SIZE.huge, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginTop: SPACING.xl },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.muted, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl },
  form: { marginBottom: SPACING.lg },
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
})

export default RegisterScreen
