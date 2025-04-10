import React from 'react';

const TextInput = ({ 
  label,
  name, 
  value, 
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  error = null,
  ...props 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label 
          htmlFor={name} 
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <input
        id={name}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control ${error ? 'error' : ''}`}
        {...props}
      />
      
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default TextInput;