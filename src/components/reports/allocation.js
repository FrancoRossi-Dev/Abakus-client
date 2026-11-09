import { INSTRUMENT_TYPE_LABELS } from '../../constants/constants';

// Orden fijo de categorías: el color sigue a la categoría, nunca a su posición en el ranking.
// Paleta derivada de los azules y el verde de marca, validada para daltonismo.
// "Otros" es gris a propósito: agrupa lo que no tiene categoría propia.
// La usan el gráfico de la página y el PDF, así ambos muestran los mismos colores y totales.
export const ALLOCATION_CATEGORIES = [
  { type: 'stock', color: '#2f73b0' },
  { type: 'bond', color: '#1fa284' },
  { type: 'fund', color: '#a06ad0' },
  { type: 'cash', color: '#d9822b' },
  { type: 'other', color: '#808d9a' },
];

const KNOWN_TYPES = new Set(ALLOCATION_CATEGORIES.map((category) => category.type));

// Agrupa el valor por tipo de activo. Devuelve solo las categorías con valor, con su %.
export const buildAllocationSlices = (byInstrumentType = []) => {
  const totals = Object.fromEntries(ALLOCATION_CATEGORIES.map(({ type }) => [type, 0]));
  for (const item of byInstrumentType) {
    totals[KNOWN_TYPES.has(item.type) ? item.type : 'other'] += item.marketValue;
  }

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return ALLOCATION_CATEGORIES.filter(({ type }) => totals[type] > 0).map((category) => ({
    ...category,
    label: INSTRUMENT_TYPE_LABELS[category.type],
    value: totals[category.type],
    percentage: (totals[category.type] / total) * 100,
  }));
};
