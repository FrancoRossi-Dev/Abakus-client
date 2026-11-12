import { NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import {
  FiBarChart2,
  FiBriefcase,
  FiCreditCard,
  FiHome,
  FiLayers,
  FiLogOut,
  FiStar,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { MdOutlineAccountBalance } from "react-icons/md";
import Logo from "../../components/brand/Logo";
import ThemeToggle from "../../components/shared/theme/ThemeToggle";
import { clearNewsAnalysis } from "../../features/reports/newsAnalysis.slice";
import { clearClients } from "../../features/clients/clients.slice";
import { clearAccount } from "../../features/account/account.slice";
import "./Layout.css";
import { getRole, logout } from "../../utils/utils";

// Navegación por rol. Solo decide qué muestra el menú; la API sigue controlando el acceso.
const ADVISOR_LINKS = [
  { to: "/clients", label: "Clientes", icon: FiUsers },
  { to: "/managers", label: "Managers", icon: FiUserCheck },
  { to: "/reports", label: "Reportes", icon: FiBarChart2 },
  { to: "/account", label: "Cuenta", icon: FiCreditCard },
  { to: "/upgrade", label: "Mi plan", icon: FiStar },
];

const ADMIN_LINKS = [
  { to: "/managers", label: "Managers", icon: FiUserCheck },
  { to: "/advisors", label: "Advisors", icon: FiBriefcase },
  { to: "/banks", label: "Bancos", icon: MdOutlineAccountBalance },
  { to: "/issuers", label: "Emisores", icon: FiLayers },
  { to: "/instruments", label: "Instrumentos", icon: FiBarChart2 },
];

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // revisa rol y habilita navegacion dependiendo de lo que diga el token
  const role = getRole();
  const links = [
    { to: "/", label: "Inicio", icon: FiHome, end: true },
    ...(role === "admin" ? ADMIN_LINKS : role === "advisor" ? ADVISOR_LINKS : []),
  ];

  const handleLogout = () => {
    logout();
    // Vacía todo el estado global: el próximo usuario no ve datos del anterior
    dispatch(clearAccount());
    dispatch(clearClients());
    dispatch(clearNewsAnalysis());
    navigate("/login", { replace: true });
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <Logo />
        <nav className="sidebar__nav" aria-label="Navegación principal">
          <ul>
            {links.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end}>
                  <Icon aria-hidden="true" className="sidebar__icon" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="sidebar__logout" onClick={handleLogout}>
            <FiLogOut aria-hidden="true" className="sidebar__icon" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <main className="layout__main">
        <div className="layout__topbar">
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
