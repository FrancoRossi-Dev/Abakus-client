import { createSlice } from "@reduxjs/toolkit";

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    clientId: null,
    byInstrumentType: [],
  },
  reducers: {
    setAllocation: (state, action) => {
      state.clientId = action.payload.clientId;
      state.byInstrumentType = action.payload.byInstrumentType;
    },
  },
});

export const { setAllocation } = reportsSlice.actions;
export default reportsSlice.reducer;