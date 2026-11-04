import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { loginSchema } from "../../validators/auth.validators";
import backend from "../../api/backend";

const LoginForm = () => {
  const navigate = useNavigate();
  const formId = useId();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (data) => {
    setError("");

    try {
      const response = await backend.post("/auth/login", data);

      // Save the token
      localStorage.setItem("abakus-token", response.data.token);
      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No es posible iniciar sesión. Por favor, inténtalo de nuevo"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} noValidate>
      <label htmlFor={`${formId}-username`}>Username:</label>
      <input
        id={`${formId}-username`}
        type="text"
        autoComplete="username"
        {...register("username")}
      />
      {errors.username && <p role="alert">{errors.username.message}</p>}

      <label htmlFor={`${formId}-password`}>Password:</label>
      <input
        id={`${formId}-password`}
        type="password"
        autoComplete="current-password"
        {...register("password")}
      />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
};

export default LoginForm;
