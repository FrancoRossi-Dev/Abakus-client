// Barra de participación: refuerza visualmente el porcentaje, que siempre se muestra en texto
const ShareBar = ({ value }) => {
  // El ancho queda entre 0% y 100%
  const width = Math.min(100, Math.max(0, value));

  return (
    <span className='share-bar' aria-hidden='true'>
      <span className='share-bar__fill' style={{ width: `${width}%` }} />
    </span>
  );
};

export default ShareBar;
