import React, { useState, useEffect, useRef } from 'react';
import { fetchFeaturedBrands } from '../../services/api'; // Thêm import API
import './BrandsList.css';

const BrandsList = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const visibleBrands = 4; // Số thương hiệu hiển thị đồng thời trong chế độ xoay vòng
    const sectionRef = useRef(null);

    // Tải dữ liệu thương hiệu nổi bật
    useEffect(() => {
        const loadFeaturedBrands = async () => {
            try {
                const response = await fetchFeaturedBrands({
                    limit: 8 // Lấy tối đa 8 thương hiệu nổi bật
                });
                
                setBrands(response.data || []);
                setError(null);
            } catch (err) {
                console.error('Error loading featured brands:', err);
                setError('Không thể tải dữ liệu thương hiệu nổi bật');
            } finally {
                setLoading(false);
            }
        };
        
        loadFeaturedBrands();
    }, []);

    // Thiết lập Intersection Observer để phát hiện khi section được hiển thị
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !hasBeenVisible) {
                // Khi section hiển thị lần đầu
                setShowAllBrands(true);
                setHasBeenVisible(true);
                
                // Sau 2 giây, chuyển về chế độ hiển thị xoay vòng
                setTimeout(() => {
                    setShowAllBrands(false);
                }, 2000);
            }
        }, { threshold: 0.2 }); // Kích hoạt khi ít nhất 20% section hiển thị

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [hasBeenVisible]);

    // Thiết lập interval cho chế độ xoay vòng
    useEffect(() => {
        if (!showAllBrands && brands.length > 0) {
            const timer = setInterval(() => {
                setActiveIndex(prevIndex => (prevIndex + 1) % brands.length);
            }, 3000);

            return () => clearInterval(timer);
        }
    }, [showAllBrands, brands.length]);

    if (loading) return <div className="loading">Đang tải...</div>;
    
    if (error) return <div className="error">{error}</div>;
    
    if (brands.length === 0) return null;

    return (
        <section className="brands-section" ref={sectionRef}>
            <h2 className="section-title">Thương Hiệu Nổi Bật</h2>
            <div className="brands-container">
                {brands.map((brand, index) => (
                    <div 
                        key={brand.id} 
                        className={`brand-item ${
                            showAllBrands || 
                            (index >= activeIndex && index < activeIndex + visibleBrands) 
                                ? 'visible' 
                                : ''
                        }`}
                    >
                        <img src={brand.logo} alt={brand.name} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BrandsList;