import { createPaginatedSlice } from "../pagination/createPaginatedSlice";

const banksSlice = createPaginatedSlice({ name: "banks" });

// Acciones genéricas (las usa PaginatedTable)
export const banksActions = banksSlice.actions;

// Nombres propios del recurso para el resto de la app
export const {
  setPage: setBanksPage,
  updateItem: updateBank,
  invalidate: invalidateBanks,
  clear: clearBanks,
} = banksSlice.actions;

export const selectBanks = (state) => state.banks;

export default banksSlice.reducer;
