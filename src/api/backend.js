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

/*
 * Reintento automático ante fallas de red.
 * La API corre en Vercel (serverless): tras un rato sin uso, el primer pedido puede caer mientras
 * la función arranca y se conecta a la base, y Vercel responde sin cabeceras CORS. El navegador lo
 * ve como "sin respuesta". Esperar un momento y repetir el pedido suele alcanzar.
 *
 * Solo se reintenta cuando es seguro hacerlo:
 * - pedidos GET (repetirlos no crea ni modifica datos)
 * - sin respuesta del servidor (un 4xx/5xx con respuesta es un error real y se muestra tal cual)
 * - no cancelados ni vencidos por timeout
 * - sin `retry: false` en la config (ej. el análisis con IA: repetirlo gastaría otra consulta)
 */
const RETRY_DELAYS_MS = [1000, 2000];

const shouldRetry = (error) => {
  const { config } = error;
  if (!config || config.retry === false) return false;
  if ((config.method ?? 'get').toLowerCase() !== 'get') return false;
  if (error.response || !error.request) return false;
  if (axios.isCancel(error) || error.code === 'ECONNABORTED') return false;
  return (config.retryCount ?? 0) < RETRY_DELAYS_MS.length;
};

// Para las respuestas, este interceptor maneja los errores
backend.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldRetry(error)) {
      const { config } = error;
      const attempt = config.retryCount ?? 0;
      config.retryCount = attempt + 1;
      // espera 1 s (y después 2 s) antes de repetir el mismo pedido
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      return backend(config);
    }

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
