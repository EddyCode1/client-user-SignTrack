import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../../shared/store/authStore';
import { authService } from '../../../shared/api/services/authService';
import { isClientRole } from '../../../shared/auth/roles';

/**
 * LoginScreen
 * Pantalla de acceso para clientes
 */
const LoginScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuthStore();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data.email, data.password);

      if (!result.success) {
        Alert.alert('Error', result.error || 'Credenciales inválidas');
        return;
      }

      const role = result.user?.rol || result.user?.role;
      if (!isClientRole(role)) {
        Alert.alert('Acceso denegado', 'Esta aplicación es exclusiva para clientes.');
        return;
      }

      login(result.token, result.user, result.refreshToken, result.expiresAt);
    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Omakase</Text>

      <Controller
        control={control}
        rules={{ required: 'Email requerido' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>
        )}
        name="email"
      />

      <Controller
        control={control}
        rules={{ required: 'Contraseña requerida' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#888"
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>
        )}
        name="password"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000' },
  title: { fontSize: 32, color: '#fff', textAlign: 'center', marginBottom: 40, fontWeight: 'bold' },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 8 },
  errorText: { color: '#ff4d4d', fontSize: 12, marginTop: 5 },
  button: { backgroundColor: '#e67e22', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkText: { color: '#aaa', textAlign: 'center', marginTop: 20 }
});

export default LoginScreen;