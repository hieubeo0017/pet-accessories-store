import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from './ServiceCard';
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

  // Dữ liệu mẫu cho các dịch vụ spa
  const mockServices = [
    {
      id: '1',
      name: 'Tắm và vệ sinh',
      description: 'Dịch vụ tắm, vệ sinh tai, cắt móng và làm sạch cho thú cưng của bạn.',
      price: '250000',
      duration: '60',
      pet_type: 'dog',
      pet_size: 'all',
      image_url: '/images/spa/service-bath.jpg'
    },
    {
      id: '2',
      name: 'Cắt tỉa lông',
      description: 'Cắt tỉa lông theo yêu cầu, tạo kiểu lông phù hợp với giống chó của bạn.',
      price: '350000',
      duration: '90',
      pet_type: 'dog',
      pet_size: 'all',
      image_url: '/images/spa/service-grooming.jpg'
    },
    {
      id: '3', 
      name: 'Massage và đắp mặt nạ',
      description: 'Giúp thú cưng thư giãn với liệu pháp massage và đắp mặt nạ dưỡng lông.',
      price: '300000',
      duration: '45',
      pet_type: 'dog',
      pet_size: 'all',
      image_url: '/images/spa/service-massage.jpg'
    },
    {
      id: '4',
      name: 'Tẩy lông rụng',
      description: 'Loại bỏ lông rụng, giảm thiểu tình trạng rụng lông trong nhà.',
      price: '200000',
      duration: '40',
      pet_type: 'cat',
      pet_size: 'all',
      image_url: '/images/spa/service-deshedding.jpg'
    },
    {
      id: '5',
      name: 'Spa cao cấp toàn diện',
      description: 'Gói spa cao cấp bao gồm tắm, cắt tỉa, massage và các dịch vụ làm đẹp khác.',
      price: '500000',
      duration: '120',
      pet_type: 'all',
      pet_size: 'all',
      image_url: '/images/spa/service-premium.jpg'
    },
    {
      id: '6',
      name: 'Chăm sóc móng',
      description: 'Cắt và mài móng an toàn, giúp thú cưng thoải mái khi di chuyển.',
      price: '150000',
      duration: '30',
      pet_type: 'all',
      pet_size: 'small',
      image_url: '/images/spa/service-nails.jpg'
    },
    {
      id: '7',
      name: 'Làm sạch tai',
      description: 'Vệ sinh tai chuyên sâu, ngăn ngừa viêm nhiễm và ký sinh trùng.',
      price: '120000',
      duration: '25',
      pet_type: 'all',
      pet_size: 'all',
      image_url: '/images/spa/service-ears.jpg'
    },
    {
      id: '8',
      name: 'Tắm trị nấm và ve rận',
      description: 'Điều trị đặc biệt cho thú cưng có vấn đề về da, nấm hoặc ve rận.',
      price: '420000',
      duration: '70',
      pet_type: 'all',
      pet_size: 'medium',
      image_url: '/images/spa/service-treatment.jpg'
    }
  ];

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        // Thay thế API bằng dữ liệu mẫu và thêm độ trễ mô phỏng
        setTimeout(() => {
          // Lọc dữ liệu mẫu dựa trên bộ lọc
          let filteredServices = [...mockServices];
          
          // Lọc theo loại thú cưng
          if (filters.petType !== 'all') {
            filteredServices = filteredServices.filter(service => 
              service.pet_type === filters.petType || service.pet_type === 'all'
            );
          }
          
          // Lọc theo kích thước
          if (filters.petSize !== 'all') {
            filteredServices = filteredServices.filter(service =>
              service.pet_size === filters.petSize || service.pet_size === 'all'
            );
          }
          
          // Lọc theo từ khóa tìm kiếm
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredServices = filteredServices.filter(service =>
              service.name.toLowerCase().includes(searchLower) ||
              service.description.toLowerCase().includes(searchLower)
            );
          }
          
          setServices(filteredServices);
          setLoading(false);
        }, 500); // Giả lập độ trễ 500ms của API
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
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <p className="no-results">
              Không tìm thấy dịch vụ phù hợp với bộ lọc hiện tại
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SpaServicesPage;