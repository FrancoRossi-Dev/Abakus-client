import axios from 'axios';
import { getToken, logout } from '../utils/utils';

const backend = axios.create({
  baseURL: 'https://abakus-gamma.vercel.app/v1',
});

// en requests, se intercepta la config
backend.interceptors.request.use((config) => {
  const token = getToken();

  // si hay un token se agrega
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Para las respuestas, este interceptor maneja los errores
backend.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = error.config?.url?.startsWith('/auth/');

    // token vencido o invalido, cierra y manda a login
    // (si varios pedidos fallan juntos, redirige una sola vez)
    if (status === 401 && !isAuthRoute && window.location.pathname !== '/login') {
      logout();
      window.location.href = '/login';
    }

    // mensaje listo para mostrar al usuario
    error.userMessage =
      error.response?.data?.message ||
      (error.request && !error.response ? 'No se pudo conectar con el servidor.' : error.message);

    return Promise.reject(error);
  },
);

export default backend;
