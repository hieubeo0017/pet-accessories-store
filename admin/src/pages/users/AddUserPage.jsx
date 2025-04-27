import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import UserForm from "../../components/users/UserForm";

const AddUserPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      await userService.createUser(formData);
      toast.success('Người dùng đã được tạo thành công!');
      navigate('/users');
    } catch (error) {
      console.error('Error creating brand:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo Người dùng');
      toast.error(error.message || 'Có lỗi xảy ra khi tạo Người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-brand-page page">
      <PageHeader title="Thêm Người dùng mới" />

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang xử lý...</div>
      ) : (
        <UserForm
          onSubmit={handleSubmit}
          submitButtonText="Thêm Người dùng"
        />
      )}
    </div>
  );
};

export default AddUserPage;