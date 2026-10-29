import { createSlice } from '@reduxjs/toolkit';

// viky este es un ejemplo de slice

const initialState = {
  foo: 'bar',
};

export const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    reducer1: (red) => {
      red;
    },
    reducer2: (red) => {
      red;
    },
  },
});

export const { reducer1, reducer2 } = clientSlice.actions;
export default clientSlice.reducer;
