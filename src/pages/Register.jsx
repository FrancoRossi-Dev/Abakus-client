import { Link } from "react-router";
import RegisterForm from "../components/register/RegisterForm";

const Register = () => {
  return <div>
     <h1>Registro</h1>
      <p>Ingresá tus datos para crear una cuenta.</p>

      <RegisterForm />

       <p>
        ¿Ya tenes cuenta?{" "}
        <Link to="/login">Inicia sesión acá</Link>
      </p>

  </div>;
};

export default Register;
