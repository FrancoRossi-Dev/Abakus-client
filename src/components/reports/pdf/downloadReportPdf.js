import { createElement } from 'react';
import { getToday } from '../../../features/reports/newsAnalysis.slice';

// "Café & Cía. S.A." → "cafe-cia-s-a"
const slugify = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cliente';

/**
 * Genera el PDF del reporte y lo descarga.
 * react-pdf (~400 KB) se carga recién acá, con import() dinámico: no pesa en la carga inicial.
 */
export const downloadReportPdf = async (data) => {
  const [{ pdf }, { default: ReportPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ReportPdf'),
  ]);

  const blob = await pdf(createElement(ReportPdf, { data })).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `abakus-reporte-${slugify(data.client.commercialName)}-${getToday()}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  // Se libera después del click para que el navegador alcance a iniciar la descarga
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
