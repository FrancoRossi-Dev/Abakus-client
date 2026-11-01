import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { registerSchema } from "../../validators/auth.validators";
import backend from "../../api/backend";

const RegisterForm = () => {
  const navigate = useNavigate();
  const formId = useId();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      details: {
        comercialName: "",
        legalName: "",
        document: "",
        phone: "",
        contactEmail: "",
        address: "",
        country: "",
      },
    },
  });

  const handleRegister = async (data) => {
    setError("");

    const { address, country, ...requiredDetails } = data.details;

    const body = {
      ...data,
      details: {
        ...requiredDetails,
        ...(address ? { address } : {}),
        ...(country ? { country } : {}),
      },
    };

    try {
      const response = await backend.post("/auth/register", body);

      localStorage.setItem("abakus-token", response.data.token);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo crear la cuenta. Intenta nuevamente."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} noValidate>
      <h2>Datos de acceso</h2>

      <label htmlFor={`${formId}-username`}>Usuario:</label>
      <input
        id={`${formId}-username`}
        type="text"
        autoComplete="username"
        {...register("username")}
      />
      {errors.username && (
        <p role="alert">{errors.username.message}</p>
      )}

      <label htmlFor={`${formId}-password`}>Contraseña:</label>
      <input
        id={`${formId}-password`}
        type="password"
        autoComplete="new-password"
        {...register("password")}
      />
      {errors.password && (
        <p role="alert">{errors.password.message}</p>
      )}

      <label htmlFor={`${formId}-confirmPassword`}>
        Repetir contraseña:
      </label>
      <input
        id={`${formId}-confirmPassword`}
        type="password"
        autoComplete="new-password"
        {...register("confirmPassword")}
      />
      {errors.confirmPassword && (
        <p role="alert">{errors.confirmPassword.message}</p>
      )}

      <h2>Datos de la firma</h2>

      <label htmlFor={`${formId}-comercialName`}>
        Nombre comercial:
      </label>
      <input
        id={`${formId}-comercialName`}
        type="text"
        {...register("details.comercialName")}
      />
      {errors.details?.comercialName && (
        <p role="alert">{errors.details.comercialName.message}</p>
      )}

      <label htmlFor={`${formId}-legalName`}>Razón social:</label>
      <input
        id={`${formId}-legalName`}
        type="text"
        {...register("details.legalName")}
      />
      {errors.details?.legalName && (
        <p role="alert">{errors.details.legalName.message}</p>
      )}

      <label htmlFor={`${formId}-document`}>Documento:</label>
      <input
        id={`${formId}-document`}
        type="text"
        {...register("details.document")}
      />
      {errors.details?.document && (
        <p role="alert">{errors.details.document.message}</p>
      )}

      <label htmlFor={`${formId}-phone`}>Teléfono:</label>
      <input
        id={`${formId}-phone`}
        type="tel"
        autoComplete="tel"
        {...register("details.phone")}
      />
      {errors.details?.phone && (
        <p role="alert">{errors.details.phone.message}</p>
      )}

      <label htmlFor={`${formId}-contactEmail`}>
        Correo de contacto:
      </label>
      <input
        id={`${formId}-contactEmail`}
        type="email"
        autoComplete="email"
        {...register("details.contactEmail")}
      />
      {errors.details?.contactEmail && (
        <p role="alert">{errors.details.contactEmail.message}</p>
      )}

      <label htmlFor={`${formId}-address`}>
        Dirección (opcional):
      </label>
      <input
        id={`${formId}-address`}
        type="text"
        {...register("details.address")}
      />
      {errors.details?.address && (
        <p role="alert">{errors.details.address.message}</p>
      )}

      <label htmlFor={`${formId}-country`}>País (opcional):</label>
      <input
        id={`${formId}-country`}
        type="text"
        {...register("details.country")}
      />
      {errors.details?.country && (
        <p role="alert">{errors.details.country.message}</p>
      )}

      {error && <p role="alert">{error}</p>}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "Creando cuenta..." : "Registrarse"}
      </button>
    </form>
  );
};

export default RegisterForm;