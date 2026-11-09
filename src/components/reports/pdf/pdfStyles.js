import { StyleSheet } from '@react-pdf/renderer';

// Valores de los tokens de App.css (react-pdf no lee variables CSS).
// Helvetica es la fuente estándar del PDF: incluye tildes, ñ y «» sin embeber archivos.
export const COLORS = {
  blue900: '#102a48',
  blue800: '#173d63',
  blue600: '#276895',
  green400: '#2cb99a',
  text: '#14283c',
  muted: '#526477',
  border: '#e2e8ef',
  surfaceSubtle: '#f3f6f9',
  selected: '#e8f1f7',
  warning: '#a15c00',
  warningSurface: '#fdf2e3',
  info: '#12618b',
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.45,
    color: COLORS.text,
  },

  // --- Encabezado del documento ---
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  brandName: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: COLORS.blue900 },
  docType: { fontSize: 9, color: COLORS.muted, marginLeft: 'auto' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 20, lineHeight: 1.25, color: COLORS.text },
  subtitle: { marginTop: 2, color: COLORS.muted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 14,
    marginBottom: 18,
    borderBottom: `1 solid ${COLORS.border}`,
  },
  headerText: { flex: 1 },
  clientLogo: {
    width: 48,
    height: 48,
    objectFit: 'contain',
    border: `1 solid ${COLORS.border}`,
    borderRadius: 6,
  },

  // --- Secciones ---
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionNote: { fontSize: 9, color: COLORS.muted, marginTop: -4, marginBottom: 8 },
  muted: { color: COLORS.muted },

  // --- Indicadores ---
  metrics: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metric: {
    flex: 1,
    padding: 10,
    border: `1 solid ${COLORS.border}`,
    borderRadius: 6,
  },
  metricLabel: { fontSize: 9, color: COLORS.muted },
  metricValue: { fontFamily: 'Helvetica-Bold', fontSize: 16, marginTop: 2 },
  metricUnit: { fontFamily: 'Helvetica', fontSize: 10, color: COLORS.muted },
  metricContext: { fontSize: 8, color: COLORS.muted, marginTop: 2 },

  // --- Barra de composición ---
  stackBar: { flexDirection: 'row', height: 10, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  swatch: { width: 7, height: 7, borderRadius: 1.5, marginRight: 6 },

  // --- Tablas ---
  table: { border: `1 solid ${COLORS.border}`, borderRadius: 6 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderBottom: `1 solid ${COLORS.border}`,
  },
  tableRow: { flexDirection: 'row', borderBottom: `1 solid ${COLORS.border}` },
  tableRowLast: { flexDirection: 'row' },
  th: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: COLORS.muted,
  },
  td: { paddingVertical: 5, paddingHorizontal: 8 },
  cellRow: { flexDirection: 'row', alignItems: 'center' },
  end: { textAlign: 'right' },
  strong: { fontFamily: 'Helvetica-Bold' },
  meta: { fontSize: 8.5, color: COLORS.muted },

  // --- Análisis IA ---
  aiBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 6,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.info,
    backgroundColor: COLORS.selected,
    borderRadius: 8,
  },
  metaBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 10,
    marginBottom: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 6,
  },
  metaValue: { fontFamily: 'Helvetica-Bold' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    border: `1 solid ${COLORS.border}`,
    borderRadius: 10,
    fontSize: 9,
  },
  source: { marginBottom: 6 },
  sourceTitle: { fontFamily: 'Helvetica-Bold', color: COLORS.text, textDecoration: 'none' },
  sourceUrl: { fontSize: 8.5, color: COLORS.blue600 },
  warningTag: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 1,
    paddingHorizontal: 5,
    fontSize: 8,
    color: COLORS.warning,
    backgroundColor: COLORS.warningSurface,
    borderRadius: 6,
  },
  disclaimer: {
    marginTop: 14,
    paddingTop: 8,
    fontSize: 8.5,
    color: COLORS.muted,
    borderTop: `1 solid ${COLORS.border}`,
  },

  // --- Pie de página fijo ---
  footerLine: {
    position: 'absolute',
    bottom: 38,
    left: 44,
    right: 44,
    borderTop: `1 solid ${COLORS.border}`,
  },
  footerText: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 8,
    color: COLORS.muted,
  },

  // --- Markdown ---
  mdParagraph: { marginBottom: 6 },
  mdH3: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12.5,
    marginTop: 10,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: `1 solid ${COLORS.border}`,
  },
  mdH4: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginTop: 8, marginBottom: 4 },
  mdH5: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: COLORS.muted,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 3,
  },
  mdList: { marginBottom: 6 },
  mdListItem: { flexDirection: 'row', marginBottom: 2 },
  mdBullet: { width: 14, color: COLORS.muted },
  mdListBody: { flex: 1 },
  mdLink: { color: COLORS.blue600, textDecoration: 'none' },
  mdCode: { fontFamily: 'Courier', fontSize: 9 },
  mdQuote: {
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: COLORS.muted,
    backgroundColor: COLORS.surfaceSubtle,
    borderLeft: `2 solid ${COLORS.muted}`,
  },
  mdRule: { marginVertical: 8, borderBottom: `1 solid ${COLORS.border}` },
  mdTable: { marginBottom: 8, border: `1 solid ${COLORS.border}`, borderRadius: 4 },
  mdTableCell: { flex: 1, paddingVertical: 4, paddingHorizontal: 6, fontSize: 9 },
});
