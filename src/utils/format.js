// Formatos financieros de Abakus (spec §11): USD con punto de miles, coma decimal y 2 decimales

const amountFormatter = new Intl.NumberFormat('es-UY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('es-UY', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const timeFormatter = new Intl.DateTimeFormat('es-UY', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-UY', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

// Importe sin prefijo: para columnas cuyo encabezado ya dice USD. Negativos con signo explícito.
export const formatAmount = (value) => (isNumber(value) ? amountFormatter.format(value) : '—');

// "USD 1.284.650,00". Un dato ausente se muestra como "—", nunca como 0 (spec §11)
export const formatUSD = (value) => (isNumber(value) ? `USD ${amountFormatter.format(value)}` : '—');

export const formatPercent = (value) => (isNumber(value) ? `${percentFormatter.format(value)} %` : '—');

// "2026-11-09" → "09/11/2026", sin pasar por Date (evita el corrimiento de zona horaria)
export const formatIsoDate = (isoDate) => {
  if (!isoDate) return '—';
  const [year, month, day] = String(isoDate).slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

export const formatTime = (date) => (date ? timeFormatter.format(new Date(date)) : '—');

export const formatDateTime = (date) => (date ? dateTimeFormatter.format(new Date(date)) : '—');
