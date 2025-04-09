import React, { useEffect, useState } from 'react';
import { fetchPets } from '../services/api';
import PetCard from '../components/pets/PetCard';
import { useLocation } from 'react-router-dom';
import { FaDog, FaCat, FaSearch, FaFilter, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import './PetsPage.css';

const PetsPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get('type');
    
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        type: typeParam || 'all',
        breed: 'all',
        minPrice: '',
        maxPrice: '',
    });

    useEffect(() => {
        const loadPets = async () => {
            try {
                // Thay thế bằng API thực khi có backend
                const demoPets = [
                    {
                        id: 1,
                        name: 'Poodle Toy đực',
                        type: 'dog',
                        breed: 'Poodle',
                        age: '2 tháng',
                        price: 5500000,
                        description: 'Chó Poodle Toy thuần chủng, đã tiêm 2 mũi vaccine, tẩy giun đầy đủ',
                        image: '/images/featured-pets/dogs/Poodle Tiny.jpg'
                    },
                    {
                        id: 2,
                        name: 'Mèo Anh lông ngắn',
                        type: 'cat',
                        breed: 'British Shorthair',
                        age: '3 tháng',
                        price: 3800000,
                        description: 'Mèo Anh lông ngắn thuần chủng, màu xám xanh, đã tiêm vaccine, tẩy giun',
                        image: '/images/featured-pets/cats/british-shorthair.jpg'
                    },
                    // Thêm các thú cưng khác
                ];
                setPets(demoPets);
            } catch (error) {
                console.error('Error loading pets:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPets();
    }, []);

    // Theo dõi thay đổi của tham số URL
    useEffect(() => {
        if (typeParam) {
            setFilters(prevFilters => ({
                ...prevFilters,
                type: typeParam
            }));
        }
    }, [typeParam]);

    const clearFilters = () => {
        setFilters({
            type: 'all',
            breed: 'all',
            minPrice: '',
            maxPrice: ''
        });
    };

    if (loading) return <div className="loading">Đang tải...</div>;

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
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                                <option value="all">Tất cả</option>
                                <option value="dog">Chó</option>
                                <option value="cat">Mèo</option>
                                
                            </select>
                        </div>
                    </div>

                    {/* Bộ lọc giống */}
                    <div className="filter-group">
                        <label><FaCat /> Giống:</label>
                        <div className="select-wrapper">
                            <select 
                                value={filters.breed}
                                onChange={(e) => setFilters({...filters, breed: e.target.value})}
                            >
                                <option value="all">Tất cả</option>
                                <option value="poodle">Poodle</option>
                                <option value="corgi">Corgi</option>
                                <option value="british">Mèo Anh</option>
                                <option value="persian">Mèo Ba Tư</option>
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
                    {filters.type !== 'all' && (
                        <div className="filter-tag">
                            Loại thú: {filters.type === 'dog' ? 'Chó' : filters.type === 'cat' ? 'Mèo' : filters.type}
                            <button onClick={() => setFilters({...filters, type: 'all'})}><FaTimes /></button>
                        </div>
                    )}
                    {filters.breed !== 'all' && (
                        <div className="filter-tag">
                            Giống: {filters.breed}
                            <button onClick={() => setFilters({...filters, breed: 'all'})}><FaTimes /></button>
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
                <p>Hiển thị {pets.filter(pet => 
                    (filters.type === 'all' || pet.type === filters.type) &&
                    (filters.breed === 'all' || pet.breed.toLowerCase() === filters.breed) &&
                    (!filters.minPrice || pet.price >= parseInt(filters.minPrice)) &&
                    (!filters.maxPrice || pet.price <= parseInt(filters.maxPrice))
                ).length} thú cưng</p>
            </div>

            <div className="pets-grid">
                {pets
                    .filter(pet => 
                        (filters.type === 'all' || pet.type === filters.type) &&
                        (filters.breed === 'all' || pet.breed.toLowerCase() === filters.breed) &&
                        (!filters.minPrice || pet.price >= parseInt(filters.minPrice)) &&
                        (!filters.maxPrice || pet.price <= parseInt(filters.maxPrice))
                    )
                    .map(pet => (
                        <PetCard key={pet.id} pet={pet} />
                    ))}
            </div>
        </div>
    );
};

export default PetsPage;