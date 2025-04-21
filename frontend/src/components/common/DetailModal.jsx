import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPetById, fetchProductById } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/cartSlice';
import './DetailModal.css';

const DetailModal = ({ isOpen, onClose, itemId, itemType }) => {
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isOpen || !itemId) return;
    
    const fetchItemData = async () => {
      try {
        setLoading(true);
        let data;
        
        if (itemType === 'pet') {
          data = await fetchPetById(itemId);
        } else {
          data = await fetchProductById(itemId);
        }
        
        setItemData(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${itemType} data:`, err);
        setError(`Không thể tải thông tin ${itemType === 'pet' ? 'thú cưng' : 'sản phẩm'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemData();
  }, [isOpen, itemId, itemType]);

  const handleAddToCart = () => {
    if (!itemData) return;

    const primaryImage = itemData.images?.find(img => img.is_primary) || itemData.images?.[0];
    const imageUrl = primaryImage?.image_url || '/images/placeholder.jpg';

    dispatch(addItem({
      id: itemData.id,
      name: itemData.name,
      price: itemData.price || 0,
      image: imageUrl,
      quantity: 1,
      type: itemType
    }));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-content" onClick={e => e.stopPropagation()}>
        <button className="detail-modal-close" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="detail-modal-loading">Đang tải...</div>
        ) : error ? (
          <div className="detail-modal-error">{error}</div>
        ) : itemData && (
          <div className="detail-modal-body">
            <div className="detail-modal-gallery">
              {itemData.images && itemData.images.length > 0 && (
                <>
                  <div className="detail-modal-main-image">
                    <img 
                      src={itemData.images[selectedImage]?.image_url} 
                      alt={itemData.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    {itemType === 'product' && itemData.discount > 0 && (
                      <span className="discount-badge">-{itemData.discount}%</span>
                    )}
                  </div>
                  
                  {itemData.images.length > 1 && (
                    <div className="detail-modal-thumbnails">
                      {itemData.images.map((img, index) => (
                        <img 
                          key={index}
                          src={img.image_url}
                          alt={`${itemData.name} thumbnail ${index+1}`}
                          className={index === selectedImage ? 'active' : ''}
                          onClick={() => setSelectedImage(index)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="detail-modal-info">
              <h2>{itemData.name}</h2>
              <div className="detail-modal-price">
                {itemType === 'product' && itemData.discount > 0 ? (
                  <>
                    <span className="discounted-price">
                      {(itemData.price ? Math.round(itemData.price * (1 - itemData.discount/100)) : 0).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="original-price">{(itemData.price || 0).toLocaleString('vi-VN')}đ</span>
                  </>
                ) : (
                  <span className="price">{(itemData.price || 0).toLocaleString('vi-VN')}đ</span>
                )}
              </div>
              
              {itemType === 'pet' && (
                <div className="detail-modal-attributes">
                  <div className="attribute">
                    <span className="label">Loài:</span>
                    <span className="value">{itemData.type === 'dog' ? 'Chó' : 'Mèo'}</span>
                  </div>
                  <div className="attribute">
                    <span className="label">Giống:</span>
                    <span className="value">{itemData.breed}</span>
                  </div>
                  <div className="attribute">
                    <span className="label">Giới tính:</span>
                    <span className="value">{itemData.gender === 'male' ? 'Đực' : 'Cái'}</span>
                  </div>
                  <div className="attribute">
                    <span className="label">Tuổi:</span>
                    <span className="value">{itemData.age}</span>
                  </div>
                </div>
              )}
              
              {itemType === 'product' && (
                <div className="detail-modal-attributes product-attributes">
                  <div className="attribute">
                    <span className="label">Danh mục:</span>
                    <span className="value">{itemData.category_name}</span>
                  </div>
                  {itemData.brand_name && (
                    <div className="attribute">
                      <span className="label">Thương hiệu:</span>
                      <span className="value">{itemData.brand_name}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="detail-modal-description">
                <h3>Mô tả:</h3>
                <p>{itemData.description}</p>
              </div>
              
              <div className="detail-modal-actions">
                <Link 
                  to={`/${itemType === 'pet' ? 'pet' : 'product'}/${itemData.id}`} 
                  className="view-full-detail-btn"
                >
                  Xem chi tiết đầy đủ
                </Link>
                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={itemType === 'pet' && (itemData.is_adopted || itemData.stock <= 0)}
                >
                  {itemType === 'pet' && (itemData.is_adopted || itemData.stock <= 0)
                    ? 'Đã bán'
                    : 'Thêm vào giỏ hàng'
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;