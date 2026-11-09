import { useSyncExternalStore } from 'react';

/*
 * Tema claro / oscuro. El tema vive en <html data-theme="...">: App.css redefine los primitivos
 * con ese atributo y el resto de la interfaz lo hereda por los tokens semánticos.
 *
 * Prioridad: la elección del usuario (localStorage) y, si no eligió, la preferencia del sistema.
 * index.html aplica el tema antes de cargar React, para que no haya un destello del tema equivocado.
 */

export const THEME_STORAGE_KEY = 'abakus-theme';

const readStored = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
};

const systemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const getTheme = () => document.documentElement.dataset.theme ?? readStored() ?? systemTheme();

export const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // sin localStorage el tema se aplica igual, solo no se recuerda
  }
};

export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');

// Se observa el atributo: cualquier cambio de tema re-renderiza a quien use useTheme()
const subscribe = (onChange) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Si el usuario nunca eligió, se sigue al sistema cuando este cambia
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  const onSystemChange = (event) => {
    if (!readStored()) document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
  };
  media?.addEventListener('change', onSystemChange);

  return () => {
    observer.disconnect();
    media?.removeEventListener('change', onSystemChange);
  };
};

export const useTheme = () => useSyncExternalStore(subscribe, getTheme);

// Valor actual de un token CSS (para librerías que dibujan en canvas, como Chart.js)
export const readToken = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
