import './Header.css';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="header-title">PetLand Admin</h1>
      </div>
      
      <div className="header-right">
        <div className="header-search">
          <input type="text" placeholder="Tìm kiếm..." />
          <i className="fas fa-search"></i>
        </div>
        
        <div className="header-notifications">
          <button className="notification-button">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
        </div>
        
        <div className="header-user">
          <img src="images/avatar-placeholder.png" alt="User Avatar" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">Admin</span>
            <button className="logout-button">
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;