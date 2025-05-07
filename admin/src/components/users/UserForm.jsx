import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import SelectInput from '../common/FormComponents/SelectInput';
import '../common/FormComponents/FormStyles.css';

const UserForm = ({ initialData = {}, onSubmit, submitButtonText = 'Lưu', condition = {} }) => {
  const [formData, setFormData] = useState({
    username: initialData.username || '',
    email: initialData.email || '',
    password: initialData.password || '',
    full_name: initialData.full_name || '',
    phone_number: initialData.phone_number || '',
    address: initialData.address || '',
    role: initialData.role || 'user'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    
    if (!formData.username) tempErrors.username = 'Tên người dùng không được để trống';
    if (!formData.email) tempErrors.email = 'Email không được để trống';
    if (!initialData.id && !formData.password) tempErrors.password = 'Mật khẩu không được để trống';
    
    // Validate email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Định dạng email không hợp lệ';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Chuẩn hóa chuỗi tiếng Việt theo form NFC để hiển thị đúng dấu
    const normalizedValue = value.normalize('NFC');
    
    setFormData({
      ...formData,
      [name]: normalizedValue
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Không cần chuẩn hóa lại vì đã chuẩn hóa trong handleChange
      // Chỉ tạo một bản sao của formData để tránh thay đổi state
      const dataToSubmit = {...formData};
      
      // Nếu là cập nhật và không nhập password mới thì không gửi trường password
      if (initialData.id && !dataToSubmit.password) {
        const { password, ...dataWithoutPassword } = dataToSubmit;
        onSubmit(dataWithoutPassword);
      } else {
        onSubmit(dataToSubmit);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form" acceptCharset="UTF-8">
      <div className="form-grid">
        <div className="form-section">
          <h3>Thông tin người dùng</h3>
          
          <TextInput
            label="Tên người dùng"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
          />
          
          <TextInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          
          {!condition.hidden_required_password && (
            <TextInput
              label={`Mật khẩu${initialData.id ? '' : ' *'}${initialData.id ? ' (Để trống nếu không muốn thay đổi)' : ''}`}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required={!initialData.id}
            />
          )}
          
          <TextInput
            label="Họ và tên"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
          />
          
          <TextInput
            label="Số điện thoại"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
          
          <TextareaInput
            label="Địa chỉ"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
          />
          
          <SelectInput
            label="Vai trò"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' }
            ]}
          />
        </div>
      </div>
      
      <div className="form-actions">
        <Link to="/users" className="btn-cancel">Hủy</Link>
        <button type="submit" className="btn-submit">{submitButtonText}</button>
      </div>
    </form>
  );
};

export default UserForm;
