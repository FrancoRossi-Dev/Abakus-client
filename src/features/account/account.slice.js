import { createSlice } from '@reduxjs/toolkit';

/*
 * Datos del usuario logueado y uso de su plan.
 * Se guardan en Redux porque los leen varias secciones: Inicio, Mi cuenta, Mi plan y Clientes
 * (para saber si todavía puede registrar clientes).
 * Los pedidos a la API los hacen los componentes; acá solo se guarda el resultado.
 */

const initialState = {
  user: null,
  // { planTier, used, limit, clientsRegistered }. limit es null en el plan premium.
  plan: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setPlan: (state, action) => {
      state.plan = action.payload;
      // el plan del usuario se mantiene al día con el del uso
      if (state.user) state.user.planTier = action.payload.planTier;
    },
    clearAccount: () => initialState,
  },
});

export const selectUser = (state) => state.account.user;
export const selectPlan = (state) => state.account.plan;

// Puede registrar otro cliente si el plan no tiene límite o todavía no lo alcanzó.
// Mientras el plan no cargó se deja intentar: la API vuelve a controlar el límite.
export const selectCanAddClient = (state) => {
  const { plan } = state.account;
  return !plan || plan.limit === null || plan.clientsRegistered < plan.limit;
};

export const { setUser, setPlan, clearAccount } = accountSlice.actions;
export default accountSlice.reducer;
