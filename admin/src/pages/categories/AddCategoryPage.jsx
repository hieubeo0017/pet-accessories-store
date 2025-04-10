import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../../services/categoryService';
import CategoryForm from '../../components/categories/CategoryForm';

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const initialCategory = {
    name: '',
    description: '',
    slug: '',
    type: '',
    image_url: '',
    is_active: true
  };
  
  const handleSubmit = async (categoryData) => {
    try {
      await createCategory(categoryData);
      navigate('/categories');
    } catch (err) {
      setError('Lỗi khi tạo danh mục: ' + err.message);
    }
  };
  
  return (
    <div className="add-category page">
      <div className="page-header">
        <h1>Thêm danh mục mới</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <CategoryForm 
        initialData={initialCategory}
        onSubmit={handleSubmit}
        submitButtonText="Thêm danh mục"
      />
    </div>
  );
};

export default AddCategoryPage;