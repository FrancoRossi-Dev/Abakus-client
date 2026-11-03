import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import backend from "../../api/backend";
import {
  setManagers,
  removeManager,
} from "../../features/managers/managers.slice";

const ManagerTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const managers = useSelector((state) => state.managers.list);

  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // Obtiene el listado al abrir el componente
  useEffect(() => {
    let cancelled = false;

    const loadManagers = async () => {
      try {
        const token = localStorage.getItem("abakus-token");

        if (!token) {
          throw new Error("Iniciá sesión para ver los managers.");
        }

        const allManagers = [];
        let page = 1;
        let pages = 1;

        // Obtiene todas las paginas del listado.
        while (page <= pages && !cancelled) {
          const response = await backend.get("/manager", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page,
              limit: 100,
            },
          });

          allManagers.push(...response.data.data);
          pages = response.data.pages;
          page++;
        }

        if (!cancelled) {
          dispatch(setManagers(allManagers));
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "No se pudieron cargar los managers."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadManagers();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const handleDelete = async (manager) => {
    const confirmed = window.confirm(
      `¿Querés eliminar a ${manager.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      setDeletingId(manager._id);

      const token = localStorage.getItem("abakus-token");

      await backend.delete(`/manager/${manager._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Actualiza solamente si el backend confirmo la baja
      dispatch(removeManager(manager._id));
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo eliminar el manager."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <p>Cargando managers...</p>;
  }

  return (
    <div>
      {error && <p role="alert">{error}</p>}

      {managers.length === 0 ? (
        <p>No hay managers registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {managers.map((manager) => (
              <tr key={manager._id}>
                <td>{manager.fullName}</td>
                <td>{manager.email}</td>

                <td>
                  <button
                    type="button"
                    onClick={() => onEdit(manager)}
                    disabled={deletingId !== null}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(manager)}
                    disabled={deletingId !== null}
                  >
                    {deletingId === manager._id
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagerTable;