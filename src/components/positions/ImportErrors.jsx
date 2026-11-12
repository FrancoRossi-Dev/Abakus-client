import FormAlert from '../shared/form/FormAlert';

// Error general + detalle por fila, en un solo bloque (causa y acción, spec §7)
const ImportErrors = ({ error, rowErrors }) => {
  if (!error) return null;

  return (
    <FormAlert title={error}>
      {rowErrors.length > 0 && (
        <ul>
          {rowErrors.map((rowError) => (
            <li key={rowError}>{rowError}</li>
          ))}
        </ul>
      )}
    </FormAlert>
  );
};

export default ImportErrors;
