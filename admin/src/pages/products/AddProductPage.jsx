import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { fetchBrands } from '../../services/brandService';
import ProductForm from '../../components/products/ProductForm';
import { toast } from 'react-toastify';

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
          fetchCategories({ pageSize: 1000 }),  // Lấy tất cả danh mục
          fetchBrands({ pageSize: 1000 })
        ]);
        
        // Lọc danh mục theo type tại client
        const filteredCategories = categoriesRes.data.filter(
          category => category.type === 'food' || category.type === 'accessory'
        );
        
        setCategories(filteredCategories);
        setBrands(brandsRes.data || []);
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
    stock: '',       // Thay đổi từ 0 thành chuỗi rỗng
    discount: '',    // Thay đổi từ 0 thành chuỗi rỗng
    is_active: true,
    is_featured: false, // Thêm giá trị mặc định này
    specifications: [],
    images: []
  };
  
  const handleSubmit = async (productData) => {
    try {
      await createProduct(productData);
      toast.success('Thêm sản phẩm thành công'); // Thêm thông báo thành công
      navigate('/products');
    } catch (err) {
      setError('Lỗi khi tạo sản phẩm: ' + err.message);
      toast.error('Lỗi khi tạo sản phẩm: ' + err.message); // Thêm thông báo lỗi
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