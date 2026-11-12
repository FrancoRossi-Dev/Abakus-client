import { useState } from 'react';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import AdvisorTable from '../../components/advisors/AdvisorTable';
import AdvisorForm from '../../components/advisors/AdvisorForm';
import Modal from '../../components/shared/modal/Modal';
import { FiPlus } from 'react-icons/fi';
import Button from '../../components/shared/button/Button';
import PageHeader from '../../components/shared/page/PageHeader';

const Advisors = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  // La página es dueña del listado: lo recarga después de crear, editar o borrar
  const list = usePaginatedList('/user/advisors', 15);

  const handleAdd = () => {
    setSelectedAdvisor(null);
    setShowForm(true);
  };

  const handleEdit = (advisor) => {
    setSelectedAdvisor(advisor);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedAdvisor(null);
  };

  // Un alta aparece en la página 1 (el listado viene del más reciente); una edición recarga la actual
  const handleSuccess = ({ created } = {}) => {
    handleClose();
    list.reload(created ? 1 : list.page);
  };

  return (
    <div className='page'>
      <PageHeader
        title='Advisors'
        subtitle='Administrá las cuentas de los advisors registrados en el sistema.'
        actions={<Button type='primary' icon={FiPlus} label='Agregar advisor' onClick={handleAdd} />}
      />

      <AdvisorTable list={list} onEdit={handleEdit} onDeleted={list.reload} />

      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={selectedAdvisor ? 'Editar advisor' : 'Agregar advisor'}>
        <AdvisorForm advisor={selectedAdvisor} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default Advisors;
