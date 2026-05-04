// screens/LoginScreen.js
// Pantalla de Login.
// Permite autenticarse con email y contraseña.
// Si el login es exitoso:
// 1. guarda token y usuario en SecureStore
// 2. avisa a App.js para actualizar el estado global
// 3. vuelve a Home con la UI actualizada al instante

import { useState } from 'react';
import {
  StyleSheet, Text, View, Pressable,
  TextInput, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator
} from 'react-native';

import { Colors } from '../constants/color';
import { loginUser } from '../services/api';
import { guardarToken } from '../services/auth';

// Recibimos:
// - navigation: lo inyecta React Navigation
// - onLoginSuccess: función enviada desde App.js para actualizar
//   el estado global inmediatamente después del login
export default function LoginScreen({ navigation, onLoginSuccess }) {
  // Estado del input email
  const [email, setEmail] = useState('');

  // Estado del input password
  const [password, setPassword] = useState('');

  // Estado del mensaje de error
  const [error, setError] = useState('');

  // Estado de carga para mostrar spinner y bloquear doble envío
  const [loading, setLoading] = useState(false);

  // Función que se ejecuta al presionar "Iniciar Sesión"
  const handleLogin = async () => {
    // Validación básica local
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Hacemos la petición al backend Django
      const data = await loginUser(email, password);

      // Si Django respondió con error de credenciales
      if (data.error) {
        setError(data.error);
        return;
      }

      // Construimos el objeto del usuario que guardaremos localmente
      // y que también enviaremos a App.js para refrescar Home al instante
      const userData = {
        user_id: data.user_id,
        email: data.email,
        nombre: data.nombre, // si aún no existe, quedará undefined y no rompe nada
      };

      // Guardamos token + usuario en el dispositivo
      await guardarToken(data.token, userData);

      // Avisamos a App.js que el login fue exitoso
      // para actualizar autenticado y usuario en memoria
      onLoginSuccess(userData);

      // Reemplazamos Login por Home
      // Esto evita que el botón "atrás" regrese a Login después de autenticarse
      navigation.replace('Home');

    } catch (err) {
      console.log('❌ Error de red:', err.message);
      setError('No se pudo conectar al servidor. Verifica tu red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado */}
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

        {/* Campo de correo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Campo de contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>

        {/* Mensaje de error */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Botón principal */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { backgroundColor: Colors.accentDark },
            loading && { opacity: 0.7 },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          )}
        </Pressable>

        {/* Botón volver */}
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 28,
  },

  title: {
    color: Colors.accent,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    marginBottom: 40,
  },

  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },

  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginBottom: 16,
  },

  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },

  primaryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },

  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  backButtonText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
});