import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import { createManagerSchema  } from "../../validators/manager.validators";
import {
  updateManager,
  invalidateManagers,
} from "../../features/managers/managers.slice";

const ManagerForm = ({ manager, onSuccess, onCancel }) => {
  const dispatch = useDispatch();

  const nameId = useId();
  const emailId = useId();

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(createManagerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // Carga los datos al editar o limpia los campos al agregar.
  useEffect(() => {
    reset({
      fullName: manager?.fullName || "",
      email: manager?.email || "",
    });

    setError("");
  }, [manager, reset]);

  const handleSave = async (data) => {
    setError("");

    try {
      const token = localStorage.getItem("abakus-token");

      if (!token) {
        throw new Error("Iniciá sesión para guardar el manager.");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (manager) {
        // Modifica el manager seleccionado.
        await backend.patch(`/manager/${manager._id}`, data, config);

        dispatch(
          updateManager({
            ...manager,
            ...data,
          })
        );
      } else {
        // Crea un manager nuevo.
        // El listado se recarga desde la página (vuelve a la página 1,
        // donde aparece el nuevo manager por estar ordenado del más reciente).
        await backend.post("/manager", data, config);

        // El nuevo manager corre a todos un lugar: descarta la caché de páginas
        dispatch(invalidateManagers());
      }

      // La pagina oculta el formulario.
      onSuccess({ created: !manager });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo guardar el manager."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <label htmlFor={nameId}>Nombre completo:</label>

      <input
        id={nameId}
        type="text"
        autoFocus
        disabled={isSubmitting}
        {...register("fullName")}
      />

      {errors.fullName && (
        <p role="alert">{errors.fullName.message}</p>
      )}

      <label htmlFor={emailId}>Correo:</label>

      <input
        id={emailId}
        type="email"
        disabled={isSubmitting}
        {...register("email")}
      />

      {errors.email && (
        <p role="alert">{errors.email.message}</p>
      )}

      {error && <p role="alert">{error}</p>}

      <div className="modal__actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default ManagerForm;