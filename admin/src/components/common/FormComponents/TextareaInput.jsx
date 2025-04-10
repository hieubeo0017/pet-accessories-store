import React from 'react';

const TextareaInput = ({ 
  label,
  name, 
  value, 
  onChange,
  placeholder = '',
  required = false,
  rows = 3,
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
      
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`form-control ${error ? 'error' : ''}`}
        {...props}
      />
      
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default TextareaInput;