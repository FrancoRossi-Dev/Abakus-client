import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import backend from '../../api/backend';
import ClientForm from '../../components/clients/ClientForm';
import BankAccountForm from '../../components/clients/BankAccountForm';
import { toAccountPayload } from '../../components/clients/bankAccounts';
import ClientAvatar from '../../components/clients/ClientAvatar';
import ClientLogoUpload from '../../components/clients/ClientLogoUpload';
import DataTable from '../../components/shared/table/DataTable';
import Modal from '../../components/shared/modal/Modal';
import Button from '../../components/shared/button/Button';
import DeleteButton from '../../components/shared/button/DeleteButton';
import LoadingState from '../../components/shared/page/LoadingState';
import ErrorState from '../../components/shared/page/ErrorState';
import EmptyState from '../../components/shared/page/EmptyState';
import { clientSaved } from '../../features/clients/clients.slice';

const ALL_ITEMS = { params: { limit: 100 } };

const ClientDetail = () => {
  const { clientId } = useParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setLocalClient] = useState(null);

  // Cada cambio confirmado por la API se refleja también en la cartera de Redux,
  // así el listado de clientes y los reportes no muestran datos viejos
  const setClient = (updated) => {
    setLocalClient(updated);
    dispatch(clientSaved(updated));
  };
  const [banks, setBanks] = useState([]);
  const [managers, setManagers] = useState([]);

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Cambiarlo vuelve a disparar la carga (botón "Reintentar")
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, banksRes, managersRes] = await Promise.all([
          backend.get(`/client/${clientId}`),
          backend.get('/bank', ALL_ITEMS),
          backend.get('/manager', ALL_ITEMS),
        ]);
        setLocalClient(clientRes.data);
        setBanks(banksRes.data.data);
        setManagers(managersRes.data.data);
      } catch (err) {
        setError(err.userMessage || 'No se pudo cargar el cliente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId, reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const bankNames = useMemo(() => new Map(banks.map((bank) => [bank._id, bank.name])), [banks]);

  const activeAccounts = useMemo(
    () => client?.bankAccounts.filter((account) => !account.isDeleted) ?? [],
    [client],
  );

  const handleClientSaved = (updated) => {
    setClient(updated);
    toast.success('Cliente actualizado.');
  };

  const handleAccountAdded = (updated) => {
    setClient(updated);
    setShowAccountForm(false);
    toast.success('Cuenta agregada.');
  };

  // Baja lógica: se manda la lista completa con la cuenta marcada isDeleted.
  // La API la rechaza (409) si la cuenta todavía tiene posiciones activas.
  const handleDeleteAccount = async (account) => {
    const confirmed = window.confirm(`¿Querés eliminar la cuenta ${account.number}?`);
    if (!confirmed) return;

    try {
      setDeletingId(account._id);
      const bankAccounts = client.bankAccounts.map((stored) =>
        toAccountPayload(stored._id === account._id ? { ...stored, isDeleted: true } : stored),
      );
      const res = await backend.patch(`/client/${client._id}`, { bankAccounts });
      setClient(res.data.client);
      toast.success('Cuenta eliminada.');
    } catch (err) {
      toast.error(
        err.response?.status === 409 ?
          'La cuenta tiene posiciones activas y no se puede eliminar.'
        : err.userMessage || 'No se pudo eliminar la cuenta.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  const accountColumns = [
    { key: 'bank', header: 'Banco', render: (account) => bankNames.get(account.bankId) || '—' },
    { key: 'number', header: 'Número' },
    { key: 'accountName', header: 'Nombre' },
    { key: 'currency', header: 'Moneda' },
  ];

  const renderAccountActions = (account) => (
    <DeleteButton onClick={() => handleDeleteAccount(account)} disabled={deletingId !== null}>
      {deletingId === account._id ? 'Eliminando...' : 'Eliminar'}
    </DeleteButton>
  );

  const isReady = !isLoading && !error;

  return (
    <div className='page'>
      <Link to='/clients' className='page__back'>
        <FiArrowLeft aria-hidden='true' /> Volver a clientes
      </Link>

      <header className='page-header'>
        <div className='client-identity'>
          {client && (
            <ClientAvatar
              name={client.clientDetails.commercialName}
              src={client.clientDetails.logoURL}
              size='lg'
            />
          )}
          <div className='page-header__text'>
            <h1>{client?.clientDetails.commercialName || 'Cliente'}</h1>
            <p className='page-header__subtitle'>
              Modificá los datos del cliente y gestioná sus cuentas bancarias.
            </p>
          </div>
        </div>

        {isReady && <ClientLogoUpload client={client} onUploaded={setClient} />}
      </header>

      {isLoading && <LoadingState label='Cargando cliente...' />}
      {!isLoading && error && <ErrorState message={error} onRetry={handleRetry} />}

      {isReady && (
        <>
          <section>
            <h2>Datos del cliente</h2>
            <ClientForm
              client={client}
              managers={managers}
              banks={banks}
              onSuccess={handleClientSaved}
            />
          </section>

          <section>
            <div className='page-header'>
              <h2>Cuentas bancarias</h2>
              <div className='page__actions'>
                <Button
                  type='primary'
                  icon={FiPlus}
                  label='Agregar cuenta'
                  onClick={() => setShowAccountForm(true)}
                />
              </div>
            </div>

            <DataTable
              columns={accountColumns}
              data={activeAccounts}
              renderActions={renderAccountActions}
              itemLabel='cuentas'
              emptyMessage={
                <EmptyState
                  compact
                  title='Este cliente no tiene cuentas activas'
                  text='Agregá una cuenta para poder importar sus posiciones.'
                />
              }
            />
          </section>

          <Modal
            isOpen={showAccountForm}
            onClose={() => setShowAccountForm(false)}
            title='Agregar cuenta bancaria'>
            <BankAccountForm
              client={client}
              banks={banks}
              onSuccess={handleAccountAdded}
              onCancel={() => setShowAccountForm(false)}
            />
          </Modal>
        </>
      )}
    </div>
  );
};

export default ClientDetail;
