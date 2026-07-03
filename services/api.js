// services/api.js
// Este archivo centraliza todas las peticiones HTTP al backend Django.
// Aquí definimos las funciones que la app usa para comunicarse con el servidor.

// IP de tu PC en la red local — cámbiala si cambia tu red
const BASE_URL = 'http://192.168.1.6:8000';

// ── Login ────────────────────────────────────────────────────────
// Envía email y contraseña, recibe el token si las credenciales son correctas
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

// ── Mis Turnos ───────────────────────────────────────────────────
// Obtiene los turnos del usuario autenticado.
// Requiere el token guardado en SecureStore para que Django
// sepa de qué usuario traer los datos.
export const obtenerMisTurnos = async (token) => {
  const response = await fetch(`${BASE_URL}/turnos/api/mis-turnos/`, {
    method: 'GET',
    headers: {
      // Así Django identifica al usuario: "Token abc123..."
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Si Django responde 401 (token inválido o expirado),
  // lanzamos un error para que la pantalla lo pueda manejar
  if (response.status === 401) {
    throw new Error('No autorizado');
  }

  return await response.json();
};

// Obtiene todos los barberos disponibles para mostrar en el selector
export const obtenerBarberos = async (token) => {
  const response = await fetch(`${BASE_URL}/turnos/api/barberos/`, {
    headers: { 'Authorization': `Token ${token}` },
  });
  return await response.json();
};

// Obtiene todos los servicios disponibles para mostrar en el selector
export const obtenerServicios = async (token) => {
  const response = await fetch(`${BASE_URL}/turnos/api/servicios/`, {
    headers: { 'Authorization': `Token ${token}` },
  });
  return await response.json();
};

// Obtiene las horas ya ocupadas de un barbero en una fecha
// Así la pantalla puede deshabilitar esas horas para el usuario
export const obtenerHorasOcupadas = async (token, barberoId, fecha) => {
  const response = await fetch(
    `${BASE_URL}/turnos/api/horas-ocupadas/?barbero_id=${barberoId}&fecha=${fecha}`,
    { headers: { 'Authorization': `Token ${token}` } }
  );
  const data = await response.json();
  return data.ocupadas; // Devuelve solo el array de horas ocupadas
};

// Crea un turno nuevo enviando todos los datos del formulario
export const crearTurno = async (token, datos) => {
  const response = await fetch(`${BASE_URL}/turnos/api/crear/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });
  return { status: response.status, data: await response.json() };
};