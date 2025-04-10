import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { fetchBrands } from '../../services/brandService';
import ProductForm from '../../components/products/ProductForm';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          fetchCategories(),
          fetchBrands()
        ]);
        setCategories(categoriesRes);
        setBrands(brandsRes);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadFormData();
  }, []);
  
  const initialProduct = {
    name: '',
    description: '',
    price: '',
    category_id: '',
    brand_id: '',
    pet_type: 'all',
    sku: '',
    stock: 0,
    discount: 0,
    is_active: true,
    specifications: [],
    images: []
  };
  
  const handleSubmit = async (productData) => {
    try {
      await createProduct(productData);
      navigate('/products');
    } catch (err) {
      setError('Lỗi khi tạo sản phẩm: ' + err.message);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }
  
  return (
    <div className="add-product page">
      <div className="page-header">
        <h1>Thêm sản phẩm mới</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <ProductForm 
        initialData={initialProduct}
        categories={categories}
        brands={brands}
        onSubmit={handleSubmit}
        submitButtonText="Thêm sản phẩm"
      />
    </div>
  );
};

export default AddProductPage;