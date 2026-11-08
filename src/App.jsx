import { BrowserRouter, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthWrapper from "./pages/wrappers/AuthWrapper";
import GuestLayout from "./pages/layouts/GuestLayout";
import Layout from "./pages/layouts/Layout";
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import Accounts from "./pages/Accounts";
import Unauthorized from "./pages/generic/Unauthorized";
import NotFound from "./pages/generic/NotFound";
import store from "./store/store";
import Managers from "./pages/Managers";
import Banks from "./pages/Admin/Banks";
import Issuers from "./pages/Admin/Issuers";
import Instruments from "./pages/Admin/Instruments";
import Advisors from "./pages/Admin/Advisors";
import UpgradePlan from "./pages/Advisor/UpgradePlan";

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

              <Route
                element={<AuthWrapper allowedRoles={["advisor", "admin"]} />}
              >
                <Route path="/managers" element={<Managers />} />
              </Route>

              <Route element={<AuthWrapper allowedRoles={["advisor"]} />}>
                <Route path="/clients" element={<Clients />} />
                <Route path="/account" element={<Accounts />} />
                <Route path="/upgrade" element={<UpgradePlan />} />
              </Route>

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
