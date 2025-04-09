import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/cartSlice';
import './PetCard.css';

const PetCard = ({ pet }) => {
    const dispatch = useDispatch();
    
    const handleAddToCart = (e) => {
        e.preventDefault(); // Ngăn chuyển hướng khi nhấn vào nút
        e.stopPropagation();
        dispatch(addItem({
            ...pet,
            quantity: 1
        }));
    };

    return (
        <div className="pet-card">
            <Link to={`/pet/${pet.id}`} className="pet-card-link">
                <div className="pet-image">
                    <img src={pet.image} alt={pet.name} />
                </div>
                <div className="pet-info">
                    <h3 className="pet-name">{pet.name}</h3>
                    <p className="pet-breed">Giống: {pet.breed}</p>
                    <p className="pet-age">Tuổi: {pet.age}</p>
                    <p className="pet-price">{pet.price.toLocaleString('vi-VN')}đ</p>
                </div>
            </Link>
            <button 
                className="add-to-cart-button" 
                onClick={handleAddToCart}
            >
                Thêm vào giỏ hàng
            </button>
        </div>
    );
};

export default PetCard;