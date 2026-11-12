import { useState } from 'react';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import BankTable from '../../components/banks/BankTable';
import BankForm from '../../components/banks/BankForm';
import Modal from '../../components/shared/modal/Modal';
import { FiPlus } from 'react-icons/fi';
import Button from '../../components/shared/button/Button';
import PageHeader from '../../components/shared/page/PageHeader';

const Banks = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedBank, setSelectedBank] = useState(null);

  // La página es dueña del listado: lo recarga después de crear, editar o borrar
  const list = usePaginatedList('/bank', 15);

  const handleAdd = () => {
    setSelectedBank(null);
    setShowForm(true);
  };

  const handleEdit = (bank) => {
    setSelectedBank(bank);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedBank(null);
  };

  // Un alta aparece en la página 1 (el listado viene del más reciente); una edición recarga la actual
  const handleSuccess = ({ created } = {}) => {
    handleClose();
    list.reload(created ? 1 : list.page);
  };

  return (
    <div className='page'>
      <PageHeader
        title='Bancos'
        subtitle='Administrá el catálogo de bancos.'
        actions={<Button type='primary' icon={FiPlus} label='Agregar banco' onClick={handleAdd} />}
      />

      <BankTable list={list} onEdit={handleEdit} onDeleted={list.reload} />

      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={selectedBank ? 'Editar banco' : 'Agregar banco'}>
        <BankForm bank={selectedBank} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default Banks;
