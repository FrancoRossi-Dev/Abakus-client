import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FiPlus, FiUpload } from 'react-icons/fi';
import backend from '../../api/backend';
import ClientTable from '../../components/clients/ClientTable';
import ClientForm from '../../components/clients/ClientForm';
import PositionImportForm from '../../components/positions/PositionImportForm';
import Modal from '../../components/shared/modal/Modal';
import Button from '../../components/shared/button/Button';
import FormAlert from '../../components/shared/form/FormAlert';

// para tener todos los clientes, managers y bancos en una sola página.
const ALL_ITEMS = { params: { limit: 100 } };

const Clients = () => {
  // estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // datos de usuario, evaluar si los necesitamos en otro lado -> pasar a redux
  const [clients, setClients] = useState([]);
  const [banks, setBanks] = useState([]);
  const [managers, setManagers] = useState([]);

  const [showImportForm, setShowImportForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);

  // Cambiarlo vuelve a disparar la carga (botón "Reintentar")
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // el backend devuelve solo los clientes y managers del advisor logueado (sale del token)
        // las listas vienen paginadas: { data, total, page, limit, pages }
        const [clientsRes, banksRes, managersRes] = await Promise.all([
          backend.get('/client', ALL_ITEMS),
          backend.get('/bank', ALL_ITEMS),
          backend.get('/manager', ALL_ITEMS),
        ]);
        setClients(clientsRes.data.data);
        setBanks(banksRes.data.data);
        setManagers(managersRes.data.data);
      } catch (err) {
        setError(err.userMessage || 'No se pudieron cargar los clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const handleOpenImport = () => {
    setShowImportForm(true);
  };

  const handleCloseImport = () => {
    setShowImportForm(false);
  };

  const handleImportSuccess = ({ count }) => {
    setShowImportForm(false);
    toast.success(`Se importaron ${count} posiciones.`);
  };

  const handleOpenClientForm = () => {
    setShowClientForm(true);
  };

  const handleCloseClientForm = () => {
    setShowClientForm(false);
  };

  // La API solo devuelve el id del cliente nuevo: se recarga la lista para mostrarlo
  const handleClientSuccess = async () => {
    setShowClientForm(false);
    toast.success('Cliente registrado.');

    try {
      const clientsRes = await backend.get('/client', ALL_ITEMS);
      setClients(clientsRes.data.data);
    } catch (err) {
      toast.error(err.userMessage || 'No se pudo actualizar la lista de clientes.');
    }
  };

  const hasClients = clients.length > 0;
  const isReady = !isLoading && !error;

  return (
    <div className='page'>
      <header className='page-header'>
        <div className='page-header__text'>
          <h1>Mis clientes</h1>
          <p className='page-header__subtitle'>
            Consultá tu cartera, registrá clientes e importá sus posiciones.
          </p>
        </div>

        {/* Acción principal a la derecha; la secundaria con menos peso visual (spec §7) */}
        {isReady && (
          <div className='page__actions'>
            <Button
              type='secondary'
              icon={FiUpload}
              label='Importar posiciones'
              onClick={handleOpenImport}
              disabled={!hasClients}
            />
            <Button
              type='primary'
              icon={FiPlus}
              label='Registrar cliente'
              onClick={handleOpenClientForm}
            />
          </div>
        )}
      </header>

      {isLoading && (
        <div className='page-status' role='status'>
          <FontAwesomeIcon icon={faSpinner} spin className='page-status__spinner' />
          <span>Cargando clientes...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className='page-error'>
          <FormAlert title='No se pudo cargar la página'>{error}</FormAlert>
          <Button type='secondary' label='Reintentar' onClick={handleRetry} />
        </div>
      )}

      {/* tabla con datos de cliente */}
      {isReady && (
        <ClientTable clients={clients} managers={managers} onCreate={handleOpenClientForm} />
      )}

      {/* Modal de alta de cliente */}
      <Modal
        isOpen={showClientForm}
        onClose={handleCloseClientForm}
        title='Registrar cliente'
        size='lg'>
        <ClientForm
          managers={managers}
          banks={banks}
          onSuccess={handleClientSuccess}
          onCancel={handleCloseClientForm}
        />
      </Modal>

      {/* Modal de ingreso de datos */}
      <Modal isOpen={showImportForm} onClose={handleCloseImport} title='Importar posiciones'>
        <PositionImportForm
          clients={clients}
          banks={banks}
          onSuccess={handleImportSuccess}
          onCancel={handleCloseImport}
        />
      </Modal>
    </div>
  );
};

export default Clients;
