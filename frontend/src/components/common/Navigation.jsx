import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="navigation-container">
        <ul>
          <li><NavLink to="/" end>Trang chủ</NavLink></li>
          <li><NavLink to="/pets?type=dog">Chó cảnh</NavLink></li>
          <li><NavLink to="/pets?type=cat">Mèo cảnh</NavLink></li>
          <li><NavLink to="/foods">Thức ăn</NavLink></li>
          <li><NavLink to="/category/accessories">Phụ kiện</NavLink></li>
          <li><NavLink to="/spa">Spa & Chăm sóc</NavLink></li>
          <li><NavLink to="/blogs">Tin tức</NavLink></li>
          <li><NavLink to="/contact">Liên hệ</NavLink></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;