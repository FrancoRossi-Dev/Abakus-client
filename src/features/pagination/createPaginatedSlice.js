import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Caché de páginas ya pedidas al backend: { [numeroDePagina]: [items] }
  byPage: {},
  pages: 1,
  total: 0,
};

/**
 * Crea un slice con caché por página para cualquier listado paginado del backend
 * (respuestas con forma { data, page, pages, total }).
 *
 * Acciones generadas:
 * - setPage({ page, data, pages, total }): guarda una página recibida
 * - updateItem(item): reemplaza el item (por idKey) en la página donde esté cacheado
 * - invalidate(): descarta la caché (crear/eliminar corre los items entre páginas);
 *   mantiene pages/total para que la paginación no salte mientras recarga
 * - clear(): vuelve al estado inicial (ej. al cerrar sesión)
 *
 * `reducers` permite sumar reducers propios del recurso.
 */
export const createPaginatedSlice = ({ name, idKey = "_id", reducers = {} }) =>
  createSlice({
    name,
    initialState,
    reducers: {
      setPage: (state, action) => {
        const { page, data, pages, total } = action.payload;
        state.byPage[page] = data;
        state.pages = Math.max(pages, 1);
        state.total = total;
      },

      updateItem: (state, action) => {
        Object.values(state.byPage).forEach((list) => {
          const index = list.findIndex(
            (item) => item[idKey] === action.payload[idKey]
          );

          if (index !== -1) {
            list[index] = action.payload;
          }
        });
      },

      invalidate: (state) => {
        state.byPage = {};
      },

      clear: () => initialState,

      ...reducers,
    },
  });
