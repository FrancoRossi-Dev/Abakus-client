import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from "../features/clients/clients.store";
import managersReducer from "../features/managers/managers.slice";
import banksReducer from "../features/banks/banks.slice";
import issuersReducer from "../features/issuers/issuers.slice";
import instrumentsReducer from "../features/instruments/instruments.slice";
import advisorsReducer from "../features/advisors/advisors.slice";
import reportsReducer from "../features/reports/reports.slice";
import newsAnalysisReducer, { persistNewsAnalysis } from "../features/reports/newsAnalysis.slice";

const store = configureStore({
  reducer: {
    client: clientsReducer,
    managers: managersReducer,
    banks: banksReducer,
    issuers: issuersReducer,
    instruments: instrumentsReducer,
    advisors: advisorsReducer,
    reports: reportsReducer,
    newsAnalysis: newsAnalysisReducer,
  },
});

// El análisis con IA se limita a uno por cliente y por día: sobrevive a una recarga
persistNewsAnalysis(store);

export default store;
