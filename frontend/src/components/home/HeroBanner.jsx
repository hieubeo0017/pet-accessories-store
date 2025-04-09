import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const bannerData = [
  {
    id: 1,
    title: "Đa dạng giống thú cưng quý hiếm",
    description: "Thú cưng khỏe mạnh, nguồn gốc rõ ràng",
    image: "/images/banners/pets-banner.jpg",
    link: "/pets"
  },
  {
    id: 2,
    title: "Thức ăn nhập khẩu chính hãng",
    description: "Đầy đủ dinh dưỡng cho thú cưng của bạn",
    image: "/images/banners/food-banner.jpg",
    link: "/foods"
  },
  {
    id: 3,
    title: "Đầy đủ phụ kiện, đồ chơi cho thú cưng",
    description: "Nhập khẩu từ các thương hiệu uy tín",
    image: "/images/banners/accessories-banner.jpg",
    link: "/accessories"
  }
];

const HeroBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % bannerData.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero-banner">
            <div className="banner-container">
                {bannerData.map((banner, index) => (
                    <div 
                        key={banner.id} 
                        className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{backgroundImage: `url(${banner.image})`}}
                    >
                        <div className="banner-content">
                            <h2>{banner.title}</h2>
                            <p>{banner.description}</p>
                            <Link to={banner.link} className="banner-btn">Xem ngay</Link>
                        </div>
                    </div>
                ))}
                
                <div className="banner-controls">
                    <button className="prev" onClick={() => setCurrentSlide(prev => (prev - 1 + bannerData.length) % bannerData.length)}>
                        &lt;
                    </button>
                    <div className="indicators">
                        {bannerData.map((_, index) => (
                            <span 
                                key={index} 
                                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                    <button className="next" onClick={() => setCurrentSlide(prev => (prev + 1) % bannerData.length)}>
                        &gt;
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;