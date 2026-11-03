import { createSlice } from "@reduxjs/toolkit";

const managersSlice = createSlice({
  name: "managers",

  initialState: {
    list: [],
  },

  reducers: {
    setManagers: (state, action) => {
      state.list = action.payload;
    },

    addManager: (state, action) => {
      state.list.push(action.payload);
    },

    updateManager: (state, action) => {
      const index = state.list.findIndex(
        (manager) => manager._id === action.payload._id
      );

      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },

    removeManager: (state, action) => {
      state.list = state.list.filter(
        (manager) => manager._id !== action.payload
      );
    },
  },
});

export const {
  setManagers,
  addManager,
  updateManager,
  removeManager,
} = managersSlice.actions;

export default managersSlice.reducer;