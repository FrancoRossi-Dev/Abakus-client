import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import backend from "../api/backend";

/**
 * Pide un listado paginado al backend y lo cachea por página en un slice
 * creado con createPaginatedSlice. Volver a una página ya pedida no llama al servidor.
 *
 * @param {string}   endpoint     ruta del backend (ej. "/manager")
 * @param {Function} selectState  selector del slice: (state) => state.managers
 * @param {object}   actions      acciones del slice (usa actions.setPage)
 * @param {number}   pageSize     items por página
 */
export const usePaginatedResource = ({
  endpoint,
  selectState,
  actions,
  pageSize = 10,
}) => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  // undefined = la página todavía no está en caché
  const cachedData = useSelector((state) => selectState(state).byPage[page]);
  const pages = useSelector((state) => selectState(state).pages);
  const total = useSelector((state) => selectState(state).total);
  const isCached = cachedData !== undefined;

  // Última lista mostrada: se mantiene mientras carga la siguiente página,
  // así la tabla no desaparece ni cambia de tamaño.
  // (Patrón de React para ajustar estado a partir del store durante el render.)
  const [data, setData] = useState(cachedData);
  if (isCached && cachedData !== data) {
    setData(cachedData);
  }

  // Pide la página al backend solo si no está en caché
  useEffect(() => {
    if (isCached) return;

    let cancelled = false;

    const loadPage = async () => {
      try {
        // El token lo agrega el interceptor de backend.js
        const response = await backend.get(endpoint, {
          params: { page, limit: pageSize },
        });

        if (cancelled) return;

        const { data: items, pages: totalPages, total: totalItems } = response.data;

        // Si la página quedó vacía (ej. se eliminó el último), vuelve a la anterior
        if (items.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }

        dispatch(
          actions.setPage({ page, data: items, pages: totalPages, total: totalItems })
        );
      } catch (error) {
        if (!cancelled) {
          setError(error.userMessage || "No se pudo cargar el listado.");
        }
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [dispatch, actions, endpoint, page, pageSize, isCached]);

  const goToPage = (nextPage) => {
    setError("");
    setPage(nextPage);
  };

  return {
    data, // undefined solo antes de la primera carga
    isLoading: !isCached && !error,
    error,
    page,
    pages,
    total,
    goToPage,
  };
};
