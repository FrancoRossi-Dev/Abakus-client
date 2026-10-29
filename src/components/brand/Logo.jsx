// Abakus brand mark — see specs/Abakus Brand Identity Board.png
// Colors come from semantic tokens (--color-logo-*) defined in App.css.

const LAYOUTS = ['horizontal', 'vertical', 'symbol'];
const TONES = ['default', 'mono', 'inverse'];

export function LogoSymbol({ className = '', title }) {
  return (
    <svg
      className={`abk-logo__symbol ${className}`.trim()}
      viewBox="0 0 86 74.6"
      fill="none"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <g className="abk-logo__primary" strokeWidth="6">
        <path d="M10.5 10.5H32C41 10.5 44 16.1 47 21.1C52 29.6 59 34.1 70 35.6" />
        <path d="M10.5 64.1H32C41 64.1 44 58.5 47 53.5C52 45 59 40.5 70 39" />
      </g>
      <path className="abk-logo__accent" strokeWidth="6" d="M10.5 37.3H75.5" />
      <g className="abk-logo__primary">
        <circle cx="10.5" cy="10.5" r="10.5" />
        <circle cx="10.5" cy="64.1" r="10.5" />
        <circle cx="75.5" cy="37.3" r="10.5" />
      </g>
      <circle className="abk-logo__accent" cx="10.5" cy="37.3" r="10.5" />
    </svg>
  );
}

export default function Logo({ layout = 'horizontal', tone = 'default', className = '' }) {
  const l = LAYOUTS.includes(layout) ? layout : 'horizontal';
  const t = TONES.includes(tone) ? tone : 'default';
  const classes = `abk-logo abk-logo--${l} abk-logo--${t} ${className}`.trim();

  if (l === 'symbol') {
    return (
      <span className={classes}>
        <LogoSymbol title="Abakus" />
      </span>
    );
  }

  return (
    <span className={classes} role="img" aria-label="Abakus">
      <LogoSymbol />
      <span className="abk-logo__wordmark" aria-hidden="true">
        Abakus
      </span>
    </span>
  );
}
