import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch, FaShoppingCart, FaPhoneAlt, FaTimes } from 'react-icons/fa';
import { searchAll } from '../../services/api';
import './Header.css';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchPopup, setShowSearchPopup] = useState(false);
    const [popularProducts, setPopularProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.items);
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const searchRef = useRef(null);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '/images/placeholder.png';
        
        // Kiểm tra nếu đã là URL đầy đủ
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        } 
        // Nếu là đường dẫn tương đối từ server
        else {
            return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
    };

    // Từ khóa tìm kiếm phổ biến
    const popularKeywords = [
        "royal canin", "nutrience", "đồ chơi cho mèo",
        "đồ chơi cho chó", "puppy", "mèo con", "trị nấm", "thịt sấy"
    ];

    useEffect(() => {
        // Xử lý click outside để đóng popup
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchPopup(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Tải sản phẩm nổi bật khi hiển thị popup
        if (showSearchPopup) {
            loadPopularProducts();
        }
    }, [showSearchPopup]);

    const loadPopularProducts = async () => {
        try {
            setLoading(true);
            // Gọi API tìm kiếm với tham số featured=true thay vì query rỗng
            const result = await searchAll('', { featured: true, limit: 4 });
            // Kết hợp sản phẩm và thú cưng nổi bật
            const featuredItems = [
                ...(result.products || []).slice(0, 2),
                ...(result.pets || []).slice(0, 2)
            ];
            setPopularProducts(featuredItems);
            setLoading(false);
        } catch (error) {
            console.error("Error loading popular products:", error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearchPopup(false);
        }
    };

    const handleKeywordClick = (keyword) => {
        setSearchQuery(keyword);
        navigate(`/search?q=${encodeURIComponent(keyword)}`);
        setShowSearchPopup(false);
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <div className="logo">
                        <Link to="/">
                            <div className="logo-container">
                                <img src="/images/Logo/logo_pet.png" alt="PetLand Logo" className="logo-image" />
                                <span className="logo-text">PetLand</span>
                            </div>
                        </Link>
                    </div>
                </div>
                
                <div className="header-center" ref={searchRef}>
                    <div className="search-container">
                        <form onSubmit={handleSearch}>
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm thú cưng, thức ăn, phụ kiện..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSearchPopup(true)}
                            />
                            <button type="submit">
                                <FaSearch />
                            </button>
                        </form>
                    </div>
                    
                    {/* Popup tìm kiếm */}
                    {showSearchPopup && (
                        <div className="search-popup">
                            <div className="search-popup-header">
                                <h3>TÌM KIẾM PHỔ BIẾN</h3>
                                <button onClick={() => setShowSearchPopup(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <div className="popular-keywords">
                                {popularKeywords.map((keyword, index) => (
                                    <div 
                                        key={index} 
                                        className="keyword-item" 
                                        onClick={() => handleKeywordClick(keyword)}
                                    >
                                        <span className="keyword-icon">
                                            <FaSearch />
                                        </span>
                                        <span className="keyword-text">{keyword}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="featured-products-section">
                                <h3>SẢN PHẨM NỔI BẬT</h3>
                                {loading ? (
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                    </div>
                                ) : (
                                    <div className="featured-products-grid">
                                        {popularProducts.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="featured-product-item"
                                                onClick={() => {
                                                    // Nếu ID bắt đầu bằng PET- hoặc type là pet thì điều hướng đến /pet/
                                                    const isPet = item.id.startsWith('PET-') || item.type === 'pet';
                                                    navigate(`/${isPet ? 'pet' : 'products'}/${item.id}`);
                                                    setShowSearchPopup(false); // Thêm dòng này để đóng popup sau khi điều hướng
                                                }}
                                            >
                                                    <div 
                                                    className="featured-product-image" 
                                                    style={{backgroundImage: `url('${getImageUrl(item.image)}')`}}
                                                ></div>
                                                <div className="featured-product-info">
                                                    <div className="featured-product-supplier">
                                                        {item.type === 'pet' ? 'Thú cưng' : 'Sản phẩm'}
                                                    </div>
                                                    <div className="featured-product-name">
                                                        {item.name}
                                                    </div>
                                                    <div className="featured-product-price">
                                                        {parseInt(item.price).toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="header-right">
                    <div className="hotline">
                        <FaPhoneAlt className="hotline-icon" />
                        <div className="hotline-content">
                            <span className="hotline-label">Hotline</span>
                            <span className="hotline-number">0355292839</span>
                        </div>
                    </div>
                    <div className="cart-icon">
                        <Link to="/cart">
                            <FaShoppingCart className="cart-icon-blue" />
                            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;