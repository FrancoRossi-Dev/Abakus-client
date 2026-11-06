// Única clave del token en localStorage: el resto de la app usa estas funciones
const TOKEN_KEY = 'abakus-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

// revisa el token para obtener el role
export const getRole = () => {
  const token = getToken();
  if (!token) return null;
  try {
    // lectura de token
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).role ?? null;
  } catch {
    return null;
  }
};

// logout
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  // esto es para borrar el cache
};
