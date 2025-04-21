import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/cartSlice';
import './PetCard.css';

const PetCard = ({ pet }) => {
  const dispatch = useDispatch();
  
  // Tìm hình ảnh chính hoặc sử dụng hình ảnh đầu tiên
  const primaryImage = pet.images?.find(img => img.is_primary) || pet.images?.[0];
  const imageUrl = primaryImage?.image_url || '/images/placeholder-pet.jpg';
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!pet.is_adopted && pet.stock > 0) {
      dispatch(addItem({
        id: pet.id,
        name: pet.name,
        price: pet.price,
        image: imageUrl,
        quantity: 1,
        type: 'pet'
      }));
    }
  };
  
  return (
    <div className="pet-card">
      <Link to={`/pet/${pet.id}`} className="pet-card-link">
        <div className="pet-image">
          <img 
            src={imageUrl} 
            alt={pet.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-pet.jpg';
            }}
          />
          {pet.is_adopted && <span className="sold-badge">Đã bán</span>}
        </div>
        <div className="pet-info">
          <h3 className="pet-name">{pet.name}</h3>
          <p className="pet-breed">Giống: {pet.breed}</p>
          <p className="pet-age">Tuổi: {pet.age}</p>
          <p className="pet-price">{pet.price.toLocaleString('vi-VN')}đ</p>
        </div>
      </Link>
      {!pet.is_adopted && pet.stock > 0 ? (
        <button 
          className="add-to-cart-button" 
          onClick={handleAddToCart}
        >
          Thêm vào giỏ hàng
        </button>
      ) : (
        <button className="sold-button" disabled>
          {pet.is_adopted ? 'Đã bán' : 'Hết hàng'}
        </button>
      )}
    </div>
  );
};

export default PetCard;