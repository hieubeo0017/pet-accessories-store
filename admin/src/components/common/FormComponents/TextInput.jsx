import React, { useState } from 'react';

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
  // Thêm state để kiểm soát hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  
  // Xác định thực sự type là gì (nếu type=password và showPassword=true thì chuyển thành text)
  const actualType = type === 'password' && showPassword ? 'text' : type;
  
  // Hàm để toggle hiển thị mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

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
      
      <div style={{ position: 'relative' }}>
        <input
          id={name}
          type={actualType}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-control ${error ? 'error' : ''}`}
          {...props}
        />
        
        {/* Chỉ hiển thị nút con mắt khi type là password */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#6c757d'
            }}
            tabIndex="-1"
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        )}
      </div>
      
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default TextInput;