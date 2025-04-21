import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../../services/categoryService';
import CategoryForm from '../../components/categories/CategoryForm';
import { toast } from 'react-toastify';

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const initialCategory = {
    name: '',
    description: '',
    slug: '',
    type: '',
    image_url: '',
    is_active: true
  };
  
  const handleSubmit = async (categoryData) => {
    setLoading(true);
    setError('');
    
    try {
      await createCategory(categoryData);
      toast.success('Danh mục đã được tạo thành công!');
      navigate('/categories');
    } catch (err) {
      setError('Lỗi khi tạo danh mục: ' + err.message);
      toast.error('Lỗi khi tạo danh mục: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-category page">
      <div className="page-header">
        <h1>Thêm danh mục mới</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Đang xử lý...</div>
      ) : (
        <CategoryForm 
          initialData={initialCategory}
          onSubmit={handleSubmit}
          submitButtonText="Thêm danh mục"
        />
      )}
    </div>
  );
};

export default AddCategoryPage;