import { useState } from 'react';
import InstrumentTable from '../../components/instruments/InstrumentTable';
import InstrumentForm from '../../components/instruments/InstrumentForm';
import Modal from '../../components/shared/modal/Modal';
import Button from '../../components/shared/button/Button';

const Instruments = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // gestiona pagination
  const [tableKey, setTableKey] = useState(0);

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

  const handleSuccess = ({ created } = {}) => {
    handleClose();
    if (created) setTableKey((key) => key + 1);
  };

  return (
    <div className='page'>
      <h1>Instrumentos</h1>

      <p>Administrá el catálogo de instrumentos. Para agregar uno nuevo alcanza con su ISIN.</p>

      <Button type='primary' label='Agregar nuevo instrumento' onClick={handleAdd} />

      <InstrumentTable key={tableKey} onEdit={handleEdit} />

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
