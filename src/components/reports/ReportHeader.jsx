import { Link } from 'react-router';
import { FiDownload } from 'react-icons/fi';
import ClientAvatar from '../clients/ClientAvatar';
import Button from '../shared/button/Button';
import { formatIsoDate } from '../../utils/format';

// Encabezado del reporte: quién es el cliente, el período informado y los botones de acción
const ReportHeader = ({
  client,
  logoURL,
  reportWindow,
  clientId,
  isExporting,
  hasAnalysis,
  canDownload,
  onDownload,
}) => (
  <header className='report__header'>
    <div className='client-identity'>
      <ClientAvatar name={client.commercialName} src={logoURL} size='lg' />
      <div className='page-header__text'>
        <h2 className='report__title'>{client.commercialName}</h2>
        <p className='page-header__subtitle'>
          {client.legalName}
          {reportWindow && (
            <>
              {' · '}Posiciones informadas del {formatIsoDate(reportWindow.from)} al{' '}
              {formatIsoDate(reportWindow.to)}
            </>
          )}
        </p>
      </div>
    </div>

    <div className='page__actions'>
      <Link to={`/clients/${clientId}`} className='button button--tertiary'>
        Gestionar cliente
      </Link>
      <Button
        type='secondary'
        icon={FiDownload}
        label={isExporting ? 'Generando PDF…' : 'Descargar PDF'}
        title={
          hasAnalysis ?
            'Incluye la cartera y el análisis de noticias de hoy'
          : 'Incluye la cartera. Generá el análisis de noticias para sumarlo al PDF'
        }
        onClick={onDownload}
        disabled={isExporting || !canDownload}
        aria-busy={isExporting}
      />
    </div>
  </header>
);

export default ReportHeader;
