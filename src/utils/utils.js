// revisa el token para obtener el role
export const getRole = () => {
  const token = localStorage.getItem('abakus-token');
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
  localStorage.removeItem('abakus-token');
  // esto es para borrar el cache
};
