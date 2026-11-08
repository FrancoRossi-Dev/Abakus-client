import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import backend from '../../api/backend';
import { addBankAccountSchema } from '../../validators/client.validators';
import FormAlert from '../shared/form/FormAlert';
import Button from '../shared/button/Button';
import BankAccountFields from './BankAccountFields';
import { EMPTY_ACCOUNT, toAccountPayload } from './bankAccounts';
import './ClientForm.css';

// Agrega una cuenta a un cliente existente. Se envía la lista completa (guardadas + la nueva).
const BankAccountForm = ({ client, banks, onSuccess, onCancel }) => {
  const formId = useId();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(addBankAccountSchema),
    mode: 'onTouched',
    defaultValues: EMPTY_ACCOUNT,
  });

  const handleSave = async (account) => {
    setError('');

    try {
      const res = await backend.patch(`/client/${client._id}`, {
        bankAccounts: [...client.bankAccounts.map(toAccountPayload), account],
      });
      onSuccess(res.data.client);
    } catch (err) {
      setError(
        err.response?.status === 409 ?
          'Esa cuenta ya está registrada.'
        : err.userMessage || 'No se pudo agregar la cuenta.',
      );
    }
  };

  return (
    <form className='client-form' onSubmit={handleSubmit(handleSave)} noValidate>
      <BankAccountFields
        register={register}
        errors={errors}
        banks={banks}
        disabled={isSubmitting}
        idFor={(name) => `${formId}-${name}`}
      />

      <FormAlert>{error}</FormAlert>

      <div className='modal__actions'>
        <Button type='secondary' label='Cancelar' onClick={onCancel} disabled={isSubmitting} />
        <Button
          type='primary'
          htmlType='submit'
          label={isSubmitting ? 'Guardando...' : 'Agregar cuenta'}
          disabled={!isValid || isSubmitting}
          aria-busy={isSubmitting}
        />
      </div>
    </form>
  );
};

export default BankAccountForm;
