import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import FormField from "../shared/form/FormField";
import FormAlert from "../shared/form/FormAlert";
import Button from "../shared/button/Button";
import {
  createInstrumentSchema,
  editInstrumentFormSchema,
} from "../../validators/instrument.validators";
import { INSTRUMENT_TYPES, INSTRUMENT_TYPE_LABELS } from "../../constants/constants";

// Alta: la API solo recibe el ISIN y completa el resto con OpenFIGI.
// Edición: se corrigen a mano nombre, tipo y ticker.
const InstrumentForm = ({ instrument, onSuccess, onCancel }) => {
  const isEditing = Boolean(instrument);

  const isinId = useId();
  const nameId = useId();
  const typeId = useId();
  const tickerId = useId();

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    // El modal se desmonta al cerrarse, así que el modo no cambia con el form montado
    resolver: joiResolver(isEditing ? editInstrumentFormSchema : createInstrumentSchema),
    mode: "onChange",
  });

  // Carga los datos al editar o limpia los campos al agregar.
  useEffect(() => {
    reset(
      instrument
        ? {
            name: instrument.name || "",
            type: instrument.type || "",
            ticker: instrument.ticker || "",
          }
        : { isin: "" }
    );
  }, [instrument, reset]);

  const handleSave = async (data) => {
    setError("");

    try {
      // El token lo agrega el interceptor de backend.js
      if (instrument) {
        const { ticker, ...rest } = data;
        const payload = { ...rest };

        // La API no acepta ticker vacío: si se borró, no se envía
        if (ticker) payload.ticker = ticker;

        // La API exige issuerId cuando el tipo es stock o bond
        if (instrument.issuerId) payload.issuerId = instrument.issuerId;

        await backend.patch(`/instrument/${instrument._id}`, payload);
      } else {
        await backend.post("/instrument", data);
      }

      onSuccess({ created: !instrument });
    } catch (error) {
      setError(error.userMessage || "No se pudo guardar el instrumento.");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit(handleSave)} noValidate>
      {isEditing ? (
        <>
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
              id={typeId}
              as="select"
              label="Tipo"
              disabled={isSubmitting}
              error={errors.type?.message}
              {...register("type")}
            >
              {INSTRUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {INSTRUMENT_TYPE_LABELS[type] ?? type}
                </option>
              ))}
            </FormField>

            <FormField
              id={tickerId}
              label="Ticker"
              optional
              disabled={isSubmitting}
              error={errors.ticker?.message}
              {...register("ticker")}
            />
          </div>
        </>
      ) : (
        <FormField
          id={isinId}
          label="ISIN"
          autoFocus
          placeholder="US0378331005"
          hint="12 caracteres. El nombre, el tipo y el ticker se completan automáticamente."
          disabled={isSubmitting}
          error={errors.isin?.message}
          {...register("isin")}
        />
      )}

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

export default InstrumentForm;
