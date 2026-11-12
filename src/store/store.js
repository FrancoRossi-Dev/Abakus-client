import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from '../features/clients/clients.slice';
import accountReducer from '../features/account/account.slice';
import newsAnalysisReducer, { persistNewsAnalysis } from '../features/reports/newsAnalysis.slice';

// Solo va a Redux lo que comparten varias páginas:
// - clients: la cartera (Clientes, Detalle, Reportes)
// - account: el usuario y su plan (Inicio, Mi cuenta, Mi plan, Clientes)
// - newsAnalysis: el análisis con IA de cada cliente, guardado por el resto del día
const store = configureStore({
  reducer: {
    clients: clientsReducer,
    account: accountReducer,
    newsAnalysis: newsAnalysisReducer,
  },
});

// El análisis con IA se limita a uno por cliente y por día: sobrevive a una recarga
persistNewsAnalysis(store);

export default store;
