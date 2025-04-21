import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBrandById, updateBrand } from '../../services/brandService';
import BrandForm from '../../components/brands/BrandForm';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify';

const EditBrandPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadBrand = async () => {
      try {
        const data = await fetchBrandById(id);
        setBrand(data);
      } catch (error) {
        console.error('Error loading brand:', error);
        setError('Không thể tải thông tin thương hiệu');
        toast.error('Không thể tải thông tin thương hiệu');
      } finally {
        setLoading(false);
      }
    };
    
    loadBrand();
  }, [id]);
  
  const handleSubmit = async (formData) => {
    setUpdating(true);
    setError('');
    
    try {
      await updateBrand(id, formData);
      toast.success('Cập nhật thương hiệu thành công!');
      navigate('/brands');
    } catch (error) {
      console.error('Error updating brand:', error);
      setError(error.message || 'Có lỗi xảy ra khi cập nhật thương hiệu');
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thương hiệu');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }
  
  if (!brand) {
    return <div className="error">Không tìm thấy thương hiệu</div>;
  }
  
  return (
    <div className="edit-brand-page page">
      <PageHeader title={`Chỉnh sửa thương hiệu: ${brand.name}`} />
      
      {error && <div className="error-message">{error}</div>}
      
      {updating ? (
        <div className="loading">Đang cập nhật...</div>
      ) : (
        <BrandForm 
          initialData={brand}
          onSubmit={handleSubmit} 
          submitButtonText="Cập nhật thương hiệu" 
        />
      )}
    </div>
  );
};

export default EditBrandPage;