import { createSlice } from '@reduxjs/toolkit';

/*
 * Cartera de clientes del advisor logueado (el "documento" principal de la aplicación).
 * Se guarda en Redux porque la usan varias páginas: Clientes, Detalle y Reportes.
 * Los pedidos a la API los hacen los componentes; acá solo se guarda el resultado.
 */

const initialState = {
  items: [],
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.items = action.payload;
    },
    // Reemplaza un cliente editado (o lo agrega si todavía no estaba en la lista)
    clientSaved: (state, action) => {
      const index = state.items.findIndex((client) => client._id === action.payload._id);
      if (index === -1) state.items.push(action.payload);
      else state.items[index] = action.payload;
    },
    clientRemoved: (state, action) => {
      state.items = state.items.filter((client) => client._id !== action.payload);
    },
    clearClients: () => initialState,
  },
});

export const selectClients = (state) => state.clients.items;

export const { setClients, clientSaved, clientRemoved, clearClients } = clientsSlice.actions;
export default clientsSlice.reducer;
