import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts } from '../../services/api';
import DetailModal from '../common/DetailModal';
import './FoodAndAccessories.css';

const FoodAndAccessories = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchFeaturedProducts({
          limit: 8 // Lấy tối đa 8 sản phẩm nổi bật
        });
        
        setFeaturedProducts(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading featured products:', err);
        setError('Không thể tải dữ liệu sản phẩm nổi bật');
      } finally {
        setLoading(false);
      }
    };
    
    loadFeaturedProducts();
  }, []);

  const openModal = (productId) => {
    setSelectedProductId(productId);
    setModalOpen(true);
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (featuredProducts.length === 0) {
    return null;
  }
  
  return (
    <>
      <section className="category-showcase">
        <h2 className="section-title">Thức Ăn & Phụ Kiện Thú Cưng</h2>
        <div className="category-grid">
          {featuredProducts.map(product => {
            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
            const imageUrl = primaryImage?.image_url || '/images/default-product.jpg';
            
            // Tính giá sau giảm giá
            const discountedPrice = product.discount > 0 
              ? product.price * (1 - product.discount / 100) 
              : product.price;
              
            return (
              <div key={product.id} className="category-card">
                <div className="category-image">
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-product.jpg';
                    }}
                  />
                  {product.discount > 0 && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}
                  <div className="category-actions">
                    <button 
                      className="view-details"
                      onClick={() => openModal(product.id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <div className="category-info">
                  <button 
                    className="category-name-button"
                    onClick={() => openModal(product.id)}
                  >
                    {product.name}
                  </button>
                  <p className="category-description">{product.category_name}</p>
                  <p className="category-price">
                    {product.discount > 0 && (
                      <span className="original-price">{product.price.toLocaleString('vi-VN')}đ</span>
                    )}
                    <span>{discountedPrice.toLocaleString('vi-VN')}đ</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="view-more">
          <div className="view-more-buttons">
            <Link to="category/accessories" className="view-more-btn">
              Xem phụ kiện thú cưng
            </Link>
            <Link to="/foods" className="view-more-btn">
              Xem thức ăn thú cưng
            </Link>
          </div>
        </div>
      </section>
      
      {/* Detail Modal */}
      <DetailModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        itemId={selectedProductId}
        itemType="product"
      />
    </>
  );
};

export default FoodAndAccessories;