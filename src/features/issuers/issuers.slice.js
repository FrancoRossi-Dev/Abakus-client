import { createPaginatedSlice } from "../pagination/createPaginatedSlice";

const issuersSlice = createPaginatedSlice({ name: "issuers" });

// Acciones genéricas (las usa PaginatedTable)
export const issuersActions = issuersSlice.actions;

// Nombres propios del recurso para el resto de la app
export const {
  setPage: setIssuersPage,
  updateItem: updateIssuer,
  invalidate: invalidateIssuers,
  clear: clearIssuers,
} = issuersSlice.actions;

export const selectIssuers = (state) => state.issuers;

export default issuersSlice.reducer;
