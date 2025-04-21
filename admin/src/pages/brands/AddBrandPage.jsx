import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBrand } from '../../services/brandService';
import BrandForm from '../../components/brands/BrandForm';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify';

const AddBrandPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      await createBrand(formData);
      toast.success('Thương hiệu đã được tạo thành công!');
      navigate('/brands');
    } catch (error) {
      console.error('Error creating brand:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo thương hiệu');
      toast.error(error.message || 'Có lỗi xảy ra khi tạo thương hiệu');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-brand-page page">
      <PageHeader title="Thêm thương hiệu mới" />
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Đang xử lý...</div>
      ) : (
        <BrandForm 
          onSubmit={handleSubmit} 
          submitButtonText="Thêm thương hiệu" 
        />
      )}
    </div>
  );
};

export default AddBrandPage;