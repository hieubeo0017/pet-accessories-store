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
    pet_type: '', // Thay đổi từ 'all' thành '' để hiển thị placeholder
    pet_size: '', // Thay đổi từ 'all' thành '' để hiển thị placeholder
    is_active: true,
    is_featured: false,
    images: []
  };
  
  // Cập nhật handleSubmit
  const handleSubmit = async (serviceData) => {
    setLoading(true);
    
    try {
      // Tạo bản sao để tránh thay đổi trực tiếp state
      const normalizedData = {...serviceData};
      
      // Xử lý các trường số
      normalizedData.price = parseFloat(normalizedData.price);
      normalizedData.duration = parseInt(normalizedData.duration);
      
      // Xử lý các trường boolean
      normalizedData.is_active = Boolean(normalizedData.is_active);
      normalizedData.is_featured = Boolean(normalizedData.is_featured);
      
      // Chuẩn hóa mảng ảnh
      if (normalizedData.images && normalizedData.images.length > 0) {
        normalizedData.images = normalizedData.images.map(img => ({
          image_url: img.image_url || img.url,
          is_primary: !!img.is_primary
        }));
        
        // Đảm bảo có một ảnh chính
        if (!normalizedData.images.some(img => img.is_primary)) {
          normalizedData.images[0].is_primary = true;
        }
      }
      
      console.log("Form data being submitted:", normalizedData);
      const response = await createSpaService(normalizedData);
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