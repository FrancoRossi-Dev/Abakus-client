import { createSlice } from '@reduxjs/toolkit';

// viky este es un ejemplo de slice

const initialState = {
  clients: [],
};

export const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    addToSlice: (state, action) => {
      state.clients.push(...action.payload);
    },
  },
});

export const { addToSlice } = clientSlice.actions;
export default clientSlice.reducer;
