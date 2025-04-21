import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, updateProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { fetchBrands } from '../../services/brandService';
import ProductForm from '../../components/products/ProductForm';
import { toast } from 'react-toastify';

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
        await loadProduct();
        
        // Lấy danh sách danh mục và thương hiệu với pageSize lớn để lấy tất cả
        const [categoriesRes, brandsRes] = await Promise.all([
          fetchCategories({ pageSize: 1000 }),
          fetchBrands({ pageSize: 1000 })
        ]);

        // Lọc danh mục theo type tại client
        const filteredCategories = categoriesRes.data.filter(
          category => category.type === 'food' || category.type === 'accessory'
        );
        
        setCategories(filteredCategories);
        setBrands(brandsRes.data || []);
      } catch (error) {
        console.error('Error loading product data:', error);
        setError('Không thể tải dữ liệu sản phẩm: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await fetchProductById(id);
      
      // Xử lý specifications nếu nó được lưu dưới dạng chuỗi JSON
      if (response.specifications && typeof response.specifications === 'string') {
        try {
          response.specifications = JSON.parse(response.specifications);
        } catch (e) {
          console.error('Lỗi khi parse specifications:', e);
          response.specifications = [];
        }
      }
      
      // Đảm bảo specifications luôn là một mảng
      if (!response.specifications) {
        response.specifications = [];
      }
      
      // Xử lý dữ liệu hình ảnh để đảm bảo chỉ có một ảnh chính
      if (response.images && response.images.length > 0) {
        // Tìm ảnh đầu tiên có is_primary = true
        const primaryIndex = response.images.findIndex(img => img.is_primary);
        
        // Đảm bảo chỉ có một ảnh được đánh dấu là chính
        response.images = response.images.map((img, index) => ({
          ...img,
          url: img.image_url || img.url,
          is_primary: primaryIndex !== -1 ? index === primaryIndex : index === 0
        }));
      }
      
      setProduct(response);
      setLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      setLoading(false);
    }
  };
  
  const handleSubmit = async (productData) => {
    setUpdating(true);
    try {
      await updateProduct(id, productData);
      toast.success('Cập nhật sản phẩm thành công'); // Thêm thông báo thành công
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Lỗi khi cập nhật sản phẩm: ' + error.message);
      toast.error('Lỗi khi cập nhật sản phẩm: ' + error.message); // Thêm thông báo lỗi
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