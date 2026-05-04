// services/auth.js
// Servicio de autenticación local.
// Aquí centralizamos todo lo relacionado con la sesión:
// guardar token, leer token, leer usuario y cerrar sesión.

import * as SecureStore from 'expo-secure-store';

// Claves internas usadas para guardar los datos en SecureStore.
// Estas claves funcionan como el nombre del "cajón" donde guardamos cada dato.
const TOKEN_KEY = 'barberia_token';
const USER_KEY = 'barberia_user';

// Guarda el token y los datos básicos del usuario.
// userData puede traer cosas como:
// { user_id, email, nombre }
export const guardarToken = async (token, userData) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
};

// Devuelve el token guardado o null si no existe.
export const obtenerToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// Devuelve el usuario guardado convertido desde JSON.
// Si no hay datos, devuelve null.
export const obtenerUsuario = async () => {
  const userData = await SecureStore.getItemAsync(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Borra completamente la sesión local.
// Eliminamos tanto el token como los datos del usuario.
export const borrarToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};

// Revisa si existe sesión activa.
// Si hay token, asumimos que el usuario está autenticado localmente.
export const haySession = async () => {
  const token = await obtenerToken();
  return token !== null;
};