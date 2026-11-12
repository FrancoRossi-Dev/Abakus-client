import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import FormField from "../shared/form/FormField";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
import { createManagerSchema  } from "../../validators/manager.validators";

const ManagerForm = ({ manager, onSuccess, onCancel }) => {
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
  }, [manager, reset]);

  const handleSave = async (data) => {
    setError("");

    try {
      // El token lo agrega el interceptor de backend.js
      if (manager) {
        // Modifica el manager seleccionado.
        await backend.patch(`/manager/${manager._id}`, data);
      } else {
        // Crea un manager nuevo. La página recarga el listado en la página 1.
        await backend.post("/manager", data);
      }

      // La pagina oculta el formulario.
      onSuccess({ created: !manager });
    } catch (error) {
      setError(error.userMessage || "No se pudo guardar el manager.");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(handleSave)} noValidate>
      <FormField
        id={nameId}
        label="Nombre completo"
        autoFocus
        autoComplete="off"
        disabled={isSubmitting}
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <FormField
        id={emailId}
        label="Correo"
        type="email"
        autoComplete="off"
        disabled={isSubmitting}
        error={errors.email?.message}
        {...register("email")}
      />

      <FormAlert>{error}</FormAlert>

      <div className="modal__actions">
        <Button type="secondary" label="Cancelar" onClick={onCancel} disabled={isSubmitting} />
        <Button
          type="primary"
          htmlType="submit"
          label={isSubmitting ? "Guardando..." : "Guardar"}
          disabled={!isValid || isSubmitting}
          aria-busy={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ManagerForm;