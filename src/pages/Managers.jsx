import { useState } from "react";
import ManagerTable from "../components/managers/ManagerTable";
import ManagerForm from "../components/managers/ManagerForm";

const Managers = () => {
  const [showForm, setShowForm] = useState(false);

  const [selectedManager, setSelectedManager] = useState(null);

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

  return (
    <div>
      <h1>Managers</h1>
      <p>Administrá los managers de tu firma.</p>

      <ManagerTable onEdit={handleEdit} />

      {!showForm && (
        <button type="button" onClick={handleAdd}>
          Agregar manager
        </button>
      )}

      {showForm && (
        <div>
          <h2>
            {selectedManager ? "Editar manager" : "Agregar manager"}
          </h2>

          <ManagerForm
            manager={selectedManager}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        </div>
      )}
    </div>
  );
};

export default Managers;