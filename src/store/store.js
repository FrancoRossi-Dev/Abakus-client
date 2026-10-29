import { configureStore } from '@reduxjs/toolkit';
import { clientSlice } from '../features/clients/clients.store';

const store = configureStore({
  reducer: {
    client: clientSlice,
  },
});

export default store;
