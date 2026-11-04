import { useState } from 'react';
import ManagerTable from '../components/managers/ManagerTable';
import ManagerForm from '../components/managers/ManagerForm';
import Modal from '../components/shared/modal/Modal';
import Button from '../components/shared/button/Button';
import { getRole } from '../utils/utils';

const Managers = () => {
  const canCreate = getRole() === 'advisor';

  const [showForm, setShowForm] = useState(false);

  const [selectedManager, setSelectedManager] = useState(null);

  // gestiona pagination
  const [tableKey, setTableKey] = useState(0);

  const handleAdd = () => {
    setSelectedManager(null);
    setShowForm(true);
  };

  const handleEdit = (manager) => {
    setSelectedManager(manager);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedManager(null);
  };

  const handleSuccess = ({ created } = {}) => {
    handleClose();
    if (created) setTableKey((key) => key + 1);
  };

  return (
    <div className='page'>
      <h1>Managers</h1>

      <p>Administrá los managers de tu firma.</p>

      {canCreate && <Button type='primary' label='Agregar nuevo manager' onClick={handleAdd} />}

      <ManagerTable key={tableKey} onEdit={handleEdit} />

      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={selectedManager ? 'Editar manager' : 'Agregar manager'}>
        {/* el formulario se renderiza dentro del componente modal */}
        <ManagerForm manager={selectedManager} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default Managers;
