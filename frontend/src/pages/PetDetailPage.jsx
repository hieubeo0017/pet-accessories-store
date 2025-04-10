import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaShieldAlt, FaTruck, FaCheck } from 'react-icons/fa';
import { fetchPetById } from '../services/api';
import ReviewSection from '../components/reviews/ReviewSection';
import './PetDetailPage.css';

const PetDetailPage = () => {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0); // Thêm state cho ảnh được chọn
    const [reviews, setReviews] = useState([]); 
    const dispatch = useDispatch();

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    const handleAddToCart = () => {
        // Thêm logic xử lý thêm vào giỏ hàng ở đây
        console.log(`Thêm ${quantity} ${pet.name} vào giỏ hàng`);
    };

    // Thêm hàm xử lý khi chọn ảnh thumbnail
    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
    };

    useEffect(() => {
        const getPet = async () => {
            try {
                // Giả dữ liệu cho demo
                const demoPet = {
                    id: id,
                    name: 'Poodle Toy đực',
                    type: 'dog',
                    breed: 'Poodle',
                    age: '2 tháng',
                    color: 'Trắng',
                    weight: '1.2 kg',
                    gender: 'Đực',
                    price: 5500000,
                    description: 'Chó Poodle Toy thuần chủng, đã tiêm 2 mũi vaccine, tẩy giun đầy đủ. Sức khỏe tốt, hoạt động năng động, thân thiện với người.',
                    images: [
                        '/images/featured-pets/dogs/Poodle Tiny.jpg',
                        '/images/featured-pets/dogs/poodle-female.jpg',
                        '/images/featured-pets/dogs/poodle-teacup.jpg'
                    ],
                    vaccination: 'Đã tiêm 2 mũi vaccine, tẩy giun đầy đủ',
                    health: 'Đã được bác sĩ thú y kiểm tra, sức khỏe tốt',
                    origin: 'Nhà nhân giống uy tín tại TP. HCM'
                };
                setPet(demoPet);

                 // Giả lập dữ liệu đánh giá
                 const demoReviews = [
                    {
                        id: 1,
                        user_name: 'Phạm Văn X',
                        rating: 5,
                        comment: 'Bé Poodle rất dễ thương và ngoan. Sức khỏe tốt và đã quen với việc đi vệ sinh đúng chỗ. Rất đáng mua!',
                        created_at: '2025-03-20T10:15:00Z',
                        images: [
                            { image_url: '/images/reviews/pet-review1.jpg' }
                        ]
                    },
                    {
                        id: 2,
                        user_name: 'Hoàng Thị Y',
                        rating: 4.5,
                        comment: 'Chú chó khỏe mạnh, lông đẹp và rất thân thiện. Shop tư vấn nhiệt tình.',
                        created_at: '2025-03-05T16:30:00Z'
                    }
                ];
                
                // Chỉ hiển thị đánh giá nếu pet ID phù hợp
                setReviews(demoReviews);

            } catch (error) {
                console.error('Error fetching pet details:', error);
            } finally {
                setLoading(false);
            }
        };

        getPet();
        setSelectedImage(0); // Reset selected image when pet changes
    }, [id]);

    if (loading) return <div className="loading">Đang tải...</div>;
    if (!pet) return <div className="error">Không tìm thấy thú cưng</div>;

    // Dữ liệu mẫu cho thú cưng tương tự
    const similarPets = [
        {
            id: 201,
            name: 'Poodle Tiny đực',
            breed: 'Poodle',
            age: '2.5 tháng',
            price: 6000000,
            image: '/images/featured-pets/dogs/Poodle Tiny.jpg'
        },
        {
            id: 202,
            name: 'Poodle Toy cái',
            breed: 'Poodle',
            age: '3 tháng',
            price: 5000000,
            image: '/images/featured-pets/dogs/poodle-female.jpg'
        },
        {
            id: 203,
            name: 'Teacup Poodle',
            breed: 'Poodle',
            age: '3 tháng',
            price: 12000000,
            image: '/images/featured-pets/dogs/poodle-teacup.jpg'
        }
    ];

    return (
        <div className="pet-detail-page">
            <div className="pet-gallery">
                <div className="main-image">
                    <img src={pet.images[selectedImage]} alt={pet.name} />
                </div>
                <div className="thumbnail-images">
                    {pet.images.map((image, index) => (
                        <img 
                            key={index} 
                            src={image} 
                            alt={`${pet.name} ${index+1}`}
                            onClick={() => handleThumbnailClick(index)}
                            className={index === selectedImage ? 'active' : ''}
                        />
                    ))}
                </div>
            </div>
            
            {/* Phần còn lại của component giữ nguyên */}
            <div className="pet-details">
                <h1>{pet.name}</h1>
                <p className="pet-price">{pet.price.toLocaleString('vi-VN')}đ</p>
                
                <div className="pet-attributes">
                    <div className="attribute">
                        <span className="label">Giống:</span>
                        <span className="value">{pet.breed}</span>
                    </div>
                    <div className="attribute">
                        <span className="label">Tuổi:</span>
                        <span className="value">{pet.age}</span>
                    </div>
                    <div className="attribute">
                        <span className="label">Màu sắc:</span>
                        <span className="value">{pet.color}</span>
                    </div>
                    <div className="attribute">
                        <span className="label">Cân nặng:</span>
                        <span className="value">{pet.weight}</span>
                    </div>
                    <div className="attribute">
                        <span className="label">Giới tính:</span>
                        <span className="value">{pet.gender}</span>
                    </div>
                </div>
                
                <div className="pet-description">
                    <h3>Mô tả:</h3>
                    <p>{pet.description}</p>
                </div>
                
                <div className="health-info">
                    <h3>Thông tin sức khỏe:</h3>
                    <p><strong>Tiêm chủng:</strong> {pet.vaccination}</p>
                    <p><strong>Tình trạng sức khỏe:</strong> {pet.health}</p>
                    <p><strong>Nguồn gốc:</strong> {pet.origin}</p>
                </div>
                
                <div className="purchase-options">
                    <div className="quantity-selector">
                        <button onClick={decreaseQuantity}>-</button>
                        <span>{quantity}</span>
                        <button onClick={increaseQuantity}>+</button>
                    </div>
                    <button className="contact-button" onClick={handleAddToCart}>
                        Đặt Mua
                    </button>
                </div>
            </div>

            {/* Thêm phần thông tin bổ sung */}
            <div className="pet-extra-info">
                <div className="delivery-info">
                    <h3><FaTruck className="info-icon" /> Thông tin vận chuyển</h3>
                    <p>Giao hàng toàn quốc, miễn phí vận chuyển cho đơn hàng trên 2.000.000đ</p>
                    <ul className="extra-features">
                        <li><FaCheck /> Nhận thú cưng trực tiếp tại cửa hàng</li>
                        <li><FaCheck /> Vận chuyển bằng xe chuyên dụng đảm bảo an toàn</li>
                        <li><FaCheck /> Tư vấn chăm sóc thú cưng miễn phí 24/7</li>
                    </ul>
                </div>
                
                <div className="guarantee-info">
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
            

            <div className="similar-pets-section">
                <h2>Thú cưng tương tự</h2>
                <div className="similar-pets-container">
                    {similarPets.map(pet => (
                        <Link to={`/pet/${pet.id}`} key={pet.id} className="similar-pet-card">
                            <img src={pet.image} alt={pet.name} />
                            <h3>{pet.name}</h3>
                            <p className="similar-pet-breed">{pet.breed}</p>
                            <p className="similar-pet-age">{pet.age}</p>
                            <p className="similar-pet-price">{pet.price.toLocaleString('vi-VN')}đ</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PetDetailPage;