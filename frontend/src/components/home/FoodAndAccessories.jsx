import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/cartSlice';
import './FoodAndAccessories.css';

const FoodAndAccessories = () => {
    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addItem(product));
    };

    // Dữ liệu thức ăn và phụ kiện
    const productsData = [
        // Thức ăn
        { 
            id: 301, 
            name: 'Royal Canin Maxi Adult', 
            type: 'food',
            category: 'Thức ăn cho chó',
            price: 580000, 
            image: '/images/products/royal-canin-food.jpg', 
            discounted: true,
            oldPrice: 650000,
            description: 'Thức ăn hạt cao cấp cho chó trưởng thành giống lớn, cân bằng dinh dưỡng, tăng cường sức khỏe xương khớp.'
        },
        { 
            id: 302, 
            name: 'Pate Whiskas cho mèo', 
            type: 'food',
            category: 'Thức ăn cho mèo',
            price: 195000, 
            image: '/images/products/whiskas.jpg',
            discounted: false,
            description: 'Pate mềm vị cá ngừ và cá hồi, bổ sung vitamin và khoáng chất thiết yếu cho mèo mọi lứa tuổi.'
        },
        // Phụ kiện
        { 
            id: 401, 
            name: 'Vòng cổ cho chó', 
            type: 'accessory',
            category: 'Phụ kiện',
            price: 120000, 
            image: '/images/products/dog-collar.jpg', 
            discounted: false,
            description: 'Vòng cổ cao cấp chất liệu da an toàn, dễ điều chỉnh kích cỡ, có thể khắc tên theo yêu cầu.'
        },
        { 
            id: 402, 
            name: 'Bát ăn đôi cho mèo', 
            type: 'accessory',
            category: 'Phụ kiện',
            price: 90000, 
            image: '/images/products/cat-bowl.jpg',
            discounted: true,
            oldPrice: 150000,
            description: 'Bát ăn đôi thiết kế thông minh, chống trượt, dễ vệ sinh, phù hợp cho mèo ăn thức ăn khô và ướt.'
        }
    ];

    return (
        <section className="accessories-showcase">
            <h2 className="section-title">Thức Ăn & Phụ Kiện Thú Cưng</h2>
            <div className="accessories-description">
                <p>Sản phẩm chất lượng cao từ các thương hiệu uy tín</p>
            </div>
            
            <div className="accessories-grid">
                {productsData.map(item => (
                    <div key={item.id} className="accessory-card">
                        <div className="accessory-image">
                            <img src={item.image} alt={item.name} />
                            {item.discounted && <span className="discount-tag">Giảm giá</span>}
                            <span className="category-tag">{item.category}</span>
                            <div className="accessory-actions">
                                <button 
                                    className="add-to-cart"
                                    onClick={() => handleAddToCart(item)}
                                >
                                    Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                        <div className="accessory-info">
                            <Link to={`/product/${item.id}`} className="accessory-name">
                                {item.name}
                            </Link>
                            <p className="accessory-description">{item.description}</p>
                            <div className="accessory-price">
                                {item.discounted && (
                                    <span className="old-price">{item.oldPrice.toLocaleString('vi-VN')}đ</span>
                                )}
                                <span className="current-price">{item.price.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="view-more">
                <Link to="/foods" className="view-more-btn">Xem thức ăn</Link>
                <Link to="/accessories" className="view-more-btn">Xem phụ kiện</Link>
            </div>
        </section>
    );
};

export default FoodAndAccessories;