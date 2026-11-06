import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
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
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <label htmlFor={commercialNameId}>Nombre comercial:</label>
      <input
        id={commercialNameId}
        type="text"
        autoFocus
        disabled={isSubmitting}
        {...register("commercialName")}
      />
      {errors.commercialName && <p role="alert">{errors.commercialName.message}</p>}

      <label htmlFor={legalNameId}>Razón social:</label>
      <input id={legalNameId} type="text" disabled={isSubmitting} {...register("legalName")} />
      {errors.legalName && <p role="alert">{errors.legalName.message}</p>}

      <label htmlFor={addressId}>Dirección (opcional):</label>
      <input id={addressId} type="text" disabled={isSubmitting} {...register("address")} />
      {errors.address && <p role="alert">{errors.address.message}</p>}

      <label htmlFor={countryId}>País (opcional):</label>
      <input id={countryId} type="text" disabled={isSubmitting} {...register("country")} />
      {errors.country && <p role="alert">{errors.country.message}</p>}

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

export default IssuerForm;
