import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import {
  PLAN_TIERS,
  createAdvisorFormSchema,
  editAdvisorFormSchema,
} from "../../validators/advisor.validators";
import { updateAdvisor, invalidateAdvisors } from "../../features/advisors/advisors.slice";

const PLAN_LABELS = { base: "Base", premium: "Premium" };

// Campos de details: [nombre, etiqueta, tipo de input]
const DETAIL_FIELDS = [
  ["comercialName", "Nombre comercial", "text"],
  ["legalName", "Razón social", "text"],
  ["document", "Documento", "text"],
  ["phone", "Teléfono", "tel"],
  ["contactEmail", "Correo de contacto", "email"],
  ["address", "Dirección (opcional)", "text"],
  ["country", "País (opcional)", "text"],
];

const toFormValues = (advisor) => ({
  username: advisor?.username || "",
  password: "",
  planTier: advisor?.planTier || "base",
  details: Object.fromEntries(
    DETAIL_FIELDS.map(([name]) => [name, advisor?.details?.[name] || ""])
  ),
});

const AdvisorForm = ({ advisor, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const isEditing = Boolean(advisor);

  const idPrefix = useId();
  const fieldId = (name) => `${idPrefix}-${name}`;

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    // El modal se desmonta al cerrarse, así que el modo no cambia con el form montado
    resolver: joiResolver(isEditing ? editAdvisorFormSchema : createAdvisorFormSchema),
    mode: "onChange",
    defaultValues: toFormValues(advisor),
  });

  // Carga los datos al editar o limpia los campos al agregar.
  useEffect(() => {
    reset(toFormValues(advisor));
  }, [advisor, reset]);

  const handleSave = async (data) => {
    setError("");

    // Contraseña vacía al editar = no cambiarla
    const { password, ...rest } = data;
    const payload = password ? { ...rest, password } : rest;

    try {
      // El token lo agrega el interceptor de backend.js
      if (advisor) {
        const response = await backend.patch(`/user/advisors/${advisor._id}`, payload);

        dispatch(updateAdvisor(response.data.advisor));
      } else {
        await backend.post("/user/advisors", payload);

        // El nuevo advisor corre a todos un lugar: descarta la caché de páginas
        dispatch(invalidateAdvisors());
      }

      onSuccess({ created: !advisor });
    } catch (error) {
      setError(error.userMessage || "No se pudo guardar el advisor.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      <label htmlFor={fieldId("username")}>Usuario:</label>
      <input
        id={fieldId("username")}
        type="text"
        autoFocus
        autoComplete="off"
        disabled={isSubmitting}
        {...register("username")}
      />
      {errors.username && <p role="alert">{errors.username.message}</p>}

      <label htmlFor={fieldId("password")}>
        {isEditing ? "Nueva contraseña (vacío para no cambiarla):" : "Contraseña:"}
      </label>
      <input
        id={fieldId("password")}
        type="password"
        autoComplete="new-password"
        disabled={isSubmitting}
        {...register("password")}
      />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      {DETAIL_FIELDS.map(([name, label, type]) => (
        <div key={name}>
          <label htmlFor={fieldId(name)}>{label}:</label>
          <input
            id={fieldId(name)}
            type={type}
            disabled={isSubmitting}
            {...register(`details.${name}`)}
          />
          {errors.details?.[name] && <p role="alert">{errors.details[name].message}</p>}
        </div>
      ))}

      <label htmlFor={fieldId("planTier")}>Plan:</label>
      <select id={fieldId("planTier")} disabled={isSubmitting} {...register("planTier")}>
        {PLAN_TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {PLAN_LABELS[tier]}
          </option>
        ))}
      </select>
      {errors.planTier && <p role="alert">{errors.planTier.message}</p>}

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

export default AdvisorForm;
