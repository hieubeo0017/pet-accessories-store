import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import '../common/FormComponents/FormStyles.css';

const UserForm = ({ initialData, onSubmit, submitButtonText,condition }) => {
    const [formData, setFormData] = useState(initialData || {
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        address: '',
        role: 'user', // Default role
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username?.trim()) newErrors.username = 'Tên người dùng không được để trống';
        if (!formData.email?.trim()) newErrors.email = 'Email không được để trống';
        if (!condition?.hidden_required_password && !formData.password?.trim()) {
            newErrors.password = 'Mật khẩu không được để trống';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form className="brand-form" onSubmit={handleSubmit}>
            <div>
                <div className="form-section">
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
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />
                    <TextInput
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                    />
                    <TextInput
                        label="Họ tên"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        error={errors.full_name}
                    />
                    <TextInput
                        label="Số điện thoại"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        error={errors.phone_number}
                    />
                    <TextareaInput
                        label="Địa chỉ"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                        rows={5}
                    />
                    <div className="form-row">
                        <label>
                            <span>Vai trò</span>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <Link to="/users" className="btn-cancel">Hủy</Link>
                <button type="submit" className="btn-submit">{submitButtonText || 'Lưu'}</button>
            </div>
        </form>
    );
};

export default UserForm;
