import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { FiBarChart2, FiUsers } from 'react-icons/fi';
import { getAllPages } from '../../api/getAllPages';
import { selectClients, setClients } from '../../features/clients/clients.slice';
import ClientList from '../../components/reports/ClientList';
import ClientReport from '../../components/reports/ClientReport';
import PageHeader from '../../components/shared/page/PageHeader';
import LoadingState from '../../components/shared/page/LoadingState';
import ErrorState from '../../components/shared/page/ErrorState';
import EmptyState from '../../components/shared/page/EmptyState';
import './Reports.css';

// Página de reportes: a la izquierda la lista de clientes, a la derecha el reporte del elegido
const Reports = () => {
  const dispatch = useDispatch();
  // La cartera es estado global (la comparte con Clientes); los bancos solo se usan acá
  const clients = useSelector(selectClients);
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cambiarlo vuelve a disparar la carga (botón "Reintentar")
  const [reloadKey, setReloadKey] = useState(0);

  // El cliente elegido vive en la URL (?cliente=id): se conserva al recargar o volver atrás (spec §8.6)
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('cliente') ?? '';

  useEffect(() => {
    const loadClientsAndBanks = async () => {
      try {
        const [clientList, bankList] = await Promise.all([getAllPages('/client'), getAllPages('/bank')]);
        dispatch(setClients(clientList));
        setBanks(bankList);
      } catch (err) {
        setError(err.userMessage || 'No se pudieron cargar los clientes y bancos.');
      } finally {
        setIsLoading(false);
      }
    };

    loadClientsAndBanks();
  }, [dispatch, reloadKey]);

  const handleRetry = () => {
    setError('');
    setIsLoading(true);
    setReloadKey(reloadKey + 1);
  };

  const selectClient = (clientId) => setSearchParams({ cliente: clientId });

  const selectedClient = clients.find((client) => client._id === selectedId);
  const isReady = !isLoading && !error;

  return (
    <div className='page'>
      <PageHeader
        title='Reportes'
        subtitle='Consultá la composición de la cartera de cada cliente y las noticias que pueden afectarla.'
      />

      {isLoading && <LoadingState label='Cargando clientes...' />}
      {!isLoading && error && <ErrorState message={error} onRetry={handleRetry} />}

      {isReady && clients.length === 0 && (
        <div className='card'>
          <EmptyState
            icon={FiUsers}
            title='Todavía no tenés clientes'
            text='Registrá un cliente e importá sus posiciones para ver sus reportes.'>
            <Link to='/clients' className='button button--primary'>
              Ir a clientes
            </Link>
          </EmptyState>
        </div>
      )}

      {isReady && clients.length > 0 && (
        <div className='reports'>
          <ClientList clients={clients} selectedId={selectedId} onSelect={selectClient} />

          <div className='reports__detail'>
            {selectedClient ?
              // La key hace que al cambiar de cliente el reporte empiece de cero (sin filtros ni datos viejos)
              <ClientReport key={selectedClient._id} client={selectedClient} banks={banks} />
            : <div className='card'>
                <EmptyState
                  icon={FiBarChart2}
                  title='Elegí un cliente'
                  text='Seleccioná un cliente de la lista para ver su cartera, su composición y el análisis de noticias.'
                />
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
