import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import 'react-toastify/dist/ReactTostify.css';

import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthWrapper from './pages/AuthWrapper';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Clients from './pages/Clients';
import Accounts from './pages/Accounts';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import store from './store/store';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route element={<AuthWrapper />}>
            <Route element={<Layout />}>
              <Route index path='/' element={<Home />} />
              <Route path='/clients' element={<Clients />} />
              <Route path='/account' element={<Accounts />} />
            </Route>
          </Route>
          <Route path='/unauthorized' element={<Unauthorized />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </Provider>
  );
}

export default App;
