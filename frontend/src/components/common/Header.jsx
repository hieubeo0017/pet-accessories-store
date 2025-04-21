import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {FaSearch, FaShoppingCart, FaPhoneAlt, FaUserCircle, FaUser, FaSignOutAlt} from 'react-icons/fa';
import './Header.css';
import DropDownHeader from "@/components/common/DropDownHeader";


const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.items);
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const user = useSelector(state => state.user);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
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

                <div className="header-center">
                    <div className="search-container">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm thú cưng, thức ăn, phụ kiện..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit">
                                <FaSearch />
                            </button>
                        </form>
                    </div>
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
                {user ? (
                    <DropDownHeader user={user} />
                ) : (
                    <div className="d-flex gap-2">
                        <Link to="/login" className="auth-button">Đăng nhập</Link>
                        <Link to="/register" className="auth-button">Đăng ký</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;