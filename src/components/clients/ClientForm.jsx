import { useId, useState } from "react";
import { Link } from "react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { FiPlus } from "react-icons/fi";
import backend from "../../api/backend";
import { createClientSchema } from "../../validators/client.validators";
import FormField from "../shared/form/FormField";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
import DeleteButton from "../shared/button/DeleteButton";
import "./ClientForm.css";

const EMPTY_ACCOUNT = {
  bankId: "",
  number: "",
  accountName: "",
  currency: "",
};

// Alta de cliente. Las cuentas bancarias son opcionales: se pueden agregar varias.
// El advisor sale del token, por eso no se envía advisorId.
const ClientForm = ({ managers, banks, onSuccess, onCancel }) => {
  const formId = useId();
  const fieldId = (name) => `${formId}-${name}`;

  const [error, setError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(createClientSchema),
    // Muestra el error recién al salir del campo y lo retira apenas se corrige
    mode: "onTouched",
    defaultValues: {
      clientDetails: {
        commercialName: "",
        legalName: "",
        address: "",
        country: "",
      },
      managerId: "",
      bankAccounts: [],
    },
  });

  // Lista dinámica de cuentas bancarias
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bankAccounts",
  });

  const handleSave = async (data) => {
    setError("");

    try {
      // El token lo agrega el interceptor de backend.js.
      // data ya viene normalizado por Joi (sin espacios, sin dirección/país vacíos)
      await backend.post("/client", data);

      // La página recarga el listado y oculta el formulario.
      onSuccess();
    } catch (error) {
      setError(error.userMessage || "No se pudo registrar el cliente.");
    }
  };

  const hasManagers = managers.length > 0;

  return (
    <form className="client-form" onSubmit={handleSubmit(handleSave)} noValidate>
      <fieldset className="client-form__section">
        <legend className="client-form__legend">Datos del cliente</legend>

        <div className="client-form__grid">
          <FormField
            id={fieldId("commercialName")}
            label="Nombre comercial"
            autoFocus
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

      <fieldset className="client-form__section">
        <legend className="client-form__legend">
          Cuentas bancarias <span className="client-form__optional">(opcional)</span>
        </legend>

        {fields.length === 0 && (
          <p className="client-form__hint">
            Podés agregar las cuentas ahora o más adelante.
          </p>
        )}

        {fields.map((field, index) => {
          const accountErrors = errors.bankAccounts?.[index];
          const accountFieldId = (name) => fieldId(`account-${field.id}-${name}`);

          return (
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

              <div className="client-form__grid">
                <FormField
                  as="select"
                  id={accountFieldId("bankId")}
                  label="Banco"
                  disabled={isSubmitting}
                  error={accountErrors?.bankId?.message}
                  {...register(`bankAccounts.${index}.bankId`)}
                >
                  <option value="">Elegí un banco</option>
                  {banks.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.name}
                    </option>
                  ))}
                </FormField>

                <FormField
                  id={accountFieldId("number")}
                  label="Número de cuenta"
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={isSubmitting}
                  error={accountErrors?.number?.message}
                  {...register(`bankAccounts.${index}.number`)}
                />

                <FormField
                  id={accountFieldId("accountName")}
                  label="Nombre de la cuenta"
                  disabled={isSubmitting}
                  error={accountErrors?.accountName?.message}
                  {...register(`bankAccounts.${index}.accountName`)}
                />

                <FormField
                  id={accountFieldId("currency")}
                  label="Moneda"
                  placeholder="USD"
                  disabled={isSubmitting}
                  error={accountErrors?.currency?.message}
                  {...register(`bankAccounts.${index}.currency`)}
                />
              </div>
            </fieldset>
          );
        })}

        <Button
          type="tertiary"
          icon={FiPlus}
          label={fields.length === 0 ? "Agregar cuenta" : "Agregar otra cuenta"}
          className="client-form__add"
          onClick={() => append(EMPTY_ACCOUNT)}
          disabled={isSubmitting}
        />
      </fieldset>

      <FormAlert>{error}</FormAlert>

      <div className="modal__actions">
        <Button type="secondary" label="Cancelar" onClick={onCancel} disabled={isSubmitting} />
        <Button
          type="primary"
          htmlType="submit"
          label={isSubmitting ? "Guardando..." : "Registrar cliente"}
          disabled={!hasManagers || !isValid || isSubmitting}
          aria-busy={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ClientForm;
