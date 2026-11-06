import { Navigate, Outlet, useLocation } from 'react-router';
import { getToken } from '../utils/utils';

const AuthWrapper = () => {
  const isAuth = getToken();
  const location = useLocation();
  // @TODO cambiar

  if (!isAuth) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthWrapper;
