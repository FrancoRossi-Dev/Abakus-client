import React from 'react';
import { Link } from "react-router";
import LoginForm from "../components/login/LoginForm";

const Login = () => {
  return <div>
    <h1>Login</h1>
    <p>Ingrese sus credenciales</p>
    <LoginForm />
    
     <p>
        ¿No tienes cuenta?{" "}
        <Link to="/register">Registrate aca</Link>
      </p>
  </div>;
};

export default Login;
