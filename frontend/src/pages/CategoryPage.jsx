import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes } from 'react-icons/fa';

import ProductCard from '../components/products/ProductCard';
import PetCard from '../components/pets/PetCard';
import ServiceCard from './ServiceCard'; // Fixed import path
import { 
  fetchProductsByCategory, 
  fetchPets, 
  fetchSpaServices, 
  fetchCategories 
} from '../services/api';
import './CategoryPage.css';

const CategoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [categoryMap, setCategoryMap] = useState({}); // Store categories with their types
  
  // Load all categories initially to create a map
  useEffect(() => {
    const loadCategoryMap = async () => {
      try {
        const response = await fetchCategories();
        if (response.data && Array.isArray(response.data)) {
          // Create a map of category ID to category type
          const map = {};
          response.data.forEach(category => {
            map[category.id] = category.type || 'unknown';
          });
          setCategoryMap(map);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    
    loadCategoryMap();
  }, []);
  
  // Initialize from URL parameters
  useEffect(() => {
    const initFromURL = () => {
      // Get categories from URL
      const categoryParam = searchParams.get('categories')?.split(',').filter(Boolean) || [];
      if (categoryParam.length > 0) {
        setSelectedCategories(categoryParam);
      }
      
      // Get brands from URL
      const brandParam = searchParams.get('brands')?.split(',').filter(Boolean) || [];
      if (brandParam.length > 0) {
        setSelectedBrands(brandParam);
      }
      
      // Get price range from URL
      const minPrice = searchParams.get('minPrice') || '';
      const maxPrice = searchParams.get('maxPrice') || '';
      if (minPrice || maxPrice) {
        setPriceRange({ min: minPrice, max: maxPrice });
      }
    };
    
    initFromURL();
    // Only run once at component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update URL and load items when filters change
  useEffect(() => {
    const updateUrlAndLoadData = () => {
      // Build URL parameters
      const params = new URLSearchParams();
      
      if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
      }
      
      if (selectedBrands.length > 0) {
        params.set('brands', selectedBrands.join(','));
      }
      
      if (priceRange.min) {
        params.set('minPrice', priceRange.min);
      }
      
      if (priceRange.max) {
        params.set('maxPrice', priceRange.max);
      }
      
      // Update URL without triggering a navigation
      setSearchParams(params, { replace: true });
      
      // Load items with current filters
      loadAllItems();
    };
    
    // Only run if categoryMap is loaded and we have necessary data
    if (Object.keys(categoryMap).length > 0) {
      updateUrlAndLoadData();
    }
  }, [selectedCategories, selectedBrands, priceRange, categoryMap, setSearchParams]);
  
  const loadAllItems = async () => {
    if (selectedCategories.length === 0 && Object.keys(categoryMap).length > 0) {
      setItems([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Categorize selected categories by type
      const petCategories = [];
      const foodCategories = [];
      const accessoryCategories = [];
      const serviceCategories = [];
      
      selectedCategories.forEach(categoryId => {
        const categoryType = categoryMap[categoryId];
        if (categoryType === 'pet') {
          petCategories.push(categoryId);
        } else if (categoryType === 'food') {
          foodCategories.push(categoryId);
        } else if (categoryType === 'accessory') {
          accessoryCategories.push(categoryId);
        } else if (categoryType === 'service') {
          serviceCategories.push(categoryId);
        }
      });
      
      // Prepare filter options
      const filterOptions = {
        brand_id: selectedBrands.length > 0 ? selectedBrands : undefined,
        min_price: priceRange.min || undefined,
        max_price: priceRange.max || undefined
      };
      
      // Fetch data from each category type
      const [petsData, foodData, accessoriesData, servicesData] = await Promise.all([
        petCategories.length > 0 ? 
          fetchPets({ category_id: petCategories, ...filterOptions }) : 
          { data: [] },
        
        foodCategories.length > 0 ? 
          Promise.all(foodCategories.map(catId => 
            fetchProductsByCategory(catId, filterOptions)
          )).then(responses => {
            const allData = [];
            responses.forEach(res => {
              if (res.data && Array.isArray(res.data)) {
                allData.push(...res.data);
              }
            });
            return { data: allData };
          }) : 
          { data: [] },
        
        accessoryCategories.length > 0 ? 
          Promise.all(accessoryCategories.map(catId => 
            fetchProductsByCategory(catId, filterOptions)
          )).then(responses => {
            const allData = [];
            responses.forEach(res => {
              if (res.data && Array.isArray(res.data)) {
                allData.push(...res.data);
              }
            });
            return { data: allData };
          }) : 
          { data: [] },
        
        serviceCategories.length > 0 ? 
          fetchSpaServices({ categories: serviceCategories, ...filterOptions }) : 
          { data: [] }
      ]);
      
      // Process and combine results
      const allItems = [
        ...petsData.data.map(item => ({ ...item, itemType: 'pet' })),
        ...foodData.data.map(item => ({ ...item, itemType: 'food' })),
        ...accessoriesData.data.map(item => ({ ...item, itemType: 'accessory' })),
        ...servicesData.data.map(item => ({ ...item, itemType: 'service' }))
      ];
      
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategorySelect = (updatedCategories) => {
    setSelectedCategories(updatedCategories);
  };
  
  const handleBrandSelect = (updatedBrands) => {
    setSelectedBrands(updatedBrands);
  };
  
  const handlePriceChange = (updatedPriceRange) => {
    setPriceRange(updatedPriceRange);
  };
  
  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
  };
  
  // Render item based on its type
  const renderItem = (item) => {
    switch (item.itemType) {
      case 'pet':
        return <PetCard key={item.id} pet={item} />;
      case 'food':
      case 'accessory':
        return <ProductCard key={item.id} product={item} />;
      case 'service':
        return <ServiceCard key={item.id} service={item} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="category-page">
      <div className="page-header">
        <h1>Danh mục sản phẩm</h1>
        <button 
          className="filter-toggle-btn"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? (
            <>
              <FaTimes /> Ẩn bộ lọc
            </>
          ) : (
            <>
              <FaFilter /> Hiện bộ lọc
            </>
          )}
        </button>
      </div>
      
      <div className="page-content">
        <div className={`sidebar-container ${isFilterOpen ? 'open' : ''}`}>
          <CategorySidebar 
            selectedCategories={selectedCategories}
            onCategorySelect={handleCategorySelect}
            selectedBrands={selectedBrands}
            onBrandSelect={handleBrandSelect}
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
            categoryType="all" // Hiển thị tất cả loại danh mục
          />
        </div>
        
        <div className="content-container">
          {selectedCategories.length > 0 && (
            <div className="active-filters">
              <span>Đã chọn {selectedCategories.length} danh mục</span>
              <button className="clear-filters" onClick={clearAllFilters}>
                <FaTimes /> Xóa bộ lọc
              </button>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <div className="results-info">
                <p>Hiển thị {items.length} kết quả</p>
              </div>
              
              <div className="items-grid">
                {items.map(item => renderItem(item))}
                {items.length === 0 && !loading && (
                  <div className="no-results">
                    {selectedCategories.length > 0 
                      ? "Không tìm thấy kết quả phù hợp" 
                      : "Vui lòng chọn danh mục để xem sản phẩm"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;