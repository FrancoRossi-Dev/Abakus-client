import { BrowserRouter, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import "./styles/patterns.css";
import store from "./store/store";

import AuthWrapper from "./pages/wrappers/AuthWrapper";
import GuestLayout from "./pages/layouts/GuestLayout";
import Layout from "./pages/layouts/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Accounts from "./pages/Accounts";
import Managers from "./pages/Managers";
import Unauthorized from "./pages/generic/Unauthorized";
import NotFound from "./pages/generic/NotFound";

import Clients from "./pages/Advisor/Clients";
import ClientDetail from "./pages/Advisor/ClientDetail";
import UpgradePlan from "./pages/Advisor/UpgradePlan";
import Reports from "./pages/Advisor/Reports";

import Advisors from "./pages/Admin/Advisors";
import Banks from "./pages/Admin/Banks";
import Issuers from "./pages/Admin/Issuers";
import Instruments from "./pages/Admin/Instruments";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<AuthWrapper />}>
            <Route element={<Layout />}>
              <Route index path="/" element={<Home />} />

              {/* rutas compartidas */}
              <Route element={<AuthWrapper allowedRoles={["advisor", "admin"]} />}>
                <Route path="/managers" element={<Managers />} />
              </Route>

              {/* rutas de advisor */}
              <Route element={<AuthWrapper allowedRoles={["advisor"]} />}>
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:clientId" element={<ClientDetail />} />
                <Route path="/account" element={<Accounts />} />
                <Route path="/upgrade" element={<UpgradePlan />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* rutas de administrador */}
              <Route element={<AuthWrapper allowedRoles={["admin"]} />}>
                <Route path="/advisors" element={<Advisors />} />
                <Route path="/banks" element={<Banks />} />
                <Route path="/issuers" element={<Issuers />} />
                <Route path="/instruments" element={<Instruments />} />
              </Route>
            </Route>
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </Provider>
  );
}

export default App;
