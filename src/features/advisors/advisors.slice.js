import { createPaginatedSlice } from "../pagination/createPaginatedSlice";

const advisorsSlice = createPaginatedSlice({ name: "advisors" });

// Acciones genéricas (las usa PaginatedTable)
export const advisorsActions = advisorsSlice.actions;

// Nombres propios del recurso para el resto de la app
export const {
  setPage: setAdvisorsPage,
  updateItem: updateAdvisor,
  invalidate: invalidateAdvisors,
  clear: clearAdvisors,
} = advisorsSlice.actions;

export const selectAdvisors = (state) => state.advisors;

export default advisorsSlice.reducer;
