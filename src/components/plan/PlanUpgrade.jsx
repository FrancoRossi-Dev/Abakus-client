import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiStar } from 'react-icons/fi';
import backend from '../../api/backend';
import Button from '../shared/button/Button';
import { selectPlan, setPlan } from '../../features/account/account.slice';
import './PlanUpgrade.css';

// Cambio de plan: solo ofrece pasar a Premium si el usuario todavía no lo tiene
const PlanUpgrade = () => {
  const dispatch = useDispatch();
  const plan = useSelector(selectPlan);
  const [upgrading, setUpgrading] = useState(false);

  if (!plan) return null;

  if (plan.planTier === 'premium') {
    return <p className='plan-upgrade__done'>Ya tenés el plan Premium: no hay límites en tu cuenta.</p>;
  }

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await backend.patch('/user/me/plan', { planTier: 'premium' });
      // vuelve a pedir el uso para que el límite quede actualizado en toda la app
      const { data } = await backend.get('/user/me/plan');
      dispatch(setPlan(data));
      toast.success('¡Listo! Ya estás en el plan Premium.');
    } catch (err) {
      toast.error(err.userMessage || 'No se pudo actualizar el plan.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Button
      type='primary'
      icon={FiStar}
      label={upgrading ? 'Actualizando...' : 'Actualizar a plan Premium'}
      onClick={handleUpgrade}
      disabled={upgrading}
      aria-busy={upgrading}
    />
  );
};

export default PlanUpgrade;
