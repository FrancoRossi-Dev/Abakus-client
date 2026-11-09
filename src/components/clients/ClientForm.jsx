import { useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { FiPlus } from "react-icons/fi";
import backend from "../../api/backend";
import { createClientSchema, updateClientSchema } from "../../validators/client.validators";
import FormField from "../shared/form/FormField";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
import DeleteButton from "../shared/button/DeleteButton";
import BankAccountFields from "./BankAccountFields";
import { EMPTY_ACCOUNT } from "./bankAccounts";
import "./ClientForm.css";

const toFormValues = (client) => ({
  clientDetails: {
    commercialName: client?.clientDetails?.commercialName || "",
    legalName: client?.clientDetails?.legalName || "",
    address: client?.clientDetails?.address || "",
    country: client?.clientDetails?.country || "",
  },
  managerId: client?.managerId || "",
  // En edición no se manda bankAccounts: la API exige la lista completa y se gestiona aparte
  ...(!client && { bankAccounts: [] }),
});

// Alta de cliente (sin client) o edición de sus datos (con client).
// En el alta las cuentas bancarias son opcionales y se pueden agregar varias;
// en la edición las cuentas se gestionan desde la página del cliente.
// El advisor sale del token, por eso no se envía advisorId.
const ClientForm = ({ client, managers, banks, onSuccess, onCancel }) => {
  const isEdit = Boolean(client);
  const formId = useId();
  const fieldId = (name) => `${formId}-${name}`;

  const [error, setError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm({
    resolver: joiResolver(isEdit ? updateClientSchema : createClientSchema),
    // Muestra el error recién al salir del campo y lo retira apenas se corrige
    mode: "onTouched",
    defaultValues: toFormValues(client),
  });

  // Al guardar, la página pasa el cliente actualizado: se toma como nuevo punto de partida
  useEffect(() => {
    // keepDirtyValues: si el cliente cambia por otra acción (ej. subir su imagen),
    // no se pierde lo que el usuario estaba editando
    if (client) reset(toFormValues(client), { keepDirtyValues: true });
  }, [client, reset]);

  // Lista dinámica de cuentas bancarias (solo en el alta)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bankAccounts",
  });

  const handleSave = async (data) => {
    setError("");

    try {
      // El token lo agrega el interceptor de backend.js.
      // data ya viene normalizado por Joi (sin espacios, sin dirección/país vacíos)
      if (isEdit) {
        // Solo datos y manager: useFieldArray puede dejar bankAccounts: [] en data,
        // y la API lo tomaría como la lista completa de cuentas
        const { clientDetails, managerId } = data;
        const res = await backend.patch(`/client/${client._id}`, { clientDetails, managerId });
        onSuccess(res.data.client);
      } else {
        await backend.post("/client", data);
        // La página recarga el listado y oculta el formulario.
        onSuccess();
      }
    } catch (error) {
      setError(
        error.userMessage ||
          (isEdit ? "No se pudo guardar el cliente." : "No se pudo registrar el cliente.")
      );
    }
  };

  const hasManagers = managers.length > 0;
  const submitLabel = isEdit ? "Guardar cambios" : "Registrar cliente";

  return (
    <form className="client-form" onSubmit={handleSubmit(handleSave)} noValidate>
      <fieldset className="client-form__section">
        <legend className="client-form__legend">Datos del cliente</legend>

        <div className="client-form__grid">
          <FormField
            id={fieldId("commercialName")}
            label="Nombre comercial"
            autoFocus={!isEdit}
            disabled={isSubmitting}
            error={errors.clientDetails?.commercialName?.message}
            {...register("clientDetails.commercialName")}
          />

          <FormField
            id={fieldId("legalName")}
            label="Razón social"
            disabled={isSubmitting}
            error={errors.clientDetails?.legalName?.message}
            {...register("clientDetails.legalName")}
          />

          <FormField
            id={fieldId("address")}
            label="Dirección"
            optional
            disabled={isSubmitting}
            error={errors.clientDetails?.address?.message}
            {...register("clientDetails.address")}
          />

          <FormField
            id={fieldId("country")}
            label="País"
            optional
            disabled={isSubmitting}
            error={errors.clientDetails?.country?.message}
            {...register("clientDetails.country")}
          />
        </div>
      </fieldset>

      <fieldset className="client-form__section">
        <legend className="client-form__legend">Responsable</legend>

        {hasManagers ? (
          <FormField
            as="select"
            id={fieldId("managerId")}
            label="Manager"
            hint="Persona que gestiona la cartera de este cliente."
            disabled={isSubmitting}
            error={errors.managerId?.message}
            {...register("managerId")}
          >
            <option value="">Elegí un manager</option>
            {managers.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.fullName}
              </option>
            ))}
          </FormField>
        ) : (
          <FormAlert tone="warning" title="Todavía no tenés managers">
            <p>
              Para registrar un cliente necesitás al menos un manager.{" "}
              <Link to="/managers">Crear un manager</Link>
            </p>
          </FormAlert>
        )}
      </fieldset>

      {!isEdit && (
        <fieldset className="client-form__section">
          <legend className="client-form__legend">
            Cuentas bancarias <span className="client-form__optional">(opcional)</span>
          </legend>

          {fields.length === 0 && (
            <p className="client-form__hint">
              Podés agregar las cuentas ahora o más adelante.
            </p>
          )}

          {fields.map((field, index) => (
            <fieldset key={field.id} className="client-form__account">
              <legend className="client-form__account-title">Cuenta {index + 1}</legend>
              <DeleteButton
                className="client-form__remove"
                onClick={() => remove(index)}
                disabled={isSubmitting}
                aria-label={`Quitar cuenta ${index + 1}`}
              >
                Quitar
              </DeleteButton>

              <BankAccountFields
                register={register}
                errors={errors.bankAccounts?.[index]}
                banks={banks}
                prefix={`bankAccounts.${index}`}
                disabled={isSubmitting}
                idFor={(name) => fieldId(`account-${field.id}-${name}`)}
              />
            </fieldset>
          ))}

          <Button
            type="tertiary"
            icon={FiPlus}
            label={fields.length === 0 ? "Agregar cuenta" : "Agregar otra cuenta"}
            className="client-form__add"
            onClick={() => append(EMPTY_ACCOUNT)}
            disabled={isSubmitting}
          />
        </fieldset>
      )}

      <FormAlert>{error}</FormAlert>

      <div className="modal__actions">
        {onCancel && (
          <Button type="secondary" label="Cancelar" onClick={onCancel} disabled={isSubmitting} />
        )}
        <Button
          type="primary"
          htmlType="submit"
          label={isSubmitting ? "Guardando..." : submitLabel}
          disabled={!hasManagers || !isValid || isSubmitting || (isEdit && !isDirty)}
          aria-busy={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ClientForm;
