import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import HeroBanner from '../components/home/HeroBanner';
import FeaturedDogs from '../components/home/FeaturedDogs'; // Đổi import
import FeaturedCats from '../components/home/FeaturedCats'; // Đổi import
import FoodAndAccessories from '../components/home/FoodAndAccessories'; // Đổi import
import PromotionBanner from '../components/home/PromotionBanner';
import BrandsList from '../components/home/BrandsList';
import ServiceFeatures from '../components/home/ServiceFeatures';
import LatestBlog from '../components/home/LatestBlog';
import './HomePage.css';

const HomePage = () => {
    const dispatch = useDispatch();
    const { status } = useSelector(state => state.products);
    
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProducts());
        }
    }, [dispatch, status]);

    return (
        <div className="home-page">
            <main>
                <HeroBanner />
                <FeaturedDogs /> {/* Đổi tên component */}
                <FeaturedCats /> {/* Đổi tên component */}
                <FoodAndAccessories /> {/* Đổi tên component */}
                <PromotionBanner />
                <ServiceFeatures />
                <BrandsList />
                <LatestBlog />
            </main>
        </div>
    );
};

export default HomePage;