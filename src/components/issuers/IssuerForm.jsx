import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import FormField from "../shared/form/FormField";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
import { createIssuerSchema } from "../../validators/issuer.validators";
import { updateIssuer, invalidateIssuers } from "../../features/issuers/issuers.slice";

const IssuerForm = ({ issuer, onSuccess, onCancel }) => {
  const dispatch = useDispatch();

  const commercialNameId = useId();
  const legalNameId = useId();
  const addressId = useId();
  const countryId = useId();

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(createIssuerSchema),
    mode: "onChange",
    defaultValues: {
      commercialName: "",
      legalName: "",
      address: "",
      country: "",
    },
  });

  // Carga los datos al editar o limpia los campos al agregar.
  useEffect(() => {
    reset({
      commercialName: issuer?.commercialName || "",
      legalName: issuer?.legalName || "",
      address: issuer?.address || "",
      country: issuer?.country || "",
    });
  }, [issuer, reset]);

  const handleSave = async (data) => {
    setError("");

    try {
      // El token lo agrega el interceptor de backend.js
      if (issuer) {
        await backend.patch(`/issuer/${issuer._id}`, data);

        dispatch(updateIssuer({ ...issuer, ...data }));
      } else {
        await backend.post("/issuer", data);

        // El nuevo emisor corre a todos un lugar: descarta la caché de páginas
        dispatch(invalidateIssuers());
      }

      onSuccess({ created: !issuer });
    } catch (error) {
      setError(error.userMessage || "No se pudo guardar el emisor.");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(handleSave)} noValidate>
      <div className="form__grid">
        <FormField
          id={commercialNameId}
          label="Nombre comercial"
          autoFocus
          disabled={isSubmitting}
          error={errors.commercialName?.message}
          {...register("commercialName")}
        />
        <FormField
          id={legalNameId}
          label="Razón social"
          disabled={isSubmitting}
          error={errors.legalName?.message}
          {...register("legalName")}
        />
        <FormField
          id={addressId}
          label="Dirección"
          optional
          disabled={isSubmitting}
          error={errors.address?.message}
          {...register("address")}
        />
        <FormField
          id={countryId}
          label="País"
          optional
          disabled={isSubmitting}
          error={errors.country?.message}
          {...register("country")}
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

export default IssuerForm;
