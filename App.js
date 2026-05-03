// App.js
// Punto de entrada principal de la aplicación.
// Aquí configuramos la navegación global — todas las pantallas
// deben estar registradas en este archivo para poder usarlas.

import { StyleSheet, Text, View, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// NavigationContainer: componente raíz de React Navigation.
// DEBE envolver toda la app — sin él, la navegación no funciona.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
// createNativeStackNavigator: crea un navegador tipo "pila".
// Funciona como una torre de cartas — al navegar se apila una pantalla
// encima de la otra, y al volver atrás se retira la del tope.

import { Colors } from './constants/color';
import CalendarIcon from './assets/icons/Calendar.svg';
import LogoIcon from './assets/icons/Logos/the-pack-dorado.svg';
import LoginScreen from './screens/LoginScreen';

// Creamos el objeto Stack que nos da dos componentes:
// - Stack.Navigator: contenedor que gestiona el historial de pantallas
// - Stack.Screen: representa una pantalla individual registrada
const Stack = createNativeStackNavigator();

// HomeScreen es un componente separado dentro del mismo archivo.
// React Navigation le pasa automáticamente la prop "navigation"
// a toda pantalla registrada en el Stack — no necesitamos pasarla manualmente.
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>

        {/* Logo de la barbería — SVG vectorial, se puede escalar sin pixelarse */}
        <LogoIcon width={180} height={170} style={styles.logo} />

        {/* Título con dos estilos de color anidados en el mismo bloque de texto */}
        <Text style={styles.titleWhite}>
          The Pack <Text style={styles.titleGold}>Barber{'\n'}Studio</Text>
        </Text>

        {/* Botón principal — navega a la pantalla Login al presionar */}
        {/* pressed es un estado que React Native pasa automáticamente
            y nos permite cambiar el estilo cuando el usuario toca el botón */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { backgroundColor: Colors.accentDark }
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          {/* Ícono SVG — fill controla su color */}
          <CalendarIcon width={20} height={20} fill={Colors.background} />
          <Text style={styles.primaryButtonText}>Reservar Cita</Text>
        </Pressable>

        {/* Botón secundario — también navega a Login por ahora */}
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && { borderColor: Colors.accentDark }
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Mis Citas</Text>
        </Pressable>

      </View>
    </View>
  );
}

// App es el componente raíz que exportamos.
// Su única responsabilidad es configurar la navegación global.
export default function App() {
  return (
    // NavigationContainer gestiona el árbol de navegación completo
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"   // primera pantalla que se muestra al abrir la app
        screenOptions={{
          headerShown: false,     // ocultamos la barra de título en todas las pantallas
          contentStyle: { backgroundColor: Colors.background },   // Cambia la animación a una más suave tipo "fade"
          animation: 'fade',
        }}
      >
        {/* Cada Stack.Screen registra una pantalla con un nombre único.
            Ese nombre es el que usamos en navigation.navigate('nombre') */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                        // ocupa toda la pantalla
    backgroundColor: Colors.background,
    justifyContent: 'center',       // centra verticalmente
    alignItems: 'center',           // centra horizontalmente
    padding: 28,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 24,               // espacio entre logo y título
  },
  titleWhite: {
    color: Colors.text,
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 48,                 // altura de cada línea de texto
    marginBottom: 20,
  },
  titleGold: {
    color: Colors.accent,           // solo "Barber Studio" lleva el color dorado
    fontSize: 38,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    flexDirection: 'row',           // ícono y texto en la misma fila
    alignItems: 'center',
    gap: 8,                         // espacio entre ícono y texto
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
  primaryButtonText: {
    color: Colors.background,       // texto oscuro sobre fondo dorado
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: Colors.accent,           // texto dorado sobre fondo transparente
    fontSize: 16,
    fontWeight: '600',
  },
});