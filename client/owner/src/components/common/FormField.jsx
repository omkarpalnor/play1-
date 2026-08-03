const FormField = ({ label, name, type, register, error, placeholder, helpText }) => (
  <div className="modern-form-field">
    <label className="modern-form-label" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      type={type}
      placeholder={placeholder || label}
      className="modern-input w-full"
      {...register(name)}
    />
    {error ? <span className="modern-form-error">{error.message}</span> : null}
    {!error && helpText ? <span className="modern-form-help">{helpText}</span> : null}
  </div>
);

export default FormField;
