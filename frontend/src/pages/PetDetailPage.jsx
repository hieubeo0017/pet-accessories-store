import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPetById, fetchPets } from '../services/api';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { FaPaw, FaBirthdayCake, FaRuler, FaWeightHanging, FaShieldAlt, FaCheck, FaShoppingCart } from 'react-icons/fa';
import ReviewSection from '../components/reviews/ReviewSection';
import PetCard from '../components/pets/PetCard';
import './PetDetailPage.css';

const PetDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [pet, setPet] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [similarPets, setSimilarPets] = useState([]);
  
  // Thêm useEffect để cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);
  
  useEffect(() => {
    const loadPet = async () => {
      try {
        setLoading(true);
        const data = await fetchPetById(id);
        setPet(data);
        
        // Tải các thú cưng tương tự (cùng loài và giống)
        const response = await fetchPets({
          type: data.type,
          breed: data.breed,
          limit: 3,
          is_active: true,
        });
        
        // Loại bỏ thú cưng hiện tại khỏi danh sách
        const filtered = response.data.filter(p => p.id !== id);
        setSimilarPets(filtered.slice(0, 3));
        
        // Giả lập dữ liệu đánh giá (sau này sẽ lấy từ API)
        const demoReviews = [
          {
            id: 1,
            user_name: 'Phạm Văn X',
            rating: 5,
            comment: 'Bé rất dễ thương và ngoan. Sức khỏe tốt và đã quen với việc đi vệ sinh đúng chỗ.',
            created_at: '2025-03-20T10:15:00Z',
            images: [{ image_url: '/images/reviews/pet-review1.jpg' }]
          },
          {
            id: 2,
            user_name: 'Hoàng Thị Y',
            rating: 4.5,
            comment: 'Chó khỏe mạnh, lông đẹp và rất thân thiện. Shop tư vấn nhiệt tình.',
            created_at: '2025-03-05T16:30:00Z'
          }
        ];
        
        setReviews(demoReviews);
      } catch (error) {
        console.error('Error fetching pet details:', error);
        setError('Không thể tải thông tin thú cưng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPet();
    setSelectedImage(0); // Reset selected image when pet changes
  }, [id]);
  
  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };
  
  const increaseQuantity = () => {
    if (quantity < (pet?.stock || 1)) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (pet && !pet.is_adopted && pet.stock > 0) {
      const primaryImage = pet.images?.find(img => img.is_primary === true) || pet.images?.[0];
      
      dispatch(addItem({
        id: pet.id,
        name: pet.name,
        price: pet.price,
        image: primaryImage?.image_url || '',
        quantity,
        type: 'pet'
      }));
    }
  };
  
  const handleBuyNow = () => {
    if (pet && !pet.is_adopted && pet.stock > 0) {
      const primaryImage = pet.images?.find(img => img.is_primary === true) || pet.images?.[0];
      
      dispatch(addItem({
        id: pet.id,
        name: pet.name,
        price: pet.price,
        image: primaryImage?.image_url || '',
        quantity,
        type: 'pet'
      }));
      
      // Điều hướng đến trang giỏ hàng và cuộn lên đầu
      navigate('/cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pet) return <div className="error">Không tìm thấy thú cưng</div>;
  
  return (
    <div className="pet-detail-page">
      <div className="pet-gallery">
        <div className="main-image">
          <img 
            src={pet.images?.[selectedImage]?.image_url || '/images/default-pet.jpg'} 
            alt={pet.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-pet.jpg';
            }}
          />
        </div>
        <div className="thumbnail-images">
          {pet.images?.map((image, index) => (
            <img 
              key={index} 
              src={image.image_url}
              alt={`${pet.name} ${index+1}`}
              onClick={() => handleThumbnailClick(index)}
              className={selectedImage === index ? 'active' : ''}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-pet.jpg';
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="pet-details">
        <div className="pet-header">
          <h1>{pet.name}</h1>
          <p className="pet-id">Mã: {pet.id}</p>
        </div>
        
        <div className="pet-price">
          <span className="price">{pet.price.toLocaleString('vi-VN')}đ</span>
          {pet.is_adopted && <span className="adopted-tag">Đã bán</span>}
        </div>
        
        <div className="pet-attributes">
          <div className="attribute">
            <span className="label">Loài:</span>
            <span className="value">{pet.type === 'dog' ? 'Chó' : 'Mèo'}</span>
          </div>
          <div className="attribute">
            <span className="label">Giống:</span>
            <span className="value">{pet.breed}</span>
          </div>
          <div className="attribute">
            <span className="label">Tuổi:</span>
            <span className="value">{pet.age}</span>
          </div>
          <div className="attribute">
            <span className="label">Giới tính:</span>
            <span className="value">{pet.gender === 'male' ? 'Đực' : 'Cái'}</span>
          </div>
          <div className="attribute">
            <span className="label">Màu sắc:</span>
            <span className="value">{pet.color || 'N/A'}</span>
          </div>
          <div className="attribute">
            <span className="label">Cân nặng:</span>
            <span className="value">{pet.weight || 'N/A'}</span>
          </div>
        </div>
        
        <div className="pet-description">
          <h3>Mô tả:</h3>
          <p>{pet.description}</p>
        </div>
        
        <div className="health-info">
          <h3>Thông tin sức khỏe:</h3>
          <p><strong>Tiêm chủng:</strong> {pet.vaccination || 'Chưa có thông tin'}</p>
          <p><strong>Tình trạng sức khỏe:</strong> {pet.health || 'Chưa có thông tin'}</p>
          <p><strong>Nguồn gốc:</strong> {pet.origin || 'Chưa có thông tin'}</p>
        </div>
        
        {!pet.is_adopted && pet.stock > 0 && (
          <div className="purchase-options">
            <div className="quantity-selector">
              <button onClick={decreaseQuantity}>-</button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity}>+</button>
            </div>
            <div className="purchase-buttons">
              <button 
                className="contact-button"
                onClick={handleBuyNow}
              >
                Đặt Mua
              </button>
              <button 
                className="add-cart-button" 
                onClick={handleAddToCart}
              >
                <FaShoppingCart /> Thêm vào giỏ
              </button>
            </div>
          </div>
        )}
        
        {(pet.is_adopted || pet.stock <= 0) && (
          <div className="out-of-stock-message">
            <p>{pet.is_adopted ? 'Thú cưng này đã được bán' : 'Thú cưng này hiện không còn'}</p>
          </div>
        )}
      </div>
      
      <div className="extra-info">
        <div className="guarantee-section">
          <h3><FaShieldAlt className="info-icon" /> Cam kết và bảo hành</h3>
          <p>Thú cưng khỏe mạnh 100%, có hồ sơ tiêm chủng đầy đủ</p>
          <ul className="extra-features">
            <li><FaCheck /> Tư vấn sức khỏe miễn phí trong 30 ngày</li>
            <li><FaCheck /> Bảo hành tiêm phòng và thuốc xổ giun</li>
            <li><FaCheck /> Hỗ trợ khám chữa bệnh ưu đãi tại các phòng khám liên kết</li>
          </ul>
        </div>
      </div>
      
      <ReviewSection 
        itemType="pet" 
        itemId={id} 
        reviews={reviews}
      />
      
      {similarPets.length > 0 && (
        <div className="similar-pets-section">
          <h2>Thú cưng tương tự</h2>
          <div className="similar-pets-container">
            {similarPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetailPage;