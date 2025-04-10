import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Trang không tìm thấy</h2>
        <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
        <Link to="/" className="btn-back">
          <i className="fas fa-arrow-left"></i> Quay lại trang chủ
        </Link>
      </div>
      
      <style jsx>{`
        .not-found-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - var(--header-height));
          text-align: center;
          padding: 20px;
        }
        
        .not-found-content {
          max-width: 500px;
        }
        
        .not-found-page h1 {
          font-size: 120px;
          color: var(--primary-color);
          margin-bottom: 0;
          line-height: 1;
        }
        
        .not-found-page h2 {
          font-size: 32px;
          margin-top: 0;
          margin-bottom: 20px;
          color: var(--secondary-color);
        }
        
        .not-found-page p {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
        }
        
        .btn-back {
          display: inline-block;
          padding: 12px 24px;
          background-color: var(--primary-color);
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .btn-back:hover {
          background-color: var(--secondary-color);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default NotFound;