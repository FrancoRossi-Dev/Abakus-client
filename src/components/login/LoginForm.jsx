import { useNavigate } from "react-router";
import { useId, useRef, useState } from "react";
import backend from "../../api/backend";

const LoginForm = () => {
  const navigate = useNavigate();

  const usernameId = useId();
  const usernameRef = useRef();

  const passwordId = useId();
  const passwordRef = useRef();

  const [areFieldsFilled, setAreFieldsFilled] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateFields = () => {
    const username = usernameRef.current.value.trim();
    const password = passwordRef.current.value;

    setAreFieldsFilled(username !== "" && password !== "");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const username = usernameRef.current.value.trim();
    const password = passwordRef.current.value;

    if (!username || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await backend.post("/auth/login", {
        username,
        password,
      });

      // Save the token
     localStorage.setItem("abakus-token", response.data.token);
     navigate("/");

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No es posible iniciar sesión. Por favor, inténtalo de nuevo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <label htmlFor={usernameId}>Username:</label>
      <input
        type="text"
        id={usernameId}
        ref={usernameRef}
        onChange={validateFields}
        autoComplete="username"
        required
      />

      <label htmlFor={passwordId}>Password:</label>
      <input
        type="password"
        id={passwordId}
        ref={passwordRef}
        onChange={validateFields}
        autoComplete="current-password"
        required
      />

      {error && <p role="alert">{error}</p>}

      <button
        type="submit"
        disabled={!areFieldsFilled || isLoading}
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
};

export default LoginForm;