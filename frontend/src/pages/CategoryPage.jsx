import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FaSearch, FaFilter, FaTimes, FaDog, FaPaw, FaTag, FaMoneyBillWave } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import { fetchProducts, fetchAllBrands, fetchCategories } from '../services/api';
import { addItem } from '../store/cartSlice';
import './CategoryPage.css';

// Thêm hàm debounce
const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

const CategoryPage = () => {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [accessoryCategories, setAccessoryCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Tách riêng state cho giá để xử lý input
    const [priceInputs, setPriceInputs] = useState({
        minPrice: '',
        maxPrice: ''
    });
    
    const [filters, setFilters] = useState({
        petType: 'all',
        brand_id: '',
        minPrice: '',
        maxPrice: '',
        categoryId: '', 
        page: 1
    });
    
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        limit: 12,
        page: 1
    });
    
    const dispatch = useDispatch();
    const filtersRef = useRef(filters);

    // Cập nhật ref khi filters thay đổi
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Thêm useEffect để cuộn lên đầu trang khi component được mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Tải danh sách danh mục phụ kiện
    useEffect(() => {
        const loadAccessoryCategories = async () => {
            try {
                const response = await fetchCategories({ type: 'accessory' });
                if (response && response.data) {
                    setAccessoryCategories(response.data);
                }
            } catch (error) {
                console.error('Error loading accessory categories:', error);
            }
        };

        loadAccessoryCategories();
    }, []);

    // Load danh sách thương hiệu
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const response = await fetchAllBrands();
                if (response && response.data) {
                    setBrands(response.data);
                }
            } catch (error) {
                console.error('Error loading brands:', error);
            }
        };

        loadBrands();
    }, []);

    // Tạo hàm loadProducts riêng biệt
    const loadProducts = async () => {
        try {
            setLoading(true);
            
            const response = await fetchProducts({
                page: filtersRef.current.page,
                limit: 12,
                category_type: 'accessory',
                category_id: filtersRef.current.categoryId || undefined,
                pet_type: filtersRef.current.petType !== 'all' ? filtersRef.current.petType : undefined,
                brand_id: filtersRef.current.brand_id || undefined,
                min_price: filtersRef.current.minPrice || undefined,
                max_price: filtersRef.current.maxPrice || undefined,
                is_active: true
            });
            
            if (response && response.data) {
                setProducts(response.data);
                setPagination(response.pagination);
            } else {
                setProducts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
            setLoading(false);
        }
    };

    // Tạo hàm debounced để xử lý giá
    const debouncedLoadProducts = useCallback(
        debounce(() => {
            loadProducts();
        }, 800),
        []
    );

    // useEffect cho các filter không phải giá
    useEffect(() => {
        if (accessoryCategories.length > 0 || filters.categoryId) {
            loadProducts();
        }
    }, [filters.petType, filters.brand_id, filters.categoryId, filters.page, accessoryCategories]);

    // useEffect riêng cho giá
    useEffect(() => {
        if (filters.minPrice !== '' || filters.maxPrice !== '') {
            debouncedLoadProducts();
        }
    }, [filters.minPrice, filters.maxPrice]);

    const handleAddToCart = (product) => {
        if (product && product.stock > 0) {
            const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || '';
            
            dispatch(addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: getImageUrl(primaryImage),
                quantity: 1,
                type: 'product'
            }));
        }
    };

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (name, value) => {
        setFilters({
            ...filters,
            [name]: value,
            page: 1
        });
    };

    // Xử lý thay đổi bộ lọc giá với debounce
    const handlePriceFilterChange = (name, value) => {
        // Cập nhật UI ngay lập tức
        setPriceInputs(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Đảm bảo giá trị là số hợp lệ
        const sanitizedValue = value === '' ? '' : value.replace(/[^\d]/g, '');
        
        // Cập nhật filters (sẽ trigger useEffect với debounce)
        setFilters(prev => ({
            ...prev,
            [name]: sanitizedValue,
            page: 1
        }));
    };

    const clearFilters = () => {
        setFilters({
            petType: 'all',
            brand_id: '',
            minPrice: '',
            maxPrice: '',
            categoryId: '',
            page: 1
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '/images/placeholder-product.jpg';
        
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        } else {
            return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
    };

    if (loading && products.length === 0) return <div className="loading">Đang tải...</div>;

    return (
        <div className="category-page">
            <div className="page-header">
                <h1>Phụ kiện thú cưng</h1>
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
                                onChange={(e) => handleFilterChange('petType', e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="dog">Chó</option>
                                <option value="cat">Mèo</option>
                            </select>
                        </div>
                    </div>

                    {/* Bộ lọc danh mục phụ kiện */}
                    <div className="filter-group">
                        <label><FaPaw /> Danh mục:</label>
                        <div className="select-wrapper">
                            <select
                                value={filters.categoryId}
                                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                            >
                                <option value="">Tất cả phụ kiện</option>
                                {accessoryCategories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Bộ lọc thương hiệu */}
                    <div className="filter-group">
                        <label><FaTag /> Thương hiệu:</label>
                        <div className="select-wrapper">
                            <select
                                value={filters.brand_id}
                                onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Bộ lọc giá - đã sửa để sử dụng handlePriceFilterChange */}
                    <div className="filter-group price-filter">
                        <label><FaMoneyBillWave /> Giá (VNĐ):</label>
                        <div className="price-inputs">
                            <div className="price-input-wrapper">
                                <input
                                    type="number"
                                    placeholder="Tối thiểu"
                                    value={priceInputs.minPrice}
                                    onChange={(e) => handlePriceFilterChange('minPrice', e.target.value)}
                                />
                            </div>
                            <span className="price-separator">-</span>
                            <div className="price-input-wrapper">
                                <input
                                    type="number"
                                    placeholder="Tối đa"
                                    value={priceInputs.maxPrice}
                                    onChange={(e) => handlePriceFilterChange('maxPrice', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hiển thị bộ lọc đang áp dụng */}
                <div className="active-filters">
                    {filters.petType !== 'all' && (
                        <div className="filter-tag">
                            Loại: {filters.petType === 'dog' ? 'Chó' : filters.petType === 'cat' ? 'Mèo' : filters.petType}
                            <button onClick={() => handleFilterChange('petType', 'all')}><FaTimes /></button>
                        </div>
                    )}
                    
                    {filters.categoryId && (
                        <div className="filter-tag">
                            Danh mục: {accessoryCategories.find(c => c.id === filters.categoryId)?.name || filters.categoryId}
                            <button onClick={() => handleFilterChange('categoryId', '')}><FaTimes /></button>
                        </div>
                    )}
                    
                    {filters.brand_id && (
                        <div className="filter-tag">
                            Thương hiệu: {brands.find(b => b.id === filters.brand_id)?.name || filters.brand_id}
                            <button onClick={() => handleFilterChange('brand_id', '')}><FaTimes /></button>
                        </div>
                    )}
                    
                    {filters.minPrice && (
                        <div className="filter-tag">
                            Giá từ: {parseInt(filters.minPrice).toLocaleString('vi-VN')}đ
                            <button onClick={() => {
                                handleFilterChange('minPrice', '');
                                setPriceInputs(prev => ({...prev, minPrice: ''}));
                            }}><FaTimes /></button>
                        </div>
                    )}
                    
                    {filters.maxPrice && (
                        <div className="filter-tag">
                            Giá đến: {parseInt(filters.maxPrice).toLocaleString('vi-VN')}đ
                            <button onClick={() => {
                                handleFilterChange('maxPrice', '');
                                setPriceInputs(prev => ({...prev, maxPrice: ''}));
                            }}><FaTimes /></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="results-info">
                <p>Hiển thị {products.length} sản phẩm (trang {pagination.page}/{pagination.totalPages || 1})</p>
            </div>

            {loading && <div className="loading-overlay">Đang tải...</div>}

            <div className="products-grid">
                {products.length > 0 ? (
                    products.map(product => (
                        <div key={product.id} className="product-card-container">
                            <ProductCard
                                product={{
                                    ...product,
                                    image: product.images && product.images[0] ? getImageUrl(product.images[0].image_url) : '/images/placeholder-product.jpg',
                                }}
                                onAddToCart={() => handleAddToCart(product)}
                            />
                        </div>
                    ))
                ) : (
                    <p className="no-results">Không tìm thấy sản phẩm phù hợp</p>
                )}
            </div>

            {/* Phân trang */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(pagination.page - 1)} 
                        disabled={pagination.page === 1}
                    >
                        &laquo; Trang trước
                    </button>
                    
                    {[...Array(pagination.totalPages).keys()].map(page => (
                        <button 
                            key={page + 1}
                            onClick={() => handlePageChange(page + 1)}
                            className={pagination.page === page + 1 ? 'active' : ''}
                        >
                            {page + 1}
                        </button>
                    ))}
                    
                    <button 
                        onClick={() => handlePageChange(pagination.page + 1)} 
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Trang sau &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;