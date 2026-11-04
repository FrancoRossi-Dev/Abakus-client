import { createPaginatedSlice } from "../pagination/createPaginatedSlice";

const managersSlice = createPaginatedSlice({ name: "managers" });

// Acciones genéricas (las usa PaginatedTable)
export const managersActions = managersSlice.actions;

// Nombres propios del recurso para el resto de la app
export const {
  setPage: setManagersPage,
  updateItem: updateManager,
  invalidate: invalidateManagers,
  clear: clearManagers,
} = managersSlice.actions;

export const selectManagers = (state) => state.managers;

export default managersSlice.reducer;
