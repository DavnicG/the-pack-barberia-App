// services/api.js — versión de prueba con fetch nativo
const BASE_URL = 'http://192.168.1.5:8000';

export const loginUser = async (email, password) => {
  console.log('📡 Intentando conectar a:', BASE_URL);
  
  const response = await fetch(`${BASE_URL}/api/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  console.log('📨 Status recibido:', response.status);
  
  const data = await response.json();
  return data;
};