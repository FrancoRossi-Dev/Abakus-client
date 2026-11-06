import { createPaginatedSlice } from "../pagination/createPaginatedSlice";

const instrumentsSlice = createPaginatedSlice({ name: "instruments" });

// Acciones genéricas (las usa PaginatedTable)
export const instrumentsActions = instrumentsSlice.actions;

// Nombres propios del recurso para el resto de la app
export const {
  setPage: setInstrumentsPage,
  updateItem: updateInstrument,
  invalidate: invalidateInstruments,
  clear: clearInstruments,
} = instrumentsSlice.actions;

export const selectInstruments = (state) => state.instruments;

export default instrumentsSlice.reducer;
