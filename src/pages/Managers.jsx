import { useState } from 'react';
import { usePaginatedList } from '../hooks/usePaginatedList';
import ManagerTable from '../components/managers/ManagerTable';
import ManagerForm from '../components/managers/ManagerForm';
import Modal from '../components/shared/modal/Modal';
import { FiPlus } from 'react-icons/fi';
import Button from '../components/shared/button/Button';
import PageHeader from '../components/shared/page/PageHeader';
import { getRole } from '../utils/utils';

const Managers = () => {
  const canCreate = getRole() === 'advisor';

  const [showForm, setShowForm] = useState(false);

  const [selectedManager, setSelectedManager] = useState(null);

  // La página es dueña del listado: lo recarga después de crear, editar o borrar
  const list = usePaginatedList('/manager', 15);

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

  // Un alta aparece en la página 1 (el listado viene del más reciente); una edición recarga la actual
  const handleSuccess = ({ created } = {}) => {
    handleClose();
    list.reload(created ? 1 : list.page);
  };

  return (
    <div className='page'>
      <PageHeader
        title='Managers'
        subtitle={
          canCreate ?
            'Administrá los managers de tu firma.'
          : 'Consultá los managers de todas las firmas.'
        }
        actions={
          canCreate && (
            <Button type='primary' icon={FiPlus} label='Agregar manager' onClick={handleAdd} />
          )
        }
      />

      <ManagerTable list={list} onEdit={handleEdit} onDeleted={list.reload} />

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
