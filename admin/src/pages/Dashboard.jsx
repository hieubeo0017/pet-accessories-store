import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Bảng điều khiển</h1>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Sản phẩm</h3>
          <p className="stat-value">24</p>
        </div>
        <div className="stat-card">
          <h3>Thú cưng</h3>
          <p className="stat-value">15</p>
        </div>
        <div className="stat-card">
          <h3>Danh mục</h3>
          <p className="stat-value">8</p>
        </div>
        <div className="stat-card">
          <h3>Thương hiệu</h3>
          <p className="stat-value">12</p>
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2>Đơn hàng gần đây</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#ORD001</td>
              <td>Nguyễn Văn A</td>
              <td>10/04/2025</td>
              <td>850.000đ</td>
              <td><span className="status-badge active">Đã giao</span></td>
            </tr>
            <tr>
              <td>#ORD002</td>
              <td>Trần Thị B</td>
              <td>09/04/2025</td>
              <td>1.250.000đ</td>
              <td><span className="status-badge warning">Đang giao</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;