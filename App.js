// App.tsx
// Punto de entrada de la app.
// Por ahora muestra la pantalla de inicio directamente.

import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Colors } from './constants/color';
import CalendarIcon from './assets/icons/Calendar.svg';
import LogoIcon from './assets/icons/Logos/the-pack-dorado.svg';


export default function App() {
  return (

      <View style={styles.container}>

        {/* Bloque central de contenido */}
        <View style={styles.content}>

        {/* Logo de la barbería encima del título */}
        <LogoIcon
          width={200}
          height={180}
          style={styles.logo}
        />

        {/* Título con dos colores — "The Pack" blanco, "Barber Studio" dorado */}
        <Text style={styles.titleWhite}>The Pack{' '}
          <Text style={styles.titleGold}>Barber{'\n'}Studio</Text>
        </Text>

        {/* Botón principal — Reservar Cita */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            // Cuando el usuario toca el botón, se oscurece ligeramente
            pressed && { backgroundColor: Colors.accentDark }
          ]}
        >
          <CalendarIcon width={20} height={20} fill={Colors.background} />
          <Text style={styles.primaryButtonText}>Reservar Cita</Text>
        </Pressable>
        
        {/* Botón secundario — Mis Citas */}
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && { borderColor: Colors.accentDark }
          ]}
        >
          <Text style={styles.secondaryButtonText}>Mis Citas</Text>
        </Pressable>
        
        </View>
      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  content: {
    width: '100%',
    alignItems: 'center',  // centra todo el contenido horizontalmente
  },
  titleWhite: {
    color: Colors.text,
    fontSize: 38,
    fontWeight: '700',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 20,
  },
  titleGold: {
    // Este estilo se aplica solo al texto "Barber Studio"
    color: Colors.accent,
    fontFamily: 'sans-serif',
    fontSize: 38,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    flexDirection: 'row',   // ícono y texto en la misma fila
    alignItems: 'center',
    gap: 8,                  // espacio entre ícono y texto
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
  buttonIcon: {
    fontSize: 16,
  },
  primaryButtonText: {
    color: Colors.background,
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: '600',
  },
  logo: {
  marginBottom: 24,  // espacio entre el logo y el título
  },
});