import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, updateProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { fetchBrands } from '../../services/brandService';
import ProductForm from '../../components/products/ProductForm';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Lấy dữ liệu sản phẩm
        const productData = await fetchProductById(id);
        setProduct(productData);
        
        // Lấy danh sách danh mục và thương hiệu (không cần tham số phân trang)
        const categoriesResponse = await fetchCategories({});
        const brandsResponse = await fetchBrands({});
        
        // Đảm bảo categoriesResponse và brandsResponse có thuộc tính data
        setCategories(categoriesResponse.data || []);
        setBrands(brandsResponse.data || []);
      } catch (error) {
        console.error('Error loading product data:', error);
        setError('Không thể tải dữ liệu sản phẩm: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  const handleSubmit = async (productData) => {
    setUpdating(true);
    try {
      await updateProduct(id, productData);
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Lỗi khi cập nhật sản phẩm: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }
  
  if (!product) {
    return <div className="error">Không tìm thấy sản phẩm</div>;
  }
  
  return (
    <div className="edit-product page">
      <div className="page-header">
        <h1>Chỉnh sửa sản phẩm: {product.name}</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {updating ? (
        <div className="loading">Đang cập nhật...</div>
      ) : (
        <ProductForm 
          initialData={product}
          categories={categories}
          brands={brands}
          onSubmit={handleSubmit}
          submitButtonText="Cập nhật sản phẩm"
        />
      )}
    </div>
  );
};

export default EditProductPage;