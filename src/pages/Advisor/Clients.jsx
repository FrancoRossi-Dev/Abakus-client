import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiPlus, FiUpload } from 'react-icons/fi';
import backend from '../../api/backend';
import { getAllPages } from '../../api/getAllPages';
import ClientTable from '../../components/clients/ClientTable';
import ClientForm from '../../components/clients/ClientForm';
import PositionImportForm from '../../components/positions/PositionImportForm';
import Modal from '../../components/shared/modal/Modal';
import Button from '../../components/shared/button/Button';
import FormAlert from '../../components/shared/form/FormAlert';
import LoadingState from '../../components/shared/page/LoadingState';
import ErrorState from '../../components/shared/page/ErrorState';
import {
  clientRemoved,
  clientSaved,
  selectClients,
  setClients,
} from '../../features/clients/clients.slice';
import { selectCanAddClient, selectPlan, setPlan } from '../../features/account/account.slice';

const PLAN_NAMES = { base: 'Base', premium: 'Premium' };

// La API responde en inglés: los errores esperables al borrar se traducen por código de estado
const DELETE_ERRORS = {
  404: 'El cliente ya no existe.',
  409: 'El cliente todavía tiene cuentas bancarias activas. Eliminalas antes de borrar al cliente.',
};

const Clients = () => {
  const dispatch = useDispatch();

  // Clientes y plan viven en Redux: los comparten Detalle, Reportes, Inicio y Mi plan
  const clients = useSelector(selectClients);
  const plan = useSelector(selectPlan);
  const canAddClient = useSelector(selectCanAddClient);

  // Bancos y managers solo se usan acá para completar los formularios
  const [banks, setBanks] = useState([]);
  const [managers, setManagers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [showImportForm, setShowImportForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  // cliente que se está editando en el modal (null: modal cerrado)
  const [editingClient, setEditingClient] = useState(null);

  // Cambiarlo vuelve a disparar la carga (botón "Reintentar")
  const [reloadKey, setReloadKey] = useState(0);

  // El uso del plan cambia al registrar o borrar clientes: se vuelve a pedir
  const refreshPlan = async () => {
    try {
      const { data } = await backend.get('/user/me/plan');
      dispatch(setPlan(data));
    } catch {
      // sin el plan se deja registrar igual: la API vuelve a controlar el límite
    }
  };

  useEffect(() => {
    // El plan va aparte: si falla, la cartera se muestra igual
    const fetchPlan = async () => {
      try {
        const { data } = await backend.get('/user/me/plan');
        dispatch(setPlan(data));
      } catch {
        // sin el plan se deja registrar igual: la API vuelve a controlar el límite
      }
    };

    const fetchData = async () => {
      try {
        // el backend devuelve solo los clientes y managers del advisor logueado (sale del token)
        const [clientList, banksRes, managersRes] = await Promise.all([
          getAllPages('/client'),
          backend.get('/bank', { params: { limit: 100 } }),
          backend.get('/manager', { params: { limit: 100 } }),
        ]);
        dispatch(setClients(clientList));
        setBanks(banksRes.data.data);
        setManagers(managersRes.data.data);
      } catch (err) {
        setError(err.userMessage || 'No se pudieron cargar los clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
    fetchData();
  }, [dispatch, reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const handleImportSuccess = ({ count, clientCount }) => {
    setShowImportForm(false);
    toast.success(
      `Se importaron ${count} posiciones de ${clientCount} ${clientCount === 1 ? 'cliente' : 'clientes'}.`,
    );
  };

  // La API solo devuelve el id del cliente nuevo: se recarga la lista para mostrarlo
  const handleClientCreated = async () => {
    setShowClientForm(false);
    toast.success('Cliente registrado.');
    refreshPlan();

    try {
      dispatch(setClients(await getAllPages('/client')));
    } catch (err) {
      toast.error(err.userMessage || 'No se pudo actualizar la lista de clientes.');
    }
  };

  const handleClientEdited = (updated) => {
    dispatch(clientSaved(updated));
    setEditingClient(null);
    toast.success('Cliente actualizado.');
  };

  const handleDelete = async (client) => {
    const { commercialName } = client.clientDetails;
    const confirmed = window.confirm(
      `¿Querés eliminar a ${commercialName}? Dejará de aparecer en tu cartera y en los reportes.`,
    );
    if (!confirmed) return;

    setDeletingId(client._id);
    try {
      await backend.delete(`/client/${client._id}`);
      // Se saca de la lista solo cuando la API confirmó la baja
      dispatch(clientRemoved(client._id));
      toast.success(`${commercialName} fue eliminado.`);
      // libera un lugar del plan
      refreshPlan();
    } catch (err) {
      toast.error(
        DELETE_ERRORS[err.response?.status] || err.userMessage || 'No se pudo eliminar el cliente.',
      );
    } finally {
      setDeletingId(null);
    }
  };

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

        {/* Acción principal (importar) a la derecha; la secundaria con menos peso visual (spec §7) */}
        {isReady && (
          <div className='page__actions'>
            <Button
              type='secondary'
              icon={FiPlus}
              label='Registrar cliente'
              onClick={() => setShowClientForm(true)}
              disabled={!canAddClient}
              title={canAddClient ? undefined : 'Llegaste al límite de clientes de tu plan'}
            />
            <Button
              type='primary'
              icon={FiUpload}
              label='Importar posiciones'
              onClick={() => setShowImportForm(true)}
            />
          </div>
        )}
      </header>

      {isLoading && <LoadingState label='Cargando clientes...' />}
      {!isLoading && error && <ErrorState message={error} onRetry={handleRetry} />}

      {/* El alta solo se permite si la cantidad de clientes del plan lo permite */}
      {isReady && !canAddClient && (
        <FormAlert tone='warning' title='Llegaste al límite de tu plan'>
          <p>
            Tu plan {PLAN_NAMES[plan.planTier] ?? plan.planTier} permite hasta {plan.limit} clientes
            activos y ya tenés {plan.clientsRegistered}. Para registrar más,{' '}
            <Link to='/upgrade'>pasate al plan Premium</Link> o eliminá un cliente que ya no gestiones.
          </p>
        </FormAlert>
      )}

      {/* tabla con datos de cliente */}
      {isReady && (
        <ClientTable
          clients={clients}
          managers={managers}
          onCreate={canAddClient ? () => setShowClientForm(true) : undefined}
          onEdit={setEditingClient}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      {/* Modal de alta de cliente */}
      <Modal
        isOpen={showClientForm}
        onClose={() => setShowClientForm(false)}
        title='Registrar cliente'
        size='lg'>
        <ClientForm
          managers={managers}
          banks={banks}
          onSuccess={handleClientCreated}
          onCancel={() => setShowClientForm(false)}
        />
      </Modal>

      {/* Modal de edición rápida: datos y manager (las cuentas se gestionan en el detalle) */}
      <Modal
        isOpen={editingClient !== null}
        onClose={() => setEditingClient(null)}
        title={`Editar ${editingClient?.clientDetails.commercialName ?? 'cliente'}`}
        size='lg'>
        {editingClient && (
          <ClientForm
            key={editingClient._id}
            client={editingClient}
            managers={managers}
            banks={banks}
            onSuccess={handleClientEdited}
            onCancel={() => setEditingClient(null)}
          />
        )}
      </Modal>

      {/* Modal de importación: el reporte del banco trae varios clientes, se asocian al leerlo */}
      <Modal isOpen={showImportForm} onClose={() => setShowImportForm(false)} title='Importar posiciones'>
        {showImportForm && (
          <PositionImportForm
            clients={clients}
            banks={banks}
            onSuccess={handleImportSuccess}
            onCancel={() => setShowImportForm(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Clients;
