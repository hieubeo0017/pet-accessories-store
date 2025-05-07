import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById, fetchProductsByCategory } from '../services/api';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { FaShoppingCart, FaArrowLeft, FaTag, FaPaw, FaInfo, FaShieldAlt, FaCheck } from 'react-icons/fa';
import ReviewSection from '../components/reviews/ReviewSection';
import ProductCard from '../components/products/ProductCard';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Tự động cuộn về đầu trang khi component được mount hoặc khi id thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);
  
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await fetchProductById(id);
        
        // Xử lý response dựa vào cấu trúc
        let productData;
        if (response.data) {
          productData = response.data;
        } else if (response.message && response.data) {
          productData = response.data;
        } else {
          productData = response;
        }
        
        setProduct(productData);
        
        // Thêm vào trong useEffect sau dòng setProduct(productData);
        console.log('Dữ liệu sản phẩm:', productData);
        console.log('Thông số kỹ thuật:', productData.specifications);
        
        // Tải sản phẩm liên quan
        if (productData.category_id) {
          const relatedResponse = await fetchProductsByCategory(
            productData.category_id, 
            { 
              limit: 3,
              exclude_id: productData.id
            }
          );
          
          if (relatedResponse.data && Array.isArray(relatedResponse.data)) {
            setRelatedProducts(relatedResponse.data.slice(0, 3));
          }
        }
        
        setError(null);
      } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
    setSelectedImage(0);
  }, [id]);
  
  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };
  
  const increaseQuantity = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || '';
      
      dispatch(addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: primaryImage,
        quantity,
        type: 'product'
      }));
    }
  };
  
  const handleBuyNow = () => {
    if (product && product.stock > 0) {
      const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || '';
      
      dispatch(addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: primaryImage,
        quantity,
        type: 'product'
      }));
      
      // Điều hướng đến trang giỏ hàng và cuộn lên đầu
      navigate('/cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder-product.jpg';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
  };
  
  if (loading) return <div className="loading">Đang tải thông tin sản phẩm...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Không tìm thấy sản phẩm</div>;
  
  // Tính giá sau khuyến mãi
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : null;
  
  const images = product.images || [];
  
  return (
    <div className="product-detail-page">
      <div className="product-gallery">
        <div className="main-image">
          <img 
            src={images.length > 0 ? getImageUrl(images[selectedImage].image_url) : '/images/placeholder-product.jpg'} 
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-product.jpg';
            }}
          />
          {product.discount > 0 && (
            <div className="discount-badge">-{product.discount}%</div>
          )}
        </div>
        
        <div className="thumbnail-images">
          {images.map((image, index) => (
            <img 
              key={index} 
              src={getImageUrl(image.image_url)}
              alt={`${product.name} ${index+1}`}
              onClick={() => handleThumbnailClick(index)}
              className={selectedImage === index ? 'active' : ''}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder-product.jpg';
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="product-details">
        <div className="product-header">
          <h1>{product.name}</h1>
          <p className="product-id">Mã: {product.id}</p>
        </div>
        
        <div className="product-price">
          {discountedPrice ? (
            <>
              <span className="price">{Math.floor(discountedPrice).toLocaleString('vi-VN')}đ</span>
              <span className="original-price">{product.price.toLocaleString('vi-VN')}đ</span>
            </>
          ) : (
            <span className="price">{product.price.toLocaleString('vi-VN')}đ</span>
          )}
        </div>
        
        <div className="product-attributes">
          <div className="attribute">
            <span className="label">Loại thú cưng:</span>
            <span className="value">{product.pet_type === 'dog' ? 'Chó' : product.pet_type === 'cat' ? 'Mèo' : 'Tất cả'}</span>
          </div>
          {product.brand_name && (
            <div className="attribute">
              <span className="label">Thương hiệu:</span>
              <span className="value">{product.brand_name}</span>
            </div>
          )}
          <div className="attribute">
            <span className="label">Danh mục:</span>
            <span className="value">{product.category_name || 'Chưa phân loại'}</span>
          </div>
          <div className="attribute">
            <span className="label">Tình trạng:</span>
            <span className="value">{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
          </div>
        </div>
        
        <div className="product-description-box">
          <h3 className="description-label">Mô tả sản phẩm:</h3>
          <div className="description-content">{product.description || 'Chưa có mô tả cho sản phẩm này'}</div>
        </div>
        
        {product.specifications && product.specifications.length > 0 && (
          <div className="health-info">
            <h3>Thông số kỹ thuật:</h3>
            {product.specifications.map((spec, index) => (
              <p key={index}>
                <strong>{spec.spec_name || spec.name || ''}:</strong> {spec.spec_value || spec.value || ''}
              </p>
            ))}
          </div>
        )}
        
        {product.stock > 0 && (
          <div className="purchase-options">
            <div className="quantity-selector">
              <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity} disabled={quantity >= product.stock}>+</button>
            </div>
            <div className="purchase-buttons">
              <button 
                className="contact-button"
                onClick={handleBuyNow}
              >
                Đặt Mua
              </button>
              <button 
                className="add-cart-button" 
                onClick={handleAddToCart}
              >
                <FaShoppingCart /> Thêm vào giỏ
              </button>
            </div>
          </div>
        )}
        
        {product.stock <= 0 && (
          <div className="out-of-stock-message">
            <p>Sản phẩm này hiện đã hết hàng</p>
          </div>
        )}
      </div>
      
      <div className="extra-info">
        <div className="guarantee-section">
          <h3><FaShieldAlt className="info-icon" /> Cam kết và bảo hành</h3>
          <p>Sản phẩm chính hãng 100%, còn nguyên tem mác</p>
          <ul className="extra-features">
            <li><FaCheck /> Bảo hành theo chính sách của nhà sản xuất</li>
            <li><FaCheck /> Đổi trả trong vòng 7 ngày nếu sản phẩm lỗi</li>
            <li><FaCheck /> Tư vấn sử dụng sản phẩm miễn phí</li>
          </ul>
        </div>
      </div>
      
      <ReviewSection 
        itemType="product" 
        itemId={id}
      />
      
      {relatedProducts.length > 0 && (
        <div className="similar-pets-section">
          <h2>Sản phẩm tương tự</h2>
          <div className="similar-pets-container">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;