import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createSpaService } from '../../services/spaService';
import SpaServiceForm from '../../components/spa-services/SpaServiceForm';
import { toast } from 'react-toastify';

const AddSpaServicePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const initialService = {
    name: '',
    description: '',
    price: '',
    duration: '',
    pet_type: 'all',
    pet_size: 'all',
    is_active: true,
    is_featured: false,
    images: []
  };
  
  const handleSubmit = async (serviceData) => {
    setLoading(true);
    try {
      await createSpaService(serviceData);
      toast.success('Thêm dịch vụ spa thành công');
      navigate('/spa-services');
    } catch (err) {
      console.error('Error creating spa service:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo dịch vụ spa');
      toast.error(err.response?.data?.message || 'Lỗi khi tạo dịch vụ spa');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-spa-service page">
      <div className="page-header">
        <h1>Thêm dịch vụ spa mới</h1>
        <div className="breadcrumbs">
          <Link to="/spa-services">Quản lý dịch vụ spa</Link> / Thêm dịch vụ mới
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Đang xử lý...</div>
      ) : (
        <SpaServiceForm
          initialData={initialService}
          onSubmit={handleSubmit}
          submitButtonText="Thêm dịch vụ"
        />
      )}
    </div>
  );
};

export default AddSpaServicePage;