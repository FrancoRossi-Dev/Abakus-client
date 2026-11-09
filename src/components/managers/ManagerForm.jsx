import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import FormField from "../shared/form/FormField";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
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
  }, [manager, reset]);

  const handleSave = async (data) => {
    setError("");

    try {
      // El token lo agrega el interceptor de backend.js
      if (manager) {
        // Modifica el manager seleccionado.
        await backend.patch(`/manager/${manager._id}`, data);

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
        await backend.post("/manager", data);

        // El nuevo manager corre a todos un lugar: descarta la caché de páginas
        dispatch(invalidateManagers());
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