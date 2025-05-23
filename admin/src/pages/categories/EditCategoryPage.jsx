import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCategoryById, updateCategory } from '../../services/categoryService';
import CategoryForm from '../../components/categories/CategoryForm';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify'; // Thêm import này

const EditCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const data = await fetchCategoryById(id);
        setCategory(data);
      } catch (error) {
        console.error('Error loading category:', error);
        setError('Không thể tải thông tin danh mục');
        toast.error('Không thể tải thông tin danh mục'); // Thêm thông báo lỗi
      } finally {
        setLoading(false);
      }
    };
    
    loadCategory();
  }, [id]);
  
  const handleSubmit = async (formData) => {
    setUpdating(true);
    setError('');
    
    try {
      await updateCategory(id, formData);
      toast.success('Cập nhật danh mục thành công!'); // Thêm thông báo thành công
      navigate('/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Có lỗi xảy ra khi cập nhật danh mục');
      toast.error('Có lỗi xảy ra khi cập nhật danh mục'); // Thêm thông báo lỗi
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }
  
  if (!category) {
    return <div className="error">Không tìm thấy danh mục</div>;
  }
  
  return (
    <div className="edit-category-page page">
      <div className="page-header">
        <h1>Chỉnh sửa danh mục: {category.name}</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {updating ? (
        <div className="loading">Đang cập nhật...</div>
      ) : (
        <CategoryForm 
          initialData={category}
          onSubmit={handleSubmit} 
          submitButtonText="Cập nhật danh mục" 
        />
      )}
    </div>
  );
};

export default EditCategoryPage;