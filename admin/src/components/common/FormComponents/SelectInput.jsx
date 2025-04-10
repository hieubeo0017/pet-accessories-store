import React from 'react';

const SelectInput = ({ 
  label,
  name, 
  value, 
  onChange,
  options = [],
  placeholder = 'Chọn...',
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
      
      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          className={`form-control ${error ? 'error' : ''}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">
          <i className="fas fa-chevron-down"></i>
        </span>
      </div>
      
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default SelectInput;