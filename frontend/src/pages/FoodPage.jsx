import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaSearch, FaFilter, FaTimes, FaDog, FaPaw, FaTag, FaMoneyBillWave } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import { addItem } from '../store/cartSlice';
import './FoodPage.css';

const FoodPage = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        petType: 'all',
        brand: 'all',
        minPrice: '',
        maxPrice: '',
    });
    const dispatch = useDispatch();

    useEffect(() => {
        const loadFoods = async () => {
            try {
                // Giả lập API call - thay bằng fetchProductsByCategory thực tế sau này
                const demoFoods = [
                    {
                        id: 101,
                        name: 'Royal Canin Maxi Adult',
                        petType: 'dog',
                        brand: 'Royal Canin',
                        price: 580000,
                        description: 'Thức ăn hạt khô dành cho chó trưởng thành giống lớn',
                        image: '/images/products/royal-canin-food.jpg'
                    },
                    {
                        id: 102,
                        name: 'Pate Whiskas cho mèo',
                        petType: 'cat',
                        brand: 'Whiskas',
                        price: 195000,
                        description: 'Pate cho mèo vị cá ngừ và cá hồi',
                        image: '/images/products/whiskas.jpg'
                    },
                    {
                        id: 103,
                        name: 'Pedigree cho chó con',
                        petType: 'dog',
                        brand: 'Pedigree',
                        price: 450000,
                        description: 'Thức ăn hạt mềm cho chó con dưới 1 năm tuổi',
                        image: '/assets/images/products/pedigree.jpg'
                    },
                    {
                        id: 104,
                        name: 'Me-O Tuna Adult',
                        petType: 'cat',
                        brand: 'Me-O',
                        price: 320000,
                        description: 'Thức ăn hạt cho mèo trưởng thành vị cá ngừ',
                        image: '/assets/images/products/meo-food.jpg'
                    },
                ];
                
                setFoods(demoFoods);
                setLoading(false);
            } catch (error) {
                console.error('Error loading foods:', error);
                setLoading(false);
            }
        };

        loadFoods();
    }, []);

    const handleAddToCart = (product) => {
        dispatch(addItem(product));
    };

    const clearFilters = () => {
        setFilters({
            petType: 'all',
            brand: 'all',
            minPrice: '',
            maxPrice: ''
        });
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    const filteredFoods = foods.filter(food => 
        (filters.petType === 'all' || food.petType === filters.petType) &&
        (filters.brand === 'all' || food.brand === filters.brand) &&
        (!filters.minPrice || food.price >= parseInt(filters.minPrice)) &&
        (!filters.maxPrice || food.price <= parseInt(filters.maxPrice))
    );

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
                                <option value="small">Thú nhỏ</option>
                                <option value="bird">Chim cảnh</option>
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
                                <option value="Royal Canin">Royal Canin</option>
                                <option value="Whiskas">Whiskas</option>
                                <option value="Pedigree">Pedigree</option>
                                <option value="Me-O">Me-O</option>
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
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                                />
                            </div>
                            <span className="price-separator">-</span>
                            <div className="price-input-wrapper">
                                <input 
                                    type="number" 
                                    placeholder="Tối đa"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
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
                            Thương hiệu: {filters.brand}
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

            <div className="results-info">
                <p>Hiển thị {filteredFoods.length} sản phẩm</p>
            </div>

            <div className="products-grid">
                {filteredFoods.length > 0 ? (
                    filteredFoods.map(food => (
                        <div key={food.id} className="product-card-container">
                            <ProductCard 
                                product={{
                                    ...food,
                                    price: food.price
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <p className="no-results">Không tìm thấy sản phẩm phù hợp</p>
                )}
            </div>
        </div>
    );
};

export default FoodPage;