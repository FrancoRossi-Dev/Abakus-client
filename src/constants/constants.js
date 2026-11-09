// Mirror the API's values; the API remains the one that enforces them
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const INSTRUMENT_TYPES = ['stock', 'bond', 'fund', 'other'];

// Etiquetas en español para mostrar el tipo de instrumento (la API usa las claves en inglés)
export const INSTRUMENT_TYPE_LABELS = {
  stock: 'Acciones',
  bond: 'Bonos',
  fund: 'Fondos',
  cash: 'Efectivo',
  other: 'Otros',
};
