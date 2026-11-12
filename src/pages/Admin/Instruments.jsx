import { useState } from 'react';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import InstrumentTable from '../../components/instruments/InstrumentTable';
import InstrumentForm from '../../components/instruments/InstrumentForm';
import Modal from '../../components/shared/modal/Modal';
import { FiPlus } from 'react-icons/fi';
import Button from '../../components/shared/button/Button';
import PageHeader from '../../components/shared/page/PageHeader';

const Instruments = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // La página es dueña del listado: lo recarga después de crear, editar o borrar
  const list = usePaginatedList('/instrument', 15);

  const handleAdd = () => {
    setSelectedInstrument(null);
    setShowForm(true);
  };

  const handleEdit = (instrument) => {
    setSelectedInstrument(instrument);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedInstrument(null);
  };

  // Un alta aparece en la página 1 (el listado viene del más reciente); una edición recarga la actual
  const handleSuccess = ({ created } = {}) => {
    handleClose();
    list.reload(created ? 1 : list.page);
  };

  return (
    <div className='page'>
      <PageHeader
        title='Instrumentos'
        subtitle='Administrá el catálogo de instrumentos. Para agregar uno nuevo alcanza con su ISIN.'
        actions={<Button type='primary' icon={FiPlus} label='Agregar instrumento' onClick={handleAdd} />}
      />

      <InstrumentTable list={list} onEdit={handleEdit} onDeleted={list.reload} />

      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={selectedInstrument ? 'Editar instrumento' : 'Agregar instrumento'}>
        <InstrumentForm
          instrument={selectedInstrument}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
};

export default Instruments;
