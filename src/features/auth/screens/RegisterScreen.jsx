import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { authService } from '../../../shared/api/services/authService';
import { useAuthStore } from '../../../shared/store/authStore';
import { isClientRole } from '../../../shared/auth/roles';

/**
 * RegisterScreen
 * Pantalla de registro para nuevos clientes
 */
const RegisterScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      nombre: '',
      username: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
    }
  });
  const password = watch('password');

  const { login } = useAuthStore();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.register({
        nombre: data.nombre,
        username: data.username,
        email: data.email,
        telefono: data.telefono,
        password: data.password,
      });

      if (res.success) {
        const loginResult = await authService.login(data.email, data.password);
        const role = loginResult.user?.rol || loginResult.user?.role;
        if (loginResult.success && loginResult.token && isClientRole(role)) {
          await login(
            loginResult.token,
            loginResult.user,
            loginResult.refreshToken,
            loginResult.expiresAt,
          );
          Alert.alert('Éxito', 'Cuenta creada. ¡Bienvenido!');
        } else {
          Alert.alert('Éxito', 'Cuenta creada. Inicia sesión con tu correo.');
          navigation.navigate('Login');
        }
      } else {
        Alert.alert('Error', res.error || 'No se pudo crear la cuenta');
      }
    } catch {
      Alert.alert('Error', 'No se pudo crear la cuenta, intenta de nuevo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.badge}>NUEVO ACCESO</Text>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para gestionar tus pedidos y reservas.</Text>
      </View>

      {/* Form Fields using Controller for React Native compatibility */}
      {[
        { name: 'nombre', label: 'Nombre completo', placeholder: 'Tu nombre' },
        { name: 'username', label: 'Usuario', placeholder: 'nombre_usuario' },
        { name: 'email', label: 'Correo electrónico', placeholder: 'tu@email.com', keyboard: 'email-address' },
        { name: 'telefono', label: 'Teléfono', placeholder: '123456789', keyboard: 'phone-pad' },
      ].map((field) => (
        <View key={field.name} style={styles.inputGroup}>
          <Text style={styles.label}>{field.label}</Text>
          <Controller
            control={control}
            rules={{ required: `${field.label} requerido` }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#A1A1AA"
                onChangeText={onChange}
                value={value}
                keyboardType={field.keyboard || 'default'}
              />
            )}
            name={field.name}
          />
          {errors[field.name] && <Text style={styles.errorText}>{errors[field.name].message}</Text>}
        </View>
      ))}

      {/* Password Fields */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contraseña</Text>
        <Controller
          control={control}
          rules={{ required: 'Contraseña requerida' }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#A1A1AA" onChangeText={onChange} value={value} secureTextEntry />
          )}
          name="password"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar contraseña</Text>
        <Controller
          control={control}
          rules={{
            required: 'Confirmar contraseña',
            validate: (value) => value === password || 'Las contraseñas no coinciden',
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#A1A1AA" onChangeText={onChange} value={value} secureTextEntry />
          )}
          name="confirmPassword"
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.footerLink}>¿Ya tienes cuenta? <Text style={styles.boldLink}>Inicia sesión</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { padding: 20, backgroundColor: '#FAFAFA' },
  header: { marginBottom: 30 },
  badge: { fontSize: 10, fontWeight: '700', color: '#52525B', backgroundColor: '#E4E4E7', paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', borderRadius: 12 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#18181B', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#52525B', marginTop: 5 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#3F3F46', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D4D4D8', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12 },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 3 },
  button: { backgroundColor: '#18181B', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
  footerLink: { textAlign: 'center', marginTop: 20, color: '#52525B', fontSize: 14 },
  boldLink: { fontWeight: '700', color: '#18181B' }
});

export default RegisterScreen;