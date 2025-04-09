import React, { useState, useEffect, useRef } from 'react';
import './BrandsList.css';

const brands = [
    { id: 1, name: 'Royal Canin', logo: '/images/brands/Royal Canin.png' },
    { id: 2, name: 'Whiskas', logo: '/images/brands/Whiskas.jpg' },
    { id: 3, name: 'Pedigree', logo: '/images/brands/Pedigree.png' }, 
    { id: 4, name: 'Kong', logo: '/images/brands/Kong.png' },
    { id: 5, name: 'Catsrang', logo: '/images/brands/Catsrang.png' }
];

const BrandsList = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const visibleBrands = 4; // Số thương hiệu hiển thị đồng thời trong chế độ xoay vòng
    const sectionRef = useRef(null);

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
        if (!showAllBrands) {
            const timer = setInterval(() => {
                setActiveIndex(prevIndex => (prevIndex + 1) % brands.length);
            }, 3000);

            return () => clearInterval(timer);
        }
    }, [showAllBrands]);

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