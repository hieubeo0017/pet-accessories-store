import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    return (
        <nav className="navigation">
            <div className="navigation-container">
                <ul>
                    <li><Link to="/">Trang chủ</Link></li>
                    <li><Link to="/pets">Thú cưng</Link></li>
                    <li><Link to="/foods">Thức ăn</Link></li>
                    <li><Link to="/accessories">Phụ kiện</Link></li>
                    <li><Link to="/blog">Blog</Link></li>
                    <li><Link to="/contact">Liên hệ</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;