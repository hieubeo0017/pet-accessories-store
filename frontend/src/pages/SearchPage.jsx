import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAll } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import PetCard from '../components/pets/PetCard';
import ServiceCard from './ServiceCard';
import { FaFilter, FaTimes } from 'react-icons/fa';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState({
    pets: [],
    products: [],
    services: [],
    loading: true,
    error: null
  });
  
  const [activeTab, setActiveTab] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSearchResults();
  }, [query]);
  
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder.png';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
  };
  
  const normalizeSearchResults = (data) => {
    const normalizedPets = (data.pets || []).map(pet => ({
      ...pet,
      type: 'pet',
      images: pet.images || [{ image_url: pet.image }],
      image_url: pet.image || (pet.images && pet.images[0]?.image_url)
    }));
    
    const normalizedProducts = (data.products || []).map(product => ({
      ...product,
      type: 'product',
      images: product.images || [{ image_url: product.image }],
      image_url: product.image || (product.images && product.images[0]?.image_url)
    }));
    
    const normalizedServices = (data.services || []).map(service => ({
      ...service,
      type: 'service',
      image_url: service.image || service.image_url
    }));
    
    return {
      pets: normalizedPets,
      products: normalizedProducts,
      services: normalizedServices
    };
  };

  const fetchSearchResults = async () => {
    if (!query) return;
    
    try {
      setSearchResults(prev => ({...prev, loading: true}));
      const data = await searchAll(query, { limit: 50 });
      
      const normalizedData = normalizeSearchResults(data);
      
      setSearchResults({
        pets: normalizedData.pets,
        products: normalizedData.products,
        services: normalizedData.services,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults({
        pets: [],
        products: [],
        services: [],
        loading: false,
        error: 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.'
      });
    }
  };
  
  const totalResults = searchResults.pets.length + searchResults.products.length + searchResults.services.length;
  
  const getFilteredResults = () => {
    let results = [];
    
    if (activeTab === 'all') {
      results = [
        ...searchResults.pets.map(item => ({...item, type: 'pet'})),
        ...searchResults.products.map(item => ({...item, type: 'product'})),
        ...searchResults.services.map(item => ({...item, type: 'service'}))
      ];
    } else if (activeTab === 'pets') {
      results = searchResults.pets.map(item => ({...item, type: 'pet'}));
    } else if (activeTab === 'products') {
      results = searchResults.products.map(item => ({...item, type: 'product'}));
    } else if (activeTab === 'services') {
      results = searchResults.services.map(item => ({...item, type: 'service'}));
    }
    
    if (sortBy === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      results.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return results;
  };
  
  const filteredResults = getFilteredResults();
  
  return (
    <div className="search-page">
      <div className="search-header">
        <h1>TÌM THẤY {totalResults} KẾT QUẢ CHO "{query}"</h1>
        <div className="search-tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            Tất cả ({totalResults})
          </button>
          <button 
            className={activeTab === 'pets' ? 'active' : ''} 
            onClick={() => setActiveTab('pets')}
          >
            Thú cưng ({searchResults.pets.length})
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''} 
            onClick={() => setActiveTab('products')}
          >
            Sản phẩm ({searchResults.products.length})
          </button>
          <button 
            className={activeTab === 'services' ? 'active' : ''} 
            onClick={() => setActiveTab('services')}
          >
            Dịch vụ spa ({searchResults.services.length})
          </button>
        </div>
      </div>
      
      <div className="search-filters">
        <button 
          className="filter-toggle-btn" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FaFilter /> {isFilterOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </button>
        
        <div className={`filters-container ${isFilterOpen ? 'open' : ''}`}>
          <div className="filters-header">
            <h2>Sắp xếp kết quả</h2>
          </div>
          
          <div className="filters">
            <div className="filter-group">
              <label>Sắp xếp theo:</label>
              <div className="select-wrapper">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Mặc định</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {searchResults.loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      ) : searchResults.error ? (
        <div className="error-message">{searchResults.error}</div>
      ) : filteredResults.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-search"></i>
          <h2>Không tìm thấy kết quả nào</h2>
          <p>Vui lòng thử tìm kiếm với từ khóa khác.</p>
        </div>
      ) : (
        <div className="search-results-grid">
          {filteredResults.map((item, index) => (
            <div key={index}>
              {item.type === 'pet' && <PetCard pet={item} />}
              {item.type === 'product' && <ProductCard product={item} />}
              {item.type === 'service' && <ServiceCard service={item} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;