import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from "./ServiceCard";
import SpaProcessSteps from "./SpaProcessSteps";
import { fetchFeaturedSpaServices } from '../services/api';
import '../assets/styles/spa.css';
import './SpaHomePage.css';

const SpaHomePage = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedServices = async () => {
      try {
        setLoading(true);
        
        // Gọi API thực tế thay vì dùng dữ liệu mẫu
        const response = await fetchFeaturedSpaServices();
        setFeaturedServices(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading featured spa services:', err);
        setError('Không thể tải dịch vụ spa nổi bật');
        setLoading(false);
      }
    };

    loadFeaturedServices();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="spa-home-page">
      {/* Hero Banner */}
      <div className="spa-hero-banner">
        <img src="/images/spa/spa-banner.png" alt="Pet Spa Services" />
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Dịch vụ Spa & Chăm sóc thú cưng</h1>
            <p>Mang đến trải nghiệm thư giãn và làm đẹp tuyệt vời cho thú cưng của bạn. Dịch vụ chăm sóc toàn diện, đội ngũ nhân viên giàu kinh nghiệm.</p>
            <div className="hero-buttons">
              <Link to="/spa/services" className="btn-primary">Xem dịch vụ</Link>
              <Link to="/spa/booking" className="btn-secondary">Đặt lịch ngay</Link>
            </div>
            
            <div className="appointment-link-container">
              <Link to="/spa/appointments" className="btn-secondary">
                <i className="fas fa-calendar-check"></i> Xem lịch hẹn của tôi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services */}
      <section className="spa-section">
        <div className="section-title">
          <h2>Dịch vụ nổi bật</h2>
          <p>Chọn dịch vụ chăm sóc thú cưng tốt nhất cho bạn nhỏ của bạn</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="spa-services-grid">
            {featuredServices.map(service => (
              <ServiceCard key={service.id} service={service}>
                <Link to={`/spa/service/${service.id}`} className="view-details-btn">Chi tiết</Link>
              </ServiceCard>
            ))}
          </div>
        )}

        <div className="view-all-services">
          <Link to="/spa/services" className="btn-primary">Xem tất cả dịch vụ</Link>
        </div>
      </section>

      {/* Process Steps */}
      <section className="spa-section spa-process-section">
        <div className="section-title">
          <h2>Quy trình chăm sóc</h2>
          <p>Chúng tôi luôn đảm bảo thú cưng của bạn được chăm sóc tốt nhất</p>
        </div>
        <SpaProcessSteps />
      </section>

      {/* Why Choose Us */}
      <section className="spa-section spa-features-section">
        <div className="section-title">
          <h2>Tại sao chọn dịch vụ spa của chúng tôi?</h2>
        </div>

        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <h3>Nhân viên chuyên nghiệp</h3>
            <p>Đội ngũ nhân viên được đào tạo bài bản, có kinh nghiệm chăm sóc thú cưng</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <h3>Sản phẩm cao cấp</h3>
            <p>Sử dụng các sản phẩm và dụng cụ chăm sóc cao cấp, an toàn cho thú cưng</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="fas fa-home"></i>
            </div>
            <h3>Không gian thoải mái</h3>
            <p>Không gian thiết kế thân thiện, thoải mái và an toàn cho thú cưng của bạn</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3>Cam kết chất lượng</h3>
            <p>Cam kết mang đến dịch vụ chất lượng cao với giá cả hợp lý</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="spa-cta-section">
        <div className="cta-content">
          <h2>Sẵn sàng đặt lịch?</h2>
          <p>Thú cưng của bạn xứng đáng được chăm sóc tốt nhất.</p>
          <Link to="/spa/booking" className="btn-primary">Đặt lịch ngay</Link>
        </div>
      </section>
    </div>
  );
};

export default SpaHomePage;