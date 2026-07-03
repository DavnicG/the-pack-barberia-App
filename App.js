// App.js
// Punto de entrada principal de la aplicación.
// Aquí centralizamos el estado global de autenticación:
// - verificamos si existe una sesión guardada al abrir la app
// - guardamos en memoria si el usuario está autenticado
// - actualizamos Home inmediatamente después del login sin reiniciar la app

import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { Colors } from './constants/color';
import CalendarIcon from './assets/icons/Calendar.svg';
import LogoIcon from './assets/icons/Logos/the-pack-dorado.svg';
import LoginScreen from './screens/LoginScreen';
import MisCitasScreen from './screens/MisCitasScreen';
import ReservarCitaScreen from './screens/ReservarCitaScreen';

import {
  haySession,
  obtenerUsuario,
  borrarToken,
} from './services/auth';

// Creamos el Stack Navigator.
// Este objeto maneja las pantallas como una pila.
const Stack = createNativeStackNavigator();


// HomeScreen: pantalla principal de la app.
// Recibe props extra desde App para poder reaccionar al estado de sesión.
function HomeScreen({ navigation, autenticado, usuario, onLogout }) {
  // Elegimos qué dato mostrar en el saludo.
  // Si existe nombre, lo usamos; si no, mostramos el email.
  const nombreMostrado = usuario?.nombre || usuario?.email || 'usuario';

  // Acción del botón principal.
  // Si el usuario ya inició sesión, más adelante esto llevará
  // a la pantalla real de reservas.
  // Si no inició sesión, lo llevamos a Login.
  const handlePrimaryAction = () => {
    if (autenticado) {
      navigation.navigate('ReservarCita'); // temporal
    } else {
      navigation.navigate('Login');
    }
  };

  // Acción del botón secundario.
  // Si hay sesión, luego llevará a Mis Citas.
  // Si no hay sesión, por ahora puede llevar a Login.
  const handleSecondaryAction = () => {
    if (autenticado) {
      navigation.navigate('MisCitas'); 
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo principal de la barbería */}
        <LogoIcon width={180} height={170} style={styles.logo} />

        {/* Título principal */}
        <Text style={styles.titleWhite}>
          The Pack <Text style={styles.titleGold}>Barber{'\n'}Studio</Text>
        </Text>

        {/* Saludo personalizado solo si hay sesión */}
        {autenticado && (
          <Text style={styles.greetingText}>
            Hola, {nombreMostrado}
          </Text>
        )}

        {/* Botón principal */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { backgroundColor: Colors.accentDark },
          ]}
          onPress={handlePrimaryAction}
        >
          <CalendarIcon width={20} height={20} fill={Colors.background} />
          <Text style={styles.primaryButtonText}>
            {autenticado ? 'Reservar Cita' : 'Entrar'}
          </Text>
        </Pressable>

        {/* Botón secundario */}
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && { borderColor: Colors.accentDark },
          ]}
          onPress={handleSecondaryAction}
        >
          <Text style={styles.secondaryButtonText}>
            {autenticado ? 'Mis Citas' : 'Ver Servicios'}
          </Text>
        </Pressable>

        {/* Botón de cerrar sesión — solo visible si existe sesión */}
        {autenticado && (
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.75 },
            ]}
            onPress={onLogout}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}


// Componente raíz de la aplicación.
export default function App() {
  // cargando controla si todavía estamos revisando el almacenamiento local
  const [cargando, setCargando] = useState(true);

  // autenticado indica si hay sesión activa en memoria
  const [autenticado, setAutenticado] = useState(false);

  // usuario guarda los datos del usuario autenticado
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Esta función se ejecuta una sola vez al abrir la app.
    // Lee el token guardado y, si existe, carga también el usuario.
    const verificarSesion = async () => {
      try {
        const existeSesion = await haySession();
        setAutenticado(existeSesion);

        if (existeSesion) {
          const usuarioGuardado = await obtenerUsuario();
          setUsuario(usuarioGuardado);
        } else {
          setUsuario(null);
        }
      } catch (error) {
        console.log('Error verificando la sesión:', error);
        setAutenticado(false);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, []);

  // Esta función se ejecuta inmediatamente después del login exitoso.
  // LoginScreen nos enviará los datos del usuario ya autenticado.
  // Aquí actualizamos el estado global para que Home se re-renderice al instante.
  const handleLoginSuccess = (userData) => {
    setAutenticado(true);
    setUsuario(userData);
  };

  // Esta función cierra sesión:
  // 1. borra el token local
  // 2. limpia el usuario en memoria
  // 3. hace que Home cambie automáticamente al estado no autenticado
  const handleLogout = async () => {
    try {
      await borrarToken();
      setAutenticado(false);
      setUsuario(null);
    } catch (error) {
      console.log('Error cerrando sesión:', error);
    }
  };

  // Mientras se revisa el almacenamiento local, mostramos carga.
  // Esto evita renders prematuros con datos incompletos.
  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        {/* Home recibe props adicionales desde App */}
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              autenticado={autenticado}
              usuario={usuario}
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>

        {/* Login también recibe la función que avisa a App
            cuando el login fue exitoso */}
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </Stack.Screen>
        {/* Muestra las citas del cliente */}
        <Stack.Screen name="MisCitas" component={MisCitasScreen} />
        {/* Pantalla para reservar una nueva cita */}
        <Stack.Screen
          name="ReservarCita"
          component={ReservarCitaScreen}
          options={{
            headerShown: true,
            title: 'Reservar Cita',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.accent,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  logo: {
    marginBottom: 24,
  },

  titleWhite: {
    color: Colors.text,
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 12,
  },

  titleGold: {
    color: Colors.accent,
    fontSize: 38,
    fontWeight: '700',
  },

  greetingText: {
    color: Colors.textMuted,
    fontSize: 16,
    marginBottom: 28,
    textAlign: 'center',
  },

  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    width: '100%',
    justifyContent: 'center',
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },

  logoutButton: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  logoutButtonText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '600',
  },

  primaryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});