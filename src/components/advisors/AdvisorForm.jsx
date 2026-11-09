import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import FormField from "../shared/form/FormField";
import "../clients/ClientForm.css";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
import {
  PLAN_TIERS,
  createAdvisorFormSchema,
  editAdvisorFormSchema,
} from "../../validators/advisor.validators";
import { updateAdvisor, invalidateAdvisors } from "../../features/advisors/advisors.slice";

const PLAN_LABELS = { base: "Base", premium: "Premium" };

// Campos de details: [nombre, etiqueta, tipo de input, opcional]
const DETAIL_FIELDS = [
  ["comercialName", "Nombre comercial", "text", false],
  ["legalName", "Razón social", "text", false],
  ["document", "Documento", "text", false],
  ["phone", "Teléfono", "tel", false],
  ["contactEmail", "Correo de contacto", "email", false],
  ["address", "Dirección", "text", true],
  ["country", "País", "text", true],
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
    <form className="form" onSubmit={handleSubmit(handleSave)} noValidate>
      <fieldset className="client-form__section">
        <legend className="client-form__legend">Acceso</legend>
        <div className="form__grid">
          <FormField
            id={fieldId("username")}
            label="Usuario"
            autoFocus
            autoComplete="off"
            disabled={isSubmitting}
            error={errors.username?.message}
            {...register("username")}
          />
          <FormField
            id={fieldId("password")}
            label={isEditing ? "Nueva contraseña" : "Contraseña"}
            type="password"
            optional={isEditing}
            hint={isEditing ? "Dejala vacía para no cambiarla." : undefined}
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.password?.message}
            {...register("password")}
          />
          <FormField
            id={fieldId("planTier")}
            as="select"
            label="Plan"
            disabled={isSubmitting}
            error={errors.planTier?.message}
            {...register("planTier")}
          >
            {PLAN_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {PLAN_LABELS[tier]}
              </option>
            ))}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="client-form__section">
        <legend className="client-form__legend">Datos de la firma</legend>
        <div className="form__grid">
          {DETAIL_FIELDS.map(([name, label, type, optional]) => (
            <FormField
              key={name}
              id={fieldId(name)}
              label={label}
              type={type}
              optional={optional}
              disabled={isSubmitting}
              error={errors.details?.[name]?.message}
              {...register(`details.${name}`)}
            />
          ))}
        </div>
      </fieldset>

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

export default AdvisorForm;
