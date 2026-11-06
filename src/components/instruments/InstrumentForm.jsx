import { useEffect, useId, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import backend from "../../api/backend";
import {
  createInstrumentSchema,
  editInstrumentFormSchema,
} from "../../validators/instrument.validators";
import { INSTRUMENT_TYPES } from "../../constants/constants";
import {
  updateInstrument,
  invalidateInstruments,
} from "../../features/instruments/instruments.slice";

// Alta: la API solo recibe el ISIN y completa el resto con OpenFIGI.
// Edición: se corrigen a mano nombre, tipo y ticker.
const InstrumentForm = ({ instrument, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
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

        const response = await backend.patch(`/instrument/${instrument._id}`, payload);

        dispatch(updateInstrument(response.data.instrument ?? { ...instrument, ...payload }));
      } else {
        await backend.post("/instrument", data);

        // El nuevo instrumento corre a todos un lugar: descarta la caché de páginas
        dispatch(invalidateInstruments());
      }

      onSuccess({ created: !instrument });
    } catch (error) {
      setError(error.userMessage || "No se pudo guardar el instrumento.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate>
      {isEditing ? (
        <>
          <label htmlFor={nameId}>Nombre:</label>
          <input id={nameId} type="text" autoFocus disabled={isSubmitting} {...register("name")} />
          {errors.name && <p role="alert">{errors.name.message}</p>}

          <label htmlFor={typeId}>Tipo:</label>
          <select id={typeId} disabled={isSubmitting} {...register("type")}>
            {INSTRUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && <p role="alert">{errors.type.message}</p>}

          <label htmlFor={tickerId}>Ticker (opcional):</label>
          <input id={tickerId} type="text" disabled={isSubmitting} {...register("ticker")} />
          {errors.ticker && <p role="alert">{errors.ticker.message}</p>}
        </>
      ) : (
        <>
          <label htmlFor={isinId}>ISIN:</label>
          <input
            id={isinId}
            type="text"
            autoFocus
            placeholder="US0378331005"
            disabled={isSubmitting}
            {...register("isin")}
          />
          {errors.isin && <p role="alert">{errors.isin.message}</p>}
        </>
      )}

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

export default InstrumentForm;
