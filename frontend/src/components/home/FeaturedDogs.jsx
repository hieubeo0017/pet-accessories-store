import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FeaturedDogs.css'; // Đổi import CSS

const FeaturedDogs = () => {
    const [loading, setLoading] = useState(false);

    // Cập nhật đường dẫn ảnh
    const featuredDogs = [
        { 
            id: 1, 
            name: 'Poodle', 
            description: 'Thông minh, dễ huấn luyện',
            image: '/images/featured-pets/dogs/poodle.jpg',
            price: 5000000
        },
        { 
            id: 2, 
            name: 'Corgi', 
            description: 'Hoạt bát, thân thiện với trẻ em',
            image: '/images/featured-pets/dogs/corgi.jpg',
            price: 8000000
        },
        { 
            id: 3, 
            name: 'Husky', 
            description: 'Năng động, thích hợp cho người yêu thể thao',
            image: '/images/featured-pets/dogs/husky.jpg',
            price: 7000000
        },
        { 
            id: 4, 
            name: 'Golden Retriever', 
            description: 'Trung thành, dễ dạy và thân thiện',
            image: '/images/featured-pets/dogs/golden.jpg',
            price: 10000000
        }
    ];

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <section className="category-showcase">
            <h2 className="section-title">Các Giống Chó Nổi Bật</h2>
            <div className="category-grid">
                {featuredDogs.map(dog => (
                    <div key={dog.id} className="category-card">
                        <div className="category-image">
                            <img src={dog.image} alt={dog.name} />
                            <div className="category-actions">
                                <Link to={`/dogs/${dog.id}`} className="view-details">
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                        <div className="category-info">
                            <Link to={`/dogs/${dog.id}`} className="category-name">
                                {dog.name}
                            </Link>
                            <p className="category-description">{dog.description}</p>
                            <p className="category-price">{dog.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="view-more">
                <Link to="/pets?type=dog" className="view-more-btn">Xem tất cả giống chó</Link>
            </div>
        </section>
    );
};

export default FeaturedDogs; // Đổi tên export