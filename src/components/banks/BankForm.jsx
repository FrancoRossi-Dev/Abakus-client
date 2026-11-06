import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import { createBankSchema } from "../../validators/bank.validators";
import { updateBank, invalidateBanks } from "../../features/banks/banks.slice";

const BankForm = ({ bank, onSuccess, onCancel }) => {
  const dispatch = useDispatch();

  const nameId = useId();
  const countryId = useId();
  const regionId = useId();

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(createBankSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      country: "",
      region: "",
    },
  });

  // Carga los datos al editar o limpia los campos al agregar.
  useEffect(() => {
    reset({
      name: bank?.name || "",
      country: bank?.country || "",
      region: bank?.region || "",
    });
  }, [bank, reset]);

  const handleSave = async (data) => {
    setError("");

    try {
      // El token lo agrega el interceptor de backend.js
      if (bank) {
        await backend.patch(`/bank/${bank._id}`, data);

        dispatch(updateBank({ ...bank, ...data }));
      } else {
        await backend.post("/bank", data);

        // El nuevo banco corre a todos un lugar: descarta la caché de páginas
        dispatch(invalidateBanks());
      }

      onSuccess({ created: !bank });
    } catch (error) {
      setError(error.userMessage || "No se pudo guardar el banco.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <label htmlFor={nameId}>Nombre:</label>
      <input id={nameId} type="text" autoFocus disabled={isSubmitting} {...register("name")} />
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <label htmlFor={countryId}>País:</label>
      <input id={countryId} type="text" disabled={isSubmitting} {...register("country")} />
      {errors.country && <p role="alert">{errors.country.message}</p>}

      <label htmlFor={regionId}>Región:</label>
      <input id={regionId} type="text" disabled={isSubmitting} {...register("region")} />
      {errors.region && <p role="alert">{errors.region.message}</p>}

      {error && <p role="alert">{error}</p>}

      <div className="modal__actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>

        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default BankForm;
