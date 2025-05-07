import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/cartSlice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    
    // Xử lý đường dẫn hình ảnh
    const getImageUrl = () => {
        if (product.images && product.images.length > 0) {
            // Tìm ảnh chính hoặc lấy ảnh đầu tiên
            const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
            if (primaryImage && primaryImage.image_url) {
                // Đảm bảo URL bắt đầu bằng http:// hoặc / cho uploads
                if (primaryImage.image_url.startsWith('http')) {
                    return primaryImage.image_url;
                } else {
                    // Thêm tiền tố cho đường dẫn tương đối
                    return `http://localhost:5000${primaryImage.image_url.startsWith('/') ? '' : '/'}${primaryImage.image_url}`;
                }
            }
        }
        return '/images/placeholder-product.jpg'; // Ảnh mặc định
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        
        // Lựa chọn ảnh fallback dựa trên thương hiệu (brand) của sản phẩm
        if (product.brand === 'Pet Bowl') {
            e.target.src = '/images/categories/bat-an.jpg';
        } else if (product.brand === 'Pet Collar') {
            e.target.src = '/images/categories/vong-co-cho.jpg'; // Sửa từ vongco.jpg thành vong-co-cho.jpg
        } else if (product.brand === 'Pet Glass') {
            e.target.src = '/images/categories/kinh-mat.jpg';
        } else if (product.brand === 'Balo Pet') {
            e.target.src = '/images/categories/phu-kien-cho-meo-balo.jpg';
        } else {
            // Fallback mặc định nếu không khớp với bất kỳ thương hiệu nào
            e.target.src = '/images/categories/cat-food.jpg';
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Lấy đường dẫn ảnh
        const imageUrl = getImageUrl();
        
        dispatch(addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            quantity: 1
        }));
    };

    return (
        <div className="product-card">
            <Link to={`/products/${product.id}`} className="product-link">
                <img src={getImageUrl()} alt={product.name} className="product-image" onError={handleImageError} />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{
                    product.description && product.description.length > 100
                        ? product.description.substring(0, 100) + '...'
                        : product.description
                }</p>
                <p className="product-price">{product.price.toLocaleString('vi-VN')}đ</p>
            </Link>
            <button 
                className="add-to-cart-button" 
                onClick={handleAddToCart}
            >
                Thêm vào giỏ
            </button>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        price: PropTypes.number.isRequired,
        images: PropTypes.array
    }).isRequired,
};

export default ProductCard;