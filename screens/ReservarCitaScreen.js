// screens/ReservarCitaScreen.js
// Pantalla para que el cliente reserve una nueva cita desde la app.
// Flujo: elige barbero → servicio → fecha → hora → método de pago → confirmar

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  obtenerBarberos,
  obtenerServicios,
  obtenerHorasOcupadas,
  crearTurno,
} from '../services/api';
import { Colors } from '../constants/color';

// Horas disponibles durante el día (horario de la barbería)
const HORAS_DIA = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

// Métodos de pago que acepta la barbería
const METODOS_PAGO = [
  { label: '💵 Efectivo',      value: 'efectivo' },
  { label: '💳 Tarjeta',       value: 'tarjeta' },
  { label: '🏦 Transferencia', value: 'transferencia' },
];

export default function ReservarCitaScreen({ navigation }) {

  // ── Estados del formulario ────────────────────────────────────
  const [barberos,    setBarberos]    = useState([]);
  const [servicios,   setServicios]   = useState([]);
  const [horasOcup,   setHorasOcup]   = useState([]);

  const [barberoSel,  setBarberoSel]  = useState(null);
  const [servicioSel, setServicioSel] = useState(null);
  const [fecha,       setFecha]       = useState('');
  const [horaSel,     setHoraSel]     = useState('');
  const [metodoPago,  setMetodoPago]  = useState('efectivo');

  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);

  // Al montar la pantalla, cargamos barberos y servicios del servidor
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cada vez que cambia el barbero o la fecha, consultamos las horas ocupadas
  // Esto permite mostrar en gris las horas que ya están reservadas
  useEffect(() => {
    if (barberoSel && fecha) {
      cargarHorasOcupadas();
    } else {
      setHorasOcup([]);
    }
    setHoraSel(''); // Reseteamos la hora al cambiar barbero o fecha
  }, [barberoSel, fecha]);

  // ── Funciones de carga ────────────────────────────────────────

  const cargarDatosIniciales = async () => {
    try {
      const token = await SecureStore.getItemAsync('barberia_token');
      // Promise.all pide los dos al mismo tiempo (más rápido que uno por uno)
      const [listaBarberos, listaServicios] = await Promise.all([
        obtenerBarberos(token),
        obtenerServicios(token),
      ]);
      setBarberos(listaBarberos);
      setServicios(listaServicios);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los datos. Verifica tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  const cargarHorasOcupadas = async () => {
    try {
      const token = await SecureStore.getItemAsync('barberia_token');
      const ocupadas = await obtenerHorasOcupadas(token, barberoSel.id, fecha);
      setHorasOcup(ocupadas);
    } catch (e) {
      setHorasOcup([]); // Si falla, no bloqueamos la pantalla
    }
  };

  // ── Genera las fechas de los próximos 14 días ─────────────────
  // Devuelve un array de objetos { iso: 'YYYY-MM-DD', etiqueta: 'Vie 4 Jul' }
  const generarFechas = () => {
    const fechas = [];
    const hoy    = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      const iso      = d.toISOString().split('T')[0];
      const etiqueta = d.toLocaleDateString('es-CO', {
        weekday: 'short', day: 'numeric', month: 'short'
      });
      fechas.push({ iso, etiqueta });
    }
    return fechas;
  };

  // ── Envía el formulario al servidor ───────────────────────────
  const handleReservar = async () => {
    if (!barberoSel || !servicioSel || !fecha || !horaSel) {
      Alert.alert('Faltan datos', 'Por favor selecciona barbero, servicio, fecha y hora.');
      return;
    }
    setEnviando(true);
    try {
      const token = await SecureStore.getItemAsync('barberia_token');
      const { status, data } = await crearTurno(token, {
        barbero_id:  barberoSel.id,
        servicio_id: servicioSel.id,
        fecha,
        hora:        horaSel,
        metodo_pago: metodoPago,
      });

      if (status === 201) {
        // Cita creada → mostramos resumen y navegamos a Mis Citas
        Alert.alert(
          '¡Cita reservada! ✅',
          `Barbero: ${data.barbero}\nServicio: ${data.servicio}\nFecha: ${data.fecha}\nHora: ${data.hora}`,
          [{ text: 'Ver mis citas', onPress: () => navigation.navigate('MisCitas') }]
        );
      } else {
        Alert.alert('No se pudo reservar', data.error || 'Error desconocido.');
      }
    } catch (e) {
      Alert.alert('Error de conexión', 'Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  // ── Pantalla de carga inicial ─────────────────────────────────
  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={estilos.cargandoTexto}>Cargando datos...</Text>
      </View>
    );
  }

  // ── Formulario principal ──────────────────────────────────────
  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={{ paddingBottom: 40 }}>

      <Text style={estilos.titulo}>Reservar Cita</Text>

      {/* SECCIÓN 1: Barbero */}
      <Text style={estilos.etiqueta}>✂️ Elige tu barbero</Text>
      <View style={estilos.fila}>
        {barberos.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[estilos.chip, barberoSel?.id === b.id && estilos.chipActivo]}
            onPress={() => setBarberoSel(b)}
          >
            <Text style={[estilos.chipTexto, barberoSel?.id === b.id && estilos.chipTextoActivo]}>
              {b.nombre}
            </Text>
            {b.especialidad ? <Text style={estilos.chipSub}>{b.especialidad}</Text> : null}
          </TouchableOpacity>
        ))}
      </View>

      {/* SECCIÓN 2: Servicio */}
      <Text style={estilos.etiqueta}>💈 Elige un servicio</Text>
      <View style={estilos.fila}>
        {servicios.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[estilos.chip, servicioSel?.id === s.id && estilos.chipActivo]}
            onPress={() => setServicioSel(s)}
          >
            <Text style={[estilos.chipTexto, servicioSel?.id === s.id && estilos.chipTextoActivo]}>
              {s.nombre}
            </Text>
            {s.precio ? (
              <Text style={estilos.chipSub}>${Number(s.precio).toLocaleString('es-CO')}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      {/* SECCIÓN 3: Fecha */}
      <Text style={estilos.etiqueta}>📅 Elige una fecha</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.scrollH}>
        {generarFechas().map((f) => (
          <TouchableOpacity
            key={f.iso}
            style={[estilos.chipFecha, fecha === f.iso && estilos.chipActivo]}
            onPress={() => setFecha(f.iso)}
          >
            <Text style={[estilos.chipTexto, fecha === f.iso && estilos.chipTextoActivo]}>
              {f.etiqueta}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* SECCIÓN 4: Hora — solo aparece cuando hay barbero y fecha seleccionados */}
      {barberoSel && fecha ? (
        <>
          <Text style={estilos.etiqueta}>⏰ Elige una hora</Text>
          <View style={estilos.filaHoras}>
            {HORAS_DIA.map((h) => {
              const ocupada = horasOcup.includes(h); // ya reservada por otro cliente
              const activa  = horaSel === h;
              return (
                <TouchableOpacity
                  key={h}
                  disabled={ocupada}
                  style={[estilos.chipHora, activa && estilos.chipActivo, ocupada && estilos.chipOcupado]}
                  onPress={() => setHoraSel(h)}
                >
                  <Text style={[
                    estilos.chipHoraTexto,
                    activa  && estilos.chipTextoActivo,
                    ocupada && estilos.chipOcupadoTexto,
                  ]}>
                    {h}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : (
        <Text style={estilos.ayuda}>
          👆 Selecciona un barbero y una fecha para ver las horas disponibles
        </Text>
      )}

      {/* SECCIÓN 5: Método de pago */}
      <Text style={estilos.etiqueta}>💳 Método de pago</Text>
      <View style={estilos.fila}>
        {METODOS_PAGO.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[estilos.chip, metodoPago === m.value && estilos.chipActivo]}
            onPress={() => setMetodoPago(m.value)}
          >
            <Text style={[estilos.chipTexto, metodoPago === m.value && estilos.chipTextoActivo]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTÓN CONFIRMAR */}
      <TouchableOpacity
        style={[estilos.boton, enviando && estilos.botonDeshabilitado]}
        onPress={handleReservar}
        disabled={enviando}
      >
        {enviando
          ? <ActivityIndicator color={Colors.background} />
          : <Text style={estilos.botonTexto}>Confirmar Reserva</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

// ── Estilos — paleta oscura con dorado (igual que el resto de la app) ──
const estilos = StyleSheet.create({
  contenedor:       { flex: 1, backgroundColor: Colors.background, padding: 16 },
  centrado:         { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  titulo:           { fontSize: 26, fontWeight: 'bold', color: Colors.accent, marginBottom: 20, marginTop: 10 },
  etiqueta:         { fontSize: 15, color: Colors.text, marginTop: 20, marginBottom: 10, fontWeight: '600' },
  ayuda:            { color: Colors.textMuted, marginTop: 12, fontStyle: 'italic', textAlign: 'center' },
  cargandoTexto:    { color: Colors.accent, marginTop: 10 },

  fila:             { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scrollH:          { marginBottom: 4 },

  chip: {
    borderWidth: 1, borderColor: Colors.accent,
    borderRadius: 10, padding: 10,
    minWidth: 100, alignItems: 'center',
  },
  chipActivo:       { backgroundColor: Colors.accent },
  chipTexto:        { color: Colors.accent, fontWeight: '600' },
  chipTextoActivo:  { color: Colors.background },
  chipSub:          { color: Colors.textMuted, fontSize: 12, marginTop: 3 },

  chipFecha: {
    borderWidth: 1, borderColor: Colors.accent,
    borderRadius: 10, padding: 10,
    marginRight: 8, alignItems: 'center', minWidth: 80,
  },

  filaHoras:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipHora: {
    borderWidth: 1, borderColor: Colors.accent,
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12,
    alignItems: 'center', minWidth: 70,
  },
  chipHoraTexto:       { color: Colors.accent, fontWeight: '600' },
  chipOcupado:         { borderColor: '#444', backgroundColor: '#2A2A2A' },
  chipOcupadoTexto:    { color: '#555' },

  boton: {
    backgroundColor: Colors.accent, padding: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 30,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto:         { color: Colors.background, fontWeight: 'bold', fontSize: 16 },
});