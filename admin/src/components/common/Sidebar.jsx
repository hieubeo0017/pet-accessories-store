import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ collapsed }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img 
          src="/images/logo/logo_pet.png" 
          alt="PetLand Logo" 
          className="logo"
        />
        {!collapsed && <h2>PetLand</h2>}
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-tachometer-alt"></i>
              {!collapsed && <span>Tổng quan</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-box"></i>
              {!collapsed && <span>Sản phẩm</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/pets" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-paw"></i>
              {!collapsed && <span>Thú cưng</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-tags"></i>
              {!collapsed && <span>Danh mục</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/brands" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-copyright"></i>
              {!collapsed && <span>Thương hiệu</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-shopping-cart"></i>
              {!collapsed && <span>Đơn hàng</span>}
            </NavLink>
          </li>
          
          {/* Thêm liên kết đến quản lý dịch vụ spa */}
          <li>
            <NavLink to="/spa-services" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-spa"></i>
              {!collapsed && <span>Dịch vụ Spa</span>}
            </NavLink>
          </li>
          
          {/* Thêm liên kết đến quản lý lịch hẹn spa */}
          <li>
            <NavLink to="/spa-appointments" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-calendar-check"></i>
              {!collapsed && <span>Lịch hẹn Spa</span>}
            </NavLink>
          </li>

          {/* Thêm liên kết đến khung giờ spa */}
          <li>
            <NavLink to="/spa-time-slots" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-clock"></i>
              {!collapsed && <span>Khung giờ Spa</span>}
            </NavLink>
          </li>
          
          <li>
            <NavLink to="/reviews" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-star"></i>
              {!collapsed && <span>Đánh giá</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/blogs" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-newspaper"></i>
              {!collapsed && <span>Blog</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-users"></i>
              {!collapsed && <span>Khách hàng</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;