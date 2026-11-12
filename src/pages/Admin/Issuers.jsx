import { useState } from 'react';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import IssuerTable from '../../components/issuers/IssuerTable';
import IssuerForm from '../../components/issuers/IssuerForm';
import Modal from '../../components/shared/modal/Modal';
import { FiPlus } from 'react-icons/fi';
import Button from '../../components/shared/button/Button';
import PageHeader from '../../components/shared/page/PageHeader';

const Issuers = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedIssuer, setSelectedIssuer] = useState(null);

  // La página es dueña del listado: lo recarga después de crear, editar o borrar
  const list = usePaginatedList('/issuer', 15);

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

  // Un alta aparece en la página 1 (el listado viene del más reciente); una edición recarga la actual
  const handleSuccess = ({ created } = {}) => {
    handleClose();
    list.reload(created ? 1 : list.page);
  };

  return (
    <div className='page'>
      <PageHeader
        title='Emisores'
        subtitle='Administrá el catálogo de emisores.'
        actions={<Button type='primary' icon={FiPlus} label='Agregar emisor' onClick={handleAdd} />}
      />

      <IssuerTable list={list} onEdit={handleEdit} onDeleted={list.reload} />

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
