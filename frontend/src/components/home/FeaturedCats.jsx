import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedPets } from '../../services/api';
import DetailModal from '../common/DetailModal';
import './FeaturedCats.css';

const FeaturedCats = () => {
  const [featuredCats, setFeaturedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);

  useEffect(() => {
    const loadFeaturedCats = async () => {
      try {
        setLoading(true);
        const response = await fetchFeaturedPets({
          type: 'cat',
          limit: 4
        });
        
        setFeaturedCats(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading featured cats:', err);
        setError('Không thể tải dữ liệu mèo cảnh nổi bật');
      } finally {
        setLoading(false);
      }
    };
    
    loadFeaturedCats();
  }, []);

  const openModal = (petId) => {
    setSelectedPetId(petId);
    setModalOpen(true);
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (featuredCats.length === 0) {
    return null;
  }
  
  return (
    <>
      <section className="category-showcase">
        <h2 className="section-title">Các Giống Mèo Nổi Bật</h2>
        <div className="category-grid">
          {featuredCats.map(cat => {
            const primaryImage = cat.images?.find(img => img.is_primary) || cat.images?.[0];
            const imageUrl = primaryImage?.image_url || '/images/default-pet.jpg';
            
            return (
              <div key={cat.id} className="category-card">
                <div className="category-image">
                  <img 
                    src={imageUrl} 
                    alt={cat.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-pet.jpg';
                    }}
                  />
                  <div className="category-actions">
                    <button 
                      className="view-details"
                      onClick={() => openModal(cat.id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <div className="category-info">
                  <button 
                    className="category-name-button"
                    onClick={() => openModal(cat.id)}
                  >
                    {cat.name}
                  </button>
                  <p className="category-description">{cat.breed}</p>
                  <p className="category-price">{cat.price.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="view-more">
          <Link to="/pets?type=cat" className="view-more-btn">Xem tất cả giống mèo</Link>
        </div>
      </section>
      
      {/* Detail Modal */}
      <DetailModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        itemId={selectedPetId}
        itemType="pet"
      />
    </>
  );
};

export default FeaturedCats;