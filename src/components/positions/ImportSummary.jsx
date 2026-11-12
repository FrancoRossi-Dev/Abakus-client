// Resumen en números de lo que se va a importar
const ImportSummary = ({ fileClientCount, clientCount, accountCount, positionCount, skippedCount }) => {
  const items = [
    { label: 'Clientes en el archivo', value: fileClientCount },
    { label: 'Clientes a importar', value: clientCount },
    { label: 'Cuentas', value: accountCount },
    { label: 'Posiciones a importar', value: positionCount },
  ];

  // "Sin importar" solo aparece si hay filas que se dejan afuera
  if (skippedCount > 0) {
    items.push({ label: 'Sin importar', value: skippedCount });
  }

  return (
    <dl className='import-summary'>
      {items.map((item) => (
        <div key={item.label} className='import-summary__item'>
          <dt>{item.label}</dt>
          <dd>
            <data value={item.value}>{item.value}</data>
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default ImportSummary;
