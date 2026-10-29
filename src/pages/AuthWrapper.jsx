import { Navigate, Outlet, useLocation } from 'react-router';

const AuthWrapper = () => {
  const isAuth = localStorage.getItem('abakus-token');
  const location = useLocation();
  // @TODO cambiar

  if (!isAuth) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthWrapper;
