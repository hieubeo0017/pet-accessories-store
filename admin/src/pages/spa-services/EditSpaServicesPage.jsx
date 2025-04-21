import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchSpaServiceById, updateSpaService } from '../../services/spaService';
import SpaServiceForm from '../../components/spa-services/SpaServiceForm';

const EditSpaServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const serviceData = await fetchSpaServiceById(id);
        
        // Đảm bảo is_featured là boolean
        setService({
          ...serviceData,
          is_featured: serviceData.is_featured === true || serviceData.is_featured === 1
        });
      } catch (error) {
        console.error('Error loading service data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  const handleSubmit = async (serviceData) => {
    setUpdating(true);
    
    try {
      await updateSpaService(id, serviceData);
      toast.success('Cập nhật dịch vụ spa thành công');
      navigate('/spa-services');
    } catch (error) {
      console.error('Error updating spa service:', error);
      setError(error.response?.data?.message || 'Lỗi khi cập nhật dịch vụ spa');
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật dịch vụ spa');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }
  
  if (!service) {
    return <div className="error">Không tìm thấy dịch vụ</div>;
  }
  
  return (
    <div className="edit-spa-service page">
      <div className="page-header">
        <h1>Chỉnh sửa dịch vụ spa: {service.name}</h1>
        <div className="breadcrumbs">
          <Link to="/spa-services">Quản lý dịch vụ spa</Link> / Chỉnh sửa dịch vụ
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {updating ? (
        <div className="loading">Đang cập nhật...</div>
      ) : (
        <SpaServiceForm 
          initialData={service}
          onSubmit={handleSubmit}
          submitButtonText="Cập nhật dịch vụ"
        />
      )}
    </div>
  );
};

export default EditSpaServicePage;