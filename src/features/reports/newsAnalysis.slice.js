import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import backend from '../../api/backend';

/*
 * Caché del análisis de noticias con IA, por cliente y por día.
 *
 * La llamada a la IA es lenta (hasta ~1 minuto) y tiene un cupo diario limitado, así que
 * cada cliente se analiza como máximo una vez por día. El resultado se guarda en Redux y
 * también en localStorage, para que una recarga de la página no vuelva a pedirlo.
 * Al cambiar el día, el análisis guardado deja de valer y se puede generar uno nuevo.
 * Los errores no se guardan: se puede reintentar enseguida.
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

// La API responde en inglés: se traduce por código de estado para mostrarlo al usuario
const ERROR_MESSAGES = {
  404: 'Este cliente no tiene posiciones informadas en los últimos 30 días.',
  429: 'Se alcanzó el límite de análisis con IA. Probá de nuevo en unos minutos.',
  503: 'El servicio de análisis con IA no está disponible en este momento. Probá más tarde.',
};

const isFreshToday = (entry) => entry?.status === 'succeeded' && entry.day === getToday();

export const fetchNewsAnalysis = createAsyncThunk(
  'newsAnalysis/fetch',
  async ({ clientId }, { rejectWithValue }) => {
    try {
      const { data } = await backend.get(`/report/client/${clientId}/news`, {
        params: { lang: 'es' },
        // la API espera hasta ~2 minutos a la IA (60 s + un reintento)
        timeout: 150_000,
        // sin reintento automático: una falla de red puede llegar después de que la IA ya
        // procesó el pedido, y repetirlo gastaría otra consulta del cupo
        retry: false,
      });
      return { generatedAt: data.date, report: data.data };
    } catch (err) {
      const status = err.response?.status;
      return rejectWithValue(
        ERROR_MESSAGES[status] ||
          (err.code === 'ECONNABORTED' ?
            'El análisis tardó demasiado en responder. Probá de nuevo.'
          : err.userMessage || 'No se pudo generar el análisis.'),
      );
    }
  },
  {
    // No se vuelve a llamar a la IA si ya hay un análisis de hoy o uno en curso
    condition: ({ clientId }, { getState }) => {
      const entry = getState().newsAnalysis.byClient[clientId];
      return entry?.status !== 'loading' && !isFreshToday(entry);
    },
  },
);

const newsAnalysisSlice = createSlice({
  name: 'newsAnalysis',
  initialState: () => ({ byClient: loadStored() }),
  reducers: {
    clearNewsAnalysis: (state) => {
      state.byClient = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsAnalysis.pending, (state, action) => {
        state.byClient[action.meta.arg.clientId] = { status: 'loading' };
      })
      .addCase(fetchNewsAnalysis.fulfilled, (state, action) => {
        state.byClient[action.meta.arg.clientId] = {
          status: 'succeeded',
          day: getToday(),
          ...action.payload,
        };
      })
      .addCase(fetchNewsAnalysis.rejected, (state, action) => {
        state.byClient[action.meta.arg.clientId] = {
          status: 'failed',
          error: action.payload ?? 'No se pudo generar el análisis.',
        };
      });
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

export const { clearNewsAnalysis } = newsAnalysisSlice.actions;
export default newsAnalysisSlice.reducer;
