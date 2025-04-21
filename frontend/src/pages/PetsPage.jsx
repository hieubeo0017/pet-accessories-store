import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchPets } from "../services/api";
import PetCard from '../components/pets/PetCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaDog, FaCat, FaSearch, FaFilter, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import './PetsPage.css';

// Thêm hàm debounce
const debounce = (func, delay) => {
  let timerId;
  return function(...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const PetsPage = () => {
  // Thêm useEffect này để cuộn lên đầu trang khi component được mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const typeParam = queryParams.get('type');
  
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: typeParam || 'all',
    breed: 'all',
    gender: 'all',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 12
  });

  // Thêm state cho danh sách giống
  const [dogBreeds, setDogBreeds] = useState([]);
  const [catBreeds, setCatBreeds] = useState([]);
  
  // Thêm state riêng cho input giá
  const [priceInputs, setPriceInputs] = useState({
    minPrice: '',
    maxPrice: ''
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });

  // Thêm useRef để theo dõi giá trị filters hiện tại
  const filtersRef = useRef(filters);

  // Cập nhật ref mỗi khi filters thay đổi
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  // Theo dõi thay đổi của tham số URL
  useEffect(() => {
    if (typeParam) {
      setFilters(prevFilters => ({
        ...prevFilters,
        type: typeParam
      }));
    }
    
    // Khởi tạo priceInputs từ filters
    setPriceInputs({
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice
    });
  }, [typeParam]);
  
  // Sửa lại hàm debounced để sử dụng ref thay vì closure value
  const debouncedLoadPets = useCallback(
    debounce(() => {
      // Sử dụng giá trị hiện tại của filters từ ref
      loadPets(filtersRef.current);
    }, 800),
    [] // Không có dependency, hàm này không thay đổi
  );
  
  // Cập nhật useEffect để xử lý các filter không phải giá
  useEffect(() => {
    // Chỉ áp dụng cho các filter không phải giá
    loadPets();
  }, [filters.type, filters.breed, filters.gender, filters.page]);
  
  // Thêm useEffect riêng cho giá
  useEffect(() => {
    if (filters.minPrice !== '' || filters.maxPrice !== '') {
      debouncedLoadPets(); // Sử dụng hàm debounced khi giá thay đổi
    }
  }, [filters.minPrice, filters.maxPrice, debouncedLoadPets]);
  
  // Sửa hàm loadPets để nhận filters từ tham số
  const loadPets = async (filtersToUse = filters) => {
    try {
      setLoading(true);
      
      // Sử dụng filters được truyền vào hoặc state mặc định
      const cleanedFilters = {
        ...filtersToUse,
        minPrice: filtersToUse.minPrice ? parseInt(filtersToUse.minPrice, 10) || 0 : undefined,
        maxPrice: filtersToUse.maxPrice ? parseInt(filtersToUse.maxPrice, 10) || 0 : undefined
      };
      
      const response = await fetchPets({
        page: cleanedFilters.page,
        limit: cleanedFilters.limit,
        type: cleanedFilters.type !== 'all' ? cleanedFilters.type : '',
        breed: cleanedFilters.breed !== 'all' ? cleanedFilters.breed : '',
        gender: cleanedFilters.gender !== 'all' ? cleanedFilters.gender : '',
        min_price: cleanedFilters.minPrice,
        max_price: cleanedFilters.maxPrice
      });
      
      setPets(response.data || []);
      setPagination(response.pagination || {
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 1
      });
    } catch (error) {
      console.error('Error loading pets:', error);
      setError('Không thể tải dữ liệu thú cưng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const clearFilters = () => {
    setFilters({
      ...filters,
      type: 'all',
      breed: 'all',
      gender: 'all',
      minPrice: '',
      maxPrice: ''
    });
    setPriceInputs({
      minPrice: '',
      maxPrice: ''
    });
  };
  
  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    window.scrollTo(0, 0);
  };
  
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
      page: 1
    });
  };
  
  // Thêm hàm xử lý riêng cho giá
  const handlePriceInputChange = (name, value) => {
    // Đảm bảo giá trị là số hợp lệ
    const sanitizedValue = value === '' ? '' : value.replace(/[^\d]/g, '');
    
    // Cập nhật state tạm thời cho input trước (hiển thị ngay)
    setPriceInputs(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Cập nhật filters (kích hoạt useEffect với debounce)
    setFilters(prev => ({
      ...prev,
      [name]: sanitizedValue,
      page: 1
    }));
  };
  
  // Thêm useEffect để lấy danh sách giống từ database
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        // Gọi API để lấy danh sách giống chó
        const dogResponse = await fetchPets({
          type: 'dog',
          limit: 100
        });
        
        // Gọi API để lấy danh sách giống mèo
        const catResponse = await fetchPets({
          type: 'cat',
          limit: 100
        });
        
        // Lọc các giống duy nhất từ kết quả API
        const uniqueDogBreeds = [...new Set(dogResponse.data.map(pet => pet.breed))];
        const uniqueCatBreeds = [...new Set(catResponse.data.map(pet => pet.breed))];
        
        // Định dạng danh sách giống để hiển thị trong dropdown
        setDogBreeds(uniqueDogBreeds.map(breed => ({ value: breed, label: breed })));
        setCatBreeds(uniqueCatBreeds.map(breed => ({ value: breed, label: breed })));
      } catch (error) {
        console.error('Error loading breeds:', error);
      }
    };
    
    fetchBreeds();
  }, []);
  
  // Hàm lấy danh sách giống dựa theo loại thú
  const getBreedsByType = (petType) => {
    if (petType === 'dog') return dogBreeds;
    if (petType === 'cat') return catBreeds;
    return [...dogBreeds, ...catBreeds]; // Trả về tất cả khi loại thú là 'all'
  }
  
  // Thêm useEffect để reset breed khi thay đổi type
  useEffect(() => {
    if (filters.type !== 'all') {
      // Reset breed về 'all' khi loại thú thay đổi
      setFilters(prev => ({
        ...prev,
        breed: 'all'
      }));
    }
  }, [filters.type]);
  
  if (loading && pets.length === 0) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div className="pets-page">
      <div className="page-header">
        <h1>Thú cưng đang bán</h1>
        <button 
          className="filter-toggle-btn" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FaFilter /> {isFilterOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </button>
      </div>
      
      <div className={`filters-container ${isFilterOpen ? 'open' : ''}`}>
        <div className="filters-header">
          <h2><FaSearch /> Bộ lọc tìm kiếm</h2>
          <button className="clear-filters" onClick={clearFilters}>
            <FaTimes /> Xóa bộ lọc
          </button>
        </div>
        
        <div className="filters">
          {/* Bộ lọc loại thú */}
          <div className="filter-group">
            <label><FaDog /> Loại thú:</label>
            <div className="select-wrapper">
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="dog">Chó</option>
                <option value="cat">Mèo</option>
              </select>
            </div>
          </div>
          
          {/* Cập nhật bộ lọc giống */}
          <div className="filter-group">
            <label><FaCat /> Giống:</label>
            <div className="select-wrapper">
              <select 
                value={filters.breed}
                onChange={(e) => handleFilterChange('breed', e.target.value)}
              >
                <option value="all">Tất cả</option>
                {getBreedsByType(filters.type).map(breed => (
                  <option key={breed.value} value={breed.value}>
                    {breed.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Bộ lọc giới tính */}
          <div className="filter-group">
            <label>Giới tính:</label>
            <div className="select-wrapper">
              <select 
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="male">Đực</option>
                <option value="female">Cái</option>
              </select>
            </div>
          </div>
          
          {/* Bộ lọc giá */}
          <div className="filter-group price-filter">
            <label><FaMoneyBillWave /> Giá (VNĐ):</label>
            <div className="price-inputs">
              <div className="price-input-wrapper">
                <input 
                  type="number" 
                  placeholder="Tối thiểu"
                  value={priceInputs.minPrice}
                  onChange={(e) => handlePriceInputChange('minPrice', e.target.value)}
                />
              </div>
              <span className="price-separator">-</span>
              <div className="price-input-wrapper">
                <input 
                  type="number" 
                  placeholder="Tối đa"
                  value={priceInputs.maxPrice}
                  onChange={(e) => handlePriceInputChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Tag hiển thị bộ lọc đã chọn */}
        <div className="active-filters">
          {filters.type !== 'all' && (
            <div className="filter-tag">
              Loại: {filters.type === 'dog' ? 'Chó' : 'Mèo'}
              <button onClick={() => handleFilterChange('type', 'all')}><FaTimes /></button>
            </div>
          )}
          
          {filters.breed !== 'all' && (
            <div className="filter-tag">
              Giống: {filters.breed}
              <button onClick={() => handleFilterChange('breed', 'all')}><FaTimes /></button>
            </div>
          )}
          
          {filters.gender !== 'all' && (
            <div className="filter-tag">
              Giới tính: {filters.gender === 'male' ? 'Đực' : 'Cái'}
              <button onClick={() => handleFilterChange('gender', 'all')}><FaTimes /></button>
            </div>
          )}
          
          {filters.minPrice && (
            <div className="filter-tag">
              Giá từ: {parseInt(filters.minPrice).toLocaleString('vi-VN')}đ
              <button onClick={() => handleFilterChange('minPrice', '')}><FaTimes /></button>
            </div>
          )}
          
          {filters.maxPrice && (
            <div className="filter-tag">
              Giá đến: {parseInt(filters.maxPrice).toLocaleString('vi-VN')}đ
              <button onClick={() => handleFilterChange('maxPrice', '')}><FaTimes /></button>
            </div>
          )}
        </div>
      </div>
      
      <div className="results-info">
        <p>Hiển thị {pagination.total} thú cưng</p>
      </div>
      
      <div className="pets-grid">
        {pets.length === 0 ? (
          <div className="no-pets-found">Không tìm thấy thú cưng nào</div>
        ) : (
          pets.map(pet => <PetCard key={pet.id} pet={pet} />)
        )}
      </div>
      
      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            &laquo; Trước
          </button>
          
          {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${pagination.page === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="pagination-btn"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default PetsPage;