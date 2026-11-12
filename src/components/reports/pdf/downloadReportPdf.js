import { createElement } from 'react';
import { getToday } from '../../../features/reports/newsAnalysis.slice';
import { normalizeText } from '../../../utils/format';

// "Café & Cía. S.A." → "cafe-cia-s-a"
const slugify = (text = '') =>
  normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cliente';

// react-pdf solo dibuja PNG y JPG. Cloudinary convierte al vuelo: se pide un PNG chico y cuadrado
// (el logo puede ser WEBP o GIF). Otras URLs se usan tal cual.
const toPdfImageUrl = (url) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/') ?
    url.replace('/upload/', '/upload/f_png,w_160,h_160,c_pad,b_white/')
  : url;

// Baja la imagen antes de armar el PDF. Si falla (red, CORS, formato), el PDF sale igual sin ella:
// la imagen es un complemento, no un motivo para no poder descargar el reporte.
const loadImage = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(toPdfImageUrl(url));
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!['image/png', 'image/jpeg'].includes(blob.type)) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * Genera el PDF del reporte y lo descarga.
 * react-pdf (~400 KB) se carga recién acá, con import() dinámico: no pesa en la carga inicial.
 */
export const downloadReportPdf = async (data) => {
  const [{ pdf }, { default: ReportPdf }, logo] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ReportPdf'),
    loadImage(data.client.logoURL),
  ]);

  const element = createElement(ReportPdf, { data: { ...data, client: { ...data.client, logo } } });
  const blob = await pdf(element).toBlob();

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
