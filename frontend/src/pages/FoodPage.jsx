import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FaSearch, FaFilter, FaTimes, FaDog, FaPaw, FaTag, FaMoneyBillWave } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';

import { addItem } from '../store/cartSlice';
import { fetchCategories, fetchProductsByCategory, fetchAllBrands } from '../services/api';
import { useLocation, useSearchParams } from 'react-router-dom';
import './FoodPage.css';

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

const FoodPage = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [brands, setBrands] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [foodCategories, setFoodCategories] = useState([]);
    
    // Tách state filters thành 2 phần: filters chính và priceInputs tạm thời
    const [filters, setFilters] = useState({
        petType: 'all',
        brand: 'all',
        minPrice: '',
        maxPrice: '',
        categories: []
    });
    
    // Thêm state riêng cho input giá
    const [priceInputs, setPriceInputs] = useState({
        minPrice: '',
        maxPrice: ''
    });
    
    // Thêm useRef để theo dõi giá trị filters hiện tại
    const filtersRef = useRef(filters);
    
    // Cập nhật ref mỗi khi filters thay đổi
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);
    
    const dispatch = useDispatch();

    // Tạo hàm loadFoods có thể sử dụng bên ngoài useEffect
    const loadFoods = async (filtersToUse = filters) => {
        try {
            setLoading(true);
            console.log("Loading foods with filters:", filtersToUse); // Debug
            
            const categoriesResponse = await fetchCategories({ type: 'food' });
            const foodCategoryIds = categoriesResponse.data.map(category => category.id);
            
            // Sử dụng filters được truyền vào hoặc state mặc định
            const cleanedFilters = {
                ...filtersToUse,
                minPrice: filtersToUse.minPrice ? parseInt(filtersToUse.minPrice, 10) || 0 : undefined,
                maxPrice: filtersToUse.maxPrice ? parseInt(filtersToUse.maxPrice, 10) || 0 : undefined
            };
            
            const foodPromises = foodCategoryIds.map(categoryId => 
                fetchProductsByCategory(categoryId, {
                    pet_type: cleanedFilters.petType !== 'all' ? cleanedFilters.petType : undefined,
                    min_price: cleanedFilters.minPrice,
                    max_price: cleanedFilters.maxPrice,
                    brand_id: cleanedFilters.brand !== 'all' ? cleanedFilters.brand : undefined
                })
            );
            
            const responses = await Promise.all(foodPromises);
            
            let allFoods = [];
            responses.forEach(response => {
                if (response.data && Array.isArray(response.data)) {
                    allFoods = [...allFoods, ...response.data];
                }
            });
            
            console.log("Found foods:", allFoods.length); // Debug
            setFoods(allFoods);
            setError(null);
        } catch (error) {
            console.error('Error loading foods:', error);
            setError('Không thể tải dữ liệu thức ăn. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    // Sửa lại hàm debounced để sử dụng ref thay vì closure value
    const debouncedLoadFoods = useCallback(
        debounce(() => {
            // Sử dụng giá trị hiện tại của filters từ ref
            loadFoods(filtersRef.current);
        }, 800),
        [] // Không có dependency, hàm này không thay đổi
    );

    // Lấy danh sách thương hiệu từ API
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const response = await fetchAllBrands({ is_active: true });
                if (response && response.data) {
                    setBrands(response.data);
                }
            } catch (error) {
                console.error('Error loading brands:', error);
            }
        };
        
        loadBrands();
        // Khởi tạo priceInputs từ filters
        setPriceInputs({
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice
        });
    }, []);

    // Xử lý trực tiếp cho các filter không phải giá
    useEffect(() => {
        loadFoods();
    }, [filters.petType, filters.brand]);
    
    // Xử lý riêng cho filter giá
    useEffect(() => {
        if (filters.minPrice !== '' || filters.maxPrice !== '') {
            debouncedLoadFoods(); // Sử dụng hàm debounced khi giá thay đổi
        }
    }, [filters.minPrice, filters.maxPrice, debouncedLoadFoods]);

    // Xử lý cho input giá
    const handlePriceInputChange = (name, value) => {
        // Đảm bảo giá trị là số hợp lệ
        const sanitizedValue = value === '' ? '' : value.replace(/[^\d]/g, '');
        
        // Cập nhật state tạm thời cho input
        setPriceInputs({
            ...priceInputs,
            [name]: sanitizedValue
        });
        
        // Cập nhật filters (sẽ kích hoạt useEffect và debounce)
        setFilters({
            ...filters,
            [name]: sanitizedValue
        });
    };

    const handleAddToCart = (product) => {
        // Giữ nguyên logic
        const primaryImage = product.images?.find(img => img.is_primary)?.image_url || 
                            product.images?.[0]?.image_url || '';
        
        dispatch(addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: primaryImage,
            quantity: 1,
            type: 'product'
        }));
    };

    const clearFilters = () => {
        setFilters({
            petType: 'all',
            brand: 'all',
            minPrice: '',
            maxPrice: ''
        });
        setPriceInputs({
            minPrice: '',
            maxPrice: ''
        });
    };

    return (
        <div className="food-page">
            <div className="page-header">
                <h1>Thức ăn thú cưng</h1>
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
                                value={filters.petType}
                                onChange={(e) => setFilters({...filters, petType: e.target.value})}
                            >
                                <option value="all">Tất cả</option>
                                <option value="dog">Chó</option>
                                <option value="cat">Mèo</option>
                            </select>
                        </div>
                    </div>

                    {/* Bộ lọc thương hiệu */}
                    <div className="filter-group">
                        <label><FaTag /> Thương hiệu:</label>
                        <div className="select-wrapper">
                            <select 
                                value={filters.brand}
                                onChange={(e) => setFilters({...filters, brand: e.target.value})}
                            >
                                <option value="all">Tất cả</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Bộ lọc giá - cập nhật để sử dụng priceInputs */}
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

                <div className="active-filters">
                    {filters.petType !== 'all' && (
                        <div className="filter-tag">
                            Loại thú: {filters.petType === 'dog' ? 'Chó' : filters.petType === 'cat' ? 'Mèo' : filters.petType}
                            <button onClick={() => setFilters({...filters, petType: 'all'})}><FaTimes /></button>
                        </div>
                    )}
                    {filters.brand !== 'all' && (
                        <div className="filter-tag">
                            Thương hiệu: {brands.find(b => b.id === filters.brand)?.name || filters.brand}
                            <button onClick={() => setFilters({...filters, brand: 'all'})}><FaTimes /></button>
                        </div>
                    )}
                    {filters.minPrice && (
                        <div className="filter-tag">
                            Giá từ: {parseInt(filters.minPrice).toLocaleString('vi-VN')}đ
                            <button onClick={() => setFilters({...filters, minPrice: ''})}><FaTimes /></button>
                        </div>
                    )}
                    {filters.maxPrice && (
                        <div className="filter-tag">
                            Giá đến: {parseInt(filters.maxPrice).toLocaleString('vi-VN')}đ
                            <button onClick={() => setFilters({...filters, maxPrice: ''})}><FaTimes /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hiển thị thông báo lỗi nếu có */}
            {error && <div className="error-message">{error}</div>}

            {/* Thêm loading indicator nhỏ gọn */}
            {loading && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <span>Đang tải dữ liệu...</span>
                </div>
            )}

            <div className="results-info">
                <p>Hiển thị {foods.length} sản phẩm</p>
            </div>

            <div className="products-grid">
                {foods.length > 0 ? (
                    foods.map(food => (
                        <div key={food.id} className="product-card-container">
                            <ProductCard product={food} />
                        </div>
                    ))
                ) : !loading ? ( // Chỉ hiển thị "không tìm thấy" khi không đang loading
                    <p className="no-results">Không tìm thấy sản phẩm phù hợp</p>
                ) : null}
            </div>
        </div>
    );
};

export default FoodPage;