import { createSlice } from '@reduxjs/toolkit';

/*
 * Caché del análisis de noticias con IA, por cliente y por día.
 *
 * La llamada a la IA es lenta (hasta ~1 minuto) y tiene un cupo diario limitado, así que
 * cada cliente se analiza como máximo una vez por día. El resultado se guarda en Redux y
 * también en localStorage, para que una recarga de la página no vuelva a pedirlo.
 * Al cambiar el día, el análisis guardado deja de valer y se puede generar uno nuevo.
 * Los errores no se guardan: se puede reintentar enseguida.
 * El pedido a la API lo hace NewsAnalysis.jsx; acá solo se guarda el estado de cada cliente.
 */

export const NEWS_ANALYSIS_STORAGE_KEY = 'abakus-news-analysis';

// Fecha local AAAA-MM-DD (no UTC: en Uruguay el día UTC cambia a las 21:00)
export const getToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

// Solo se recuperan los análisis de hoy; los de días anteriores se descartan
const loadStored = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(NEWS_ANALYSIS_STORAGE_KEY)) ?? {};
    const today = getToday();
    return Object.fromEntries(Object.entries(stored).filter(([, entry]) => entry?.day === today));
  } catch {
    return {};
  }
};

const saveStored = (byClient) => {
  try {
    // Solo se persisten los análisis completos
    const succeeded = Object.fromEntries(
      Object.entries(byClient).filter(([, entry]) => entry.status === 'succeeded'),
    );
    localStorage.setItem(NEWS_ANALYSIS_STORAGE_KEY, JSON.stringify(succeeded));
  } catch {
    // Sin localStorage (modo privado, cuota llena) la caché vive solo en memoria
  }
};

const newsAnalysisSlice = createSlice({
  name: 'newsAnalysis',
  initialState: () => ({ byClient: loadStored() }),
  reducers: {
    analysisStarted: (state, action) => {
      state.byClient[action.payload.clientId] = { status: 'loading' };
    },
    // payload: { clientId, generatedAt, report }
    analysisSucceeded: (state, action) => {
      const { clientId, generatedAt, report } = action.payload;
      state.byClient[clientId] = { status: 'succeeded', day: getToday(), generatedAt, report };
    },
    analysisFailed: (state, action) => {
      state.byClient[action.payload.clientId] = { status: 'failed', error: action.payload.error };
    },
    clearNewsAnalysis: (state) => {
      state.byClient = {};
    },
  },
});

// Guarda en localStorage cada vez que llega un análisis nuevo (se registra en el store)
export const persistNewsAnalysis = (store) => {
  let previous = store.getState().newsAnalysis.byClient;
  store.subscribe(() => {
    const current = store.getState().newsAnalysis.byClient;
    if (current !== previous) {
      previous = current;
      saveStored(current);
    }
  });
};

// Un análisis de un día anterior cuenta como inexistente
export const selectNewsAnalysis = (clientId) => (state) => {
  const entry = state.newsAnalysis.byClient[clientId];
  if (entry?.status === 'succeeded' && entry.day !== getToday()) return undefined;
  return entry;
};

export const { analysisStarted, analysisSucceeded, analysisFailed, clearNewsAnalysis } =
  newsAnalysisSlice.actions;
export default newsAnalysisSlice.reducer;
