import { useState } from 'react';
import IssuerTable from '../../components/issuers/IssuerTable';
import IssuerForm from '../../components/issuers/IssuerForm';
import Modal from '../../components/shared/modal/Modal';
import { FiPlus } from 'react-icons/fi';
import Button from '../../components/shared/button/Button';
import PageHeader from '../../components/shared/page/PageHeader';

const Issuers = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedIssuer, setSelectedIssuer] = useState(null);

  // gestiona pagination
  const [tableKey, setTableKey] = useState(0);

  const handleAdd = () => {
    setSelectedIssuer(null);
    setShowForm(true);
  };

  const handleEdit = (issuer) => {
    setSelectedIssuer(issuer);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedIssuer(null);
  };

  const handleSuccess = ({ created } = {}) => {
    handleClose();
    if (created) setTableKey((key) => key + 1);
  };

  return (
    <div className='page'>
      <PageHeader
        title='Emisores'
        subtitle='Administrá el catálogo de emisores.'
        actions={<Button type='primary' icon={FiPlus} label='Agregar emisor' onClick={handleAdd} />}
      />

      <IssuerTable key={tableKey} onEdit={handleEdit} />

      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={selectedIssuer ? 'Editar emisor' : 'Agregar emisor'}>
        <IssuerForm issuer={selectedIssuer} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default Issuers;
