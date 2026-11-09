import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import FormField from "../shared/form/FormField";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
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
    <form className="form" onSubmit={handleSubmit(handleSave)} noValidate>
      <FormField
        id={nameId}
        label="Nombre"
        autoFocus
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="form__grid">
        <FormField
          id={countryId}
          label="País"
          disabled={isSubmitting}
          error={errors.country?.message}
          {...register("country")}
        />
        <FormField
          id={regionId}
          label="Región"
          disabled={isSubmitting}
          error={errors.region?.message}
          {...register("region")}
        />
      </div>

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

export default BankForm;
