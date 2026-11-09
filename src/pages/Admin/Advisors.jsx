import { useState } from 'react';
import AdvisorTable from '../../components/advisors/AdvisorTable';
import AdvisorForm from '../../components/advisors/AdvisorForm';
import Modal from '../../components/shared/modal/Modal';
import { FiPlus } from 'react-icons/fi';
import Button from '../../components/shared/button/Button';
import PageHeader from '../../components/shared/page/PageHeader';

const Advisors = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  // gestiona pagination
  const [tableKey, setTableKey] = useState(0);

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

  const handleSuccess = ({ created } = {}) => {
    handleClose();
    if (created) setTableKey((key) => key + 1);
  };

  return (
    <div className='page'>
      <PageHeader
        title='Advisors'
        subtitle='Administrá las cuentas de los advisors registrados en el sistema.'
        actions={<Button type='primary' icon={FiPlus} label='Agregar advisor' onClick={handleAdd} />}
      />

      <AdvisorTable key={tableKey} onEdit={handleEdit} />

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
