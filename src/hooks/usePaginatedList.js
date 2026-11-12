import { useEffect, useState } from 'react';
import backend from '../api/backend';

/**
 * Pide al backend una página de un listado paginado (respuesta { data, page, pages, total }).
 * Lo usan las páginas de catálogos: cada una es dueña de su lista y la recarga después de
 * crear, editar o borrar.
 *
 * Devuelve:
 * - data: items de la página actual (undefined antes de la primera carga)
 * - page, pages, total
 * - isLoading, error
 * - goToPage(n): cambia de página
 * - reload(n?): vuelve a pedir la página actual (o la página n)
 */
export const usePaginatedList = (endpoint, pageSize = 10) => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: undefined, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cambiarlo vuelve a disparar el pedido aunque la página sea la misma
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Si se cambia de página antes de que llegue la respuesta, la vieja se ignora
    let cancelled = false;

    const loadPage = async () => {
      try {
        // El token lo agrega el interceptor de backend.js
        const response = await backend.get(endpoint, { params: { page, limit: pageSize } });
        if (cancelled) return;

        const { data, pages, total } = response.data;

        // Si la página quedó vacía (ej. se borró su último item), se pasa a la anterior
        if (data.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }

        setResult({ data, pages: Math.max(pages, 1), total });
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err.userMessage || 'No se pudo cargar el listado.');
        setIsLoading(false);
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [endpoint, page, pageSize, reloadKey]);

  // Mientras carga, la tabla sigue mostrando la lista anterior (con un indicador encima)
  const goToPage = (nextPage) => {
    setError('');
    setIsLoading(true);
    setPage(nextPage);
  };

  const reload = (nextPage = page) => {
    setError('');
    setIsLoading(true);
    setPage(nextPage);
    setReloadKey((key) => key + 1);
  };

  return { ...result, page, isLoading, error, goToPage, reload };
};
