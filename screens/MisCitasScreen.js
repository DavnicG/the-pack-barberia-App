// screens/MisCitasScreen.js
// Pantalla que muestra los turnos del usuario autenticado.
// Al abrirse consulta el endpoint de Django usando el token guardado,
// y muestra cada turno como una tarjeta con sus datos.

import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Pressable, RefreshControl
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';

import { Colors } from '../constants/color';
import { obtenerToken } from '../services/auth';
import { obtenerMisTurnos } from '../services/api';

export default function MisCitasScreen({ navigation }) {

  // turnos: lista de turnos que llegan del servidor
  const [turnos, setTurnos]       = useState([]);

  // cargando: true mientras esperamos la respuesta del servidor
  const [cargando, setCargando]   = useState(true);

  // refrescando: true cuando el usuario arrastra hacia abajo para recargar
  const [refrescando, setRefrescando] = useState(false);

  // error: mensaje de error si algo falla
  const [error, setError]         = useState('');

  // Esta función consulta el endpoint y actualiza el estado.
  // useCallback evita que se recree en cada render innecesariamente.
  const cargarTurnos = useCallback(async (esRefresh = false) => {
    try {
      // Ponemos el estado de carga correcto según si es carga inicial o refresh
      if (esRefresh) {
        setRefrescando(true);
      } else {
        setCargando(true);
      }

      setError('');

      // Obtenemos el token guardado en el dispositivo
      const token = await obtenerToken();

      if (!token) {
        // Si no hay token, algo falló con la sesión
        setError('No hay sesión activa. Por favor inicia sesión.');
        return;
      }

      // Consultamos el endpoint protegido de Django
      const datos = await obtenerMisTurnos(token);
      setTurnos(datos);

    } catch (err) {
      // Mostramos un mensaje amigable según el tipo de error
      if (err.message === 'No autorizado') {
        setError('Tu sesión expiró. Por favor inicia sesión de nuevo.');
      } else {
        setError('No se pudo conectar al servidor. Verifica tu red.');
      }
    } finally {
      // Siempre quitamos los estados de carga al terminar
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // Cargamos los turnos automáticamente al abrir la pantalla
  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  // ── Componente de cada tarjeta de turno ─────────────────────────
  // Recibe un turno y lo renderiza como una tarjeta visual
  const TarjetaTurno = ({ turno }) => {

    // Definimos el color del estado para que sea visual e intuitivo
    const coloresEstado = {
      pendiente:  Colors.warning  || '#F59E0B',
      confirmado: Colors.success  || '#10B981',
      completado: Colors.textMuted,
      cancelado:  Colors.error    || '#EF4444',
    };

    const colorEstado = coloresEstado[turno.estado] || Colors.textMuted;

    return (
      <View style={styles.tarjeta}>

        {/* Fila superior: servicio y estado */}
        <View style={styles.tarjetaHeader}>
          <Text style={styles.servicioTexto}>{turno.servicio_nombre}</Text>
          <View style={[styles.estadoBadge, { borderColor: colorEstado }]}>
            <Text style={[styles.estadoTexto, { color: colorEstado }]}>
              {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
            </Text>
          </View>
        </View>

        {/* Datos del turno */}
        <View style={styles.tarjetaBody}>
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>📅 Fecha</Text>
            <Text style={styles.datoValor}>{turno.fecha}</Text>
          </View>
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>🕐 Hora</Text>
            <Text style={styles.datoValor}>{turno.hora}</Text>
          </View>
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>✂️ Barbero</Text>
            <Text style={styles.datoValor}>{turno.barbero_nombre}</Text>
          </View>
          <View style={styles.datoFila}>
            <Text style={styles.datoLabel}>💳 Pago</Text>
            <Text style={styles.datoValor}>
              {turno.metodo_pago.charAt(0).toUpperCase() + turno.metodo_pago.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ── Pantalla de carga inicial ────────────────────────────────────
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.cargandoTexto}>Cargando tus citas...</Text>
      </View>
    );
  }

  // ── Pantalla de error ────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>{error}</Text>
        <Pressable style={styles.botonReintentar} onPress={() => cargarTurnos()}>
          <Text style={styles.botonReintentarTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  // ── Pantalla principal ───────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Encabezado */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </Pressable>
        <Text style={styles.titulo}>Mis Citas</Text>
      </View>

      {/* Lista de turnos o estado vacío */}
      <FlatList
        data={turnos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TarjetaTurno turno={item} />}
        contentContainerStyle={[
          styles.lista,
          // Si no hay turnos, centramos el mensaje vacío
          turnos.length === 0 && styles.listaCentrada,
        ]}
        // Pull-to-refresh: el usuario arrastra hacia abajo para recargar
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => cargarTurnos(true)}
            tintColor={Colors.accent}
          />
        }
        // Estado vacío cuando no hay citas
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioIcono}>📅</Text>
            <Text style={styles.vacioTitulo}>Sin citas por ahora</Text>
            <Text style={styles.vacioSubtitulo}>
              Tus próximas citas aparecerán aquí
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Encabezado con botón volver y título
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#2a2a2a',
  },

  botonVolver: {
    marginBottom: 8,
  },

  botonVolverTexto: {
    color: Colors.accent,
    fontSize: 16,
  },

  titulo: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },

  // Lista de tarjetas
  lista: {
    padding: 20,
    gap: 16,
  },

  listaCentrada: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Tarjeta individual de turno
  tarjeta: {
    backgroundColor: Colors.surface || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border || '#2a2a2a',
  },

  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  servicioTexto: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },

  // Badge de estado (confirmado, pendiente, etc.)
  estadoBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  estadoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },

  tarjetaBody: {
    gap: 8,
  },

  datoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  datoLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },

  datoValor: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },

  // Estados de carga, error y vacío
  centrado: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  cargandoTexto: {
    color: Colors.textMuted,
    marginTop: 12,
    fontSize: 15,
  },

  errorTexto: {
    color: Colors.error || '#EF4444',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },

  botonReintentar: {
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  botonReintentarTexto: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },

  // Estado vacío
  vacio: {
    alignItems: 'center',
    gap: 8,
  },

  vacioIcono: {
    fontSize: 48,
    marginBottom: 8,
  },

  vacioTitulo: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },

  vacioSubtitulo: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});