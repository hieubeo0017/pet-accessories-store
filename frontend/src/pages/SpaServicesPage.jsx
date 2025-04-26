import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from './ServiceCard';
import { fetchSpaServices } from '../services/api';
import './SpaServicesPage.css';

const SpaServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    petType: 'all',
    petSize: 'all',
    search: ''
  });

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        
        console.log("Calling API with filters:", filters);
        
        const response = await fetchSpaServices({
          petType: filters.petType,
          petSize: filters.petSize,
          search: filters.search
        });
        
        console.log("API response:", response);
        
        setServices(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading spa services:', err);
        setError('Không thể tải dữ liệu dịch vụ spa');
        setLoading(false);
      }
    };

    loadServices();
    window.scrollTo(0, 0);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    console.log(`Filter changed: ${name} = ${value}`);
  };

  // Các hàm getPetTypeLabel và getPetSizeLabel vẫn giữ nguyên để dùng ở các vị trí khác nếu cần
  const getPetTypeLabel = (type) => {
    switch (type) {
      case 'dog': return 'chó';
      case 'cat': return 'mèo';
      default: return 'tất cả loại thú';
    }
  };

  const getPetSizeLabel = (size) => {
    switch (size) {
      case 'small': return 'nhỏ';
      case 'medium': return 'vừa';
      case 'large': return 'lớn';
      default: return 'mọi kích thước';
    }
  };

  return (
    <div className="spa-services-page">
      <div className="page-header">
        <h1>Dịch vụ spa cho thú cưng</h1>
        <p>Chọn dịch vụ phù hợp nhất cho thú cưng của bạn</p>
      </div>

      {/* Bộ lọc */}
      <div className="spa-filters-container">
        <div className="spa-filter-item">
          <label>Loại thú cưng:</label>
          <select 
            name="petType" 
            value={filters.petType} 
            onChange={handleFilterChange}
          >
            <option value="all">Tất cả</option>
            <option value="dog">Chó</option>
            <option value="cat">Mèo</option>
          </select>
        </div>

        <div className="spa-filter-item">
          <label>Kích thước:</label>
          <select 
            name="petSize" 
            value={filters.petSize} 
            onChange={handleFilterChange}
          >
            <option value="all">Tất cả</option>
            <option value="small">Nhỏ</option>
            <option value="medium">Vừa</option>
            <option value="large">Lớn</option>
          </select>
        </div>

        <div className="spa-filter-item search">
          <input 
            type="text" 
            placeholder="Tìm kiếm dịch vụ..." 
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Danh sách dịch vụ */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dịch vụ...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="spa-services-grid">
          {services.length > 0 ? (
            services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                highlight={
                  (filters.petType !== 'all' && service.pet_type === filters.petType) &&
                  (filters.petSize !== 'all' && service.pet_size === filters.petSize)
                }
              />
            ))
          ) : (
            <p className="no-results">
              Không tìm thấy dịch vụ phù hợp với bộ lọc hiện tại
              <br />
              <button className="reset-filters" onClick={() => setFilters({petType: 'all', petSize: 'all', search: ''})}>
                Đặt lại bộ lọc
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SpaServicesPage;