import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedPets } from '../../services/api';
import DetailModal from '../common/DetailModal';
import './FeaturedDogs.css';

const FeaturedDogs = () => {
  const [featuredDogs, setFeaturedDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);

  useEffect(() => {
    const loadFeaturedDogs = async () => {
      try {
        setLoading(true);
        const response = await fetchFeaturedPets({
          type: 'dog',
          limit: 4
        });
        
        setFeaturedDogs(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading featured dogs:', err);
        setError('Không thể tải dữ liệu chó cảnh nổi bật');
      } finally {
        setLoading(false);
      }
    };
    
    loadFeaturedDogs();
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

  if (featuredDogs.length === 0) {
    return null;
  }
  
  return (
    <>
      <section className="category-showcase">
        <h2 className="section-title">Các Giống Chó Nổi Bật</h2>
        <div className="category-grid">
          {featuredDogs.map(dog => {
            const primaryImage = dog.images?.find(img => img.is_primary) || dog.images?.[0];
            const imageUrl = primaryImage?.image_url || '/images/default-pet.jpg';
            
            return (
              <div key={dog.id} className="category-card">
                <div className="category-image">
                  <img 
                    src={imageUrl} 
                    alt={dog.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-pet.jpg';
                    }}
                  />
                  <div className="category-actions">
                    <button 
                      className="view-details"
                      onClick={() => openModal(dog.id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <div className="category-info">
                  <button 
                    className="category-name-button"
                    onClick={() => openModal(dog.id)}
                  >
                    {dog.name}
                  </button>
                  <p className="category-description">{dog.breed}</p>
                  <p className="category-price">{dog.price.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="view-more">
          <Link to="/pets?type=dog" className="view-more-btn">Xem tất cả giống chó</Link>
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

export default FeaturedDogs;