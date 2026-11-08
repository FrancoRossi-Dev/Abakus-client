import FormField from '../shared/form/FormField';

// Campos de una cuenta bancaria (banco, número, nombre, moneda).
// prefix: ruta del objeto en el formulario ('bankAccounts.0') o '' si la cuenta es el formulario entero.
// errors: errores de ESA cuenta. idFor: arma ids únicos para los labels.
const BankAccountFields = ({ register, errors, banks, prefix = '', disabled, idFor }) => {
  const name = (field) => (prefix ? `${prefix}.${field}` : field);

  return (
    <div className='client-form__grid'>
      <FormField
        as='select'
        id={idFor('bankId')}
        label='Banco'
        disabled={disabled}
        error={errors?.bankId?.message}
        {...register(name('bankId'))}>
        <option value=''>Elegí un banco</option>
        {banks.map((bank) => (
          <option key={bank._id} value={bank._id}>
            {bank.name}
          </option>
        ))}
      </FormField>

      <FormField
        id={idFor('number')}
        label='Número de cuenta'
        inputMode='numeric'
        autoComplete='off'
        disabled={disabled}
        error={errors?.number?.message}
        {...register(name('number'))}
      />

      <FormField
        id={idFor('accountName')}
        label='Nombre de la cuenta'
        disabled={disabled}
        error={errors?.accountName?.message}
        {...register(name('accountName'))}
      />

      <FormField
        id={idFor('currency')}
        label='Moneda'
        placeholder='USD'
        disabled={disabled}
        error={errors?.currency?.message}
        {...register(name('currency'))}
      />
    </div>
  );
};

export default BankAccountFields;
