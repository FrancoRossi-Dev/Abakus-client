import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from "../features/clients/clients.store";
import managersReducer from "../features/managers/managers.slice";
import banksReducer from "../features/banks/banks.slice";
import issuersReducer from "../features/issuers/issuers.slice";
import instrumentsReducer from "../features/instruments/instruments.slice";
import advisorsReducer from "../features/advisors/advisors.slice";
import reportsReducer from "../features/reports/reports.slice";

const store = configureStore({
  reducer: {
    client: clientsReducer,
    managers: managersReducer,
    banks: banksReducer,
    issuers: issuersReducer,
    instruments: instrumentsReducer,
    advisors: advisorsReducer,
    reports: reportsReducer,
  },
});

export default store;
