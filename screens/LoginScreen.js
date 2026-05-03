// screens/LoginScreen.js
// Pantalla de Login — estructura visual base.
// Por ahora solo muestra el diseño y el botón de volver.
// La autenticación real con Django la conectaremos más adelante.

import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Colors } from '../constants/color';
// Nota: usamos '../' porque este archivo está dentro de la carpeta screens/
// y necesitamos subir un nivel para llegar a constants/

// navigation es una prop que React Navigation inyecta automáticamente
// en todas las pantallas registradas en el Stack
export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      {/* navigation.goBack() regresa a la pantalla anterior en la pila
          En este caso vuelve al Home automáticamente */}
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </Pressable>

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
  title: {
    color: Colors.accent,           // dorado — igual que los acentos del Home
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textMuted,        // gris suave — texto secundario
    fontSize: 16,
    marginBottom: 40,
  },
  backButton: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  backButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});