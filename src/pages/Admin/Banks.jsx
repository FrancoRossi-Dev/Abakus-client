import { useState } from 'react';
import BankTable from '../../components/banks/BankTable';
import BankForm from '../../components/banks/BankForm';
import Modal from '../../components/shared/modal/Modal';
import Button from '../../components/shared/button/Button';

const Banks = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedBank, setSelectedBank] = useState(null);

  // gestiona pagination
  const [tableKey, setTableKey] = useState(0);

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

  const handleSuccess = ({ created } = {}) => {
    handleClose();
    if (created) setTableKey((key) => key + 1);
  };

  return (
    <div className='page'>
      <h1>Bancos</h1>

      <p>Administrá el catálogo de bancos.</p>

      <Button type='primary' label='Agregar nuevo banco' onClick={handleAdd} />

      <BankTable key={tableKey} onEdit={handleEdit} />

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
