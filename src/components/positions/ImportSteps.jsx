const STEPS = ['Elegir archivo', 'Asociar y confirmar'];

// Indicador de paso: deja claro dónde está el usuario y cuánto falta
const ImportSteps = ({ current }) => (
  <ol className='import-steps' aria-label='Pasos de la importación'>
    {STEPS.map((label, index) => {
      const step = index + 1;

      let state = 'pending';
      if (step < current) state = 'done';
      if (step === current) state = 'current';

      return (
        <li
          key={label}
          className={`import-steps__item import-steps__item--${state}`}
          aria-current={state === 'current' ? 'step' : undefined}>
          <span className='import-steps__number' aria-hidden='true'>
            {step}
          </span>
          <span>
            <span className='sr-only'>
              Paso {step} de {STEPS.length}:{' '}
            </span>
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

export default ImportSteps;
