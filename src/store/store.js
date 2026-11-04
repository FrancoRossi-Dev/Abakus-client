import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from "../features/clients/clients.store";
import managersReducer from "../features/managers/managers.slice";

const store = configureStore({
  reducer: {
    client: clientsReducer,
    managers: managersReducer,
  },
});

export default store;
