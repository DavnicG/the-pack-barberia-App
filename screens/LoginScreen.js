// screens/LoginScreen.js
// Pantalla de Login — estructura visual base.
// Por ahora solo muestra el diseño y el botón de volver.
// La autenticación real con Django la conectaremos más adelante.


// screens/LoginScreen.js
import { useState } from 'react';
import {
  StyleSheet, Text, View, Pressable,
  TextInput, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator
} from 'react-native';
import { Colors } from '../constants/color';
import { loginUser } from '../services/api';

// navigation es una prop que React Navigation inyecta automáticamente
// en todas las pantallas registradas en el Stack
export default function LoginScreen({ navigation }) {

    // Estado para guardar lo que el usuario escribe en cada campo
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estado para mostrar u ocultar errores de validación
    const [error, setError] = useState('');

    // loading muestra un spinner mientras espera la respuesta del servidor
    const [loading, setLoading] = useState(false);    

    // Función que se ejecuta al presionar "Iniciar Sesión"
    const handleLogin = async () => {
        console.log('🔵 Botón presionado');
       if(!email || !password){
        setError('Por favor completa todos los campos.');
        return;
       }
       setError('');
       console.log('🟡 Llamando a Django...')
       setLoading(true);// activamos el spinner

       try{
            // Llamamos al backend Django
            const data = await loginUser(email, password);
            console.log('✅ Respuesta:', data);
            // Si llegamos aquí, el login fue exitoso
            // data.token contiene el token que Django nos devolvió
            // Verificamos si Django devolvió error
            if (data.error) {
            setError(data.error); // muestra "Credenciales incorrectas"
            return;
            }
            // Solo llegamos aquí si hay token
            console.log('🎫 Token:', data.token);
            setError('✅ Login exitoso');

            } catch (err) {
                console.log('❌ Error:', err.message);
                setError('No se pudo conectar al servidor.');
            } finally {
                setLoading(false);
            }
    };

    return (

        // KeyboardAvoidingView ajusta la pantalla cuando aparece el teclado
        // behavior="padding" en iOS sube el contenido, en Android no es necesario
        <KeyboardAvoidingView
            style={{flex:1}}
                behavior={Platform.OS === 'ios' ? 'padding': undefined}>
            {/* ScrollView permite hacer scroll si el teclado tapa contenido */}
            <ScrollView
                contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled">
                {/* Encabezado */}
                <Text style={styles.title}>Iniciar Sesión</Text>
                <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

                {/* Campo de Email */}
                <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                    style={styles.input}
                    placeholder="tu@correo.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}       // actualiza el estado con cada letra
                    keyboardType="email-address"  // muestra teclado con @ visible
                    autoCapitalize="none"         // evita mayúscula automática
                    autoCorrect={false}
                />
                </View>

                {/* Campo de Contraseña */}
                <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}        // oculta los caracteres de la contraseña
                />
                </View>

                {/* Mensaje de error — solo se muestra si hay un error */}
                {error ? (
                <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {/* Botón principal */}
                <Pressable
                style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { backgroundColor: Colors.accentDark }
                ]}
                onPress={handleLogin}
                >
                <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                </Pressable>

                {/* Volver al Home */}
                <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                >
                <Text style={styles.backButtonText}>← Volver</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,                        // permite que ScrollView ocupe toda la pantalla
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
    color: Colors.text,                 // texto blanco para la etiqueta
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,   // fondo ligeramente más claro que el fondo
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,         // borde sutil
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,                // rojo para errores
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