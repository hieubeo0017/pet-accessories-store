import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReviewSection from '../components/reviews/ReviewSection';
import { addItem } from '../store/cartSlice';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const dispatch = useDispatch();
    
    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };
    
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };
    
    const handleAddToCart = () => {
        if (product) {
            dispatch(addItem({...product, quantity}));
            alert('Đã thêm vào giỏ hàng!');
        }
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
                // Ở đây chúng ta sử dụng dữ liệu mẫu
                const demoProducts = [
                    {
                        id: 101,
                        name: 'Royal Canin Maxi Adult',
                        petType: 'dog',
                        brand: 'Royal Canin',
                        price: 580000,
                        description: 'Thức ăn hạt khô dành cho chó trưởng thành giống lớn',
                        fullDescription: 'Royal Canin Maxi Adult là thức ăn được chế biến đặc biệt cho chó trưởng thành giống lớn (26-44kg) từ 15 tháng đến 8 tuổi. Công thức giúp duy trì khối lượng cơ bắp lý tưởng với hàm lượng protein phù hợp (25%) và lượng L-carnitine bổ sung.',
                        usage: 'Cho ăn theo bảng hướng dẫn trên bao bì, điều chỉnh theo cân nặng và mức độ hoạt động của chó. Đảm bảo luôn có nước sạch.',
                        ingredients: 'Protein gia cầm, gạo, mỡ động vật, ngô, protein thực vật, gluten ngô, bột mì, chất xơ thực vật, dầu cá, khoáng chất, men, vitamin...',
                        nutritionalInfo: 'Protein: 25%, Chất béo: 14%, Xơ thô: 1.3%, Khoáng chất: 7%, Omega 3: 0.65%',
                        weight: '10kg/bao',
                        madeIn: 'Pháp',
                        image: '/assets/images/products/royal-canin-food.jpg',
                        images: [
                            '/assets/images/products/royal-canin-food.jpg',
                            '/assets/images/products/royal-canin-food-2.jpg',
                            '/assets/images/products/royal-canin-food-3.jpg',
                        ]
                    },
                    {
                        id: 102,
                        name: 'Pate Whiskas cho mèo',
                        petType: 'cat',
                        brand: 'Whiskas',
                        price: 195000,
                        description: 'Pate cho mèo vị cá ngừ và cá hồi',
                        fullDescription: 'Whiskas Pate với công thức đặc biệt được thiết kế để đáp ứng nhu cầu dinh dưỡng của mèo. Với hương vị cá ngừ và cá hồi thơm ngon, sản phẩm giúp kích thích vị giác của mèo, đồng thời cung cấp các vitamin và khoáng chất thiết yếu.',
                        usage: 'Chia thành 2-3 bữa mỗi ngày. Một con mèo trưởng thành (4kg) cần khoảng 3-4 gói/ngày. Bảo quản trong tủ lạnh sau khi mở và sử dụng trong vòng 24 giờ.',
                        ingredients: 'Thịt và các sản phẩm từ động vật (bao gồm cá ngừ ít nhất 4%, cá hồi ít nhất 4%), các sản phẩm từ thực vật, khoáng chất, dầu và chất béo, vitamin...',
                        nutritionalInfo: 'Protein: 8.5%, Chất béo: 4.5%, Tro thô: 2.5%, Xơ thô: 0.3%, Độ ẩm: 82%',
                        weight: '85g/gói, 12 gói/hộp',
                        madeIn: 'Thái Lan',
                        image: '/assets/images/products/whiskas.jpg',
                        images: [
                            '/assets/images/products/whiskas.jpg',
                            '/assets/images/products/whiskas-2.jpg',
                            '/assets/images/products/whiskas-3.jpg',
                        ]
                    }
                ];

                const foundProduct = demoProducts.find(p => p.id === parseInt(id));
                if (foundProduct) {
                    setProduct(foundProduct);
                }
                
                // Giả lập dữ liệu đánh giá
                const demoReviews = [
                    {
                        id: 1,
                        user_name: 'Nguyễn Văn A',
                        rating: 5,
                        comment: 'Sản phẩm rất tốt, chó nhà mình rất thích ăn. Lông mượt hơn, ít rụng.',
                        created_at: '2025-03-15T08:30:00Z',
                    },
                    {
                        id: 2,
                        user_name: 'Trần Thị B',
                        rating: 4,
                        comment: 'Chất lượng sản phẩm tốt, nhưng giá hơi cao. Chó nhà mình ăn khỏe.',
                        created_at: '2025-02-28T14:20:00Z',
                        images: [
                            { image_url: '/images/reviews/review1.jpg' }
                        ]
                    },
                    {
                        id: 3,
                        user_name: 'Lê Văn C',
                        rating: 3,
                        comment: 'Sản phẩm tạm ổn. Bé nhà mình kén ăn nên phải mix với thức ăn khác.',
                        created_at: '2025-02-10T09:45:00Z',
                    }
                ];
                
                // Chỉ hiển thị đánh giá nếu sản phẩm ID phù hợp
                if (parseInt(id) === 101) {
                    setReviews(demoReviews);
                } else {
                    setReviews([]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (loading) {
        return <div className="loading">Đang tải thông tin sản phẩm...</div>;
    }

    if (!product) {
        return <div className="error-message">Không tìm thấy thông tin sản phẩm</div>;
    }

    return (
        <div className="product-detail-page">
            <div className="product-gallery">
                <div className="main-image">
                    <img src={product.image} alt={product.name} />
                </div>
                {product.images && product.images.length > 1 && (
                    <div className="thumbnail-images">
                        {product.images.map((image, index) => (
                            <img 
                                key={index} 
                                src={image} 
                                alt={`${product.name} ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="product-details">
                <h1>{product.name}</h1>
                <p className="brand">Thương hiệu: <span>{product.brand}</span></p>
                <p className="product-detail-price">{product.price.toLocaleString('vi-VN')}đ</p>

                <div className="product-info-section">
                    <h3>Mô tả sản phẩm</h3>
                    <p>{product.fullDescription || product.description}</p>
                </div>

                <div className="product-info-section">
                    <h3>Cách sử dụng</h3>
                    <p>{product.usage || 'Đang cập nhật thông tin'}</p>
                </div>

                <div className="product-info-section">
                    <h3>Thành phần</h3>
                    <p>{product.ingredients || 'Đang cập nhật thông tin'}</p>
                </div>

                <div className="product-specs">
                    <h3>Thông tin chi tiết</h3>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Dành cho:</span>
                            <span className="spec-value">{product.petType === 'dog' ? 'Chó' : 'Mèo'}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Khối lượng:</span>
                            <span className="spec-value">{product.weight || 'Đang cập nhật'}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Xuất xứ:</span>
                            <span className="spec-value">{product.madeIn || 'Đang cập nhật'}</span>
                        </div>
                        {product.nutritionalInfo && (
                            <div className="spec-item">
                                <span className="spec-label">Giá trị dinh dưỡng:</span>
                                <span className="spec-value">{product.nutritionalInfo}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="purchase-options">
                    <div className="quantity-selector">
                        <button onClick={decreaseQuantity}>-</button>
                        <span>{quantity}</span>
                        <button onClick={increaseQuantity}>+</button>
                    </div>
                    <button className="add-to-cart-button" onClick={handleAddToCart}>
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
            
            <div className="product-extra-info">
                <div className="delivery-info">
                    <h3><i className="fas fa-truck"></i> Thông tin vận chuyển</h3>
                    <p>Giao hàng toàn quốc, miễn phí vận chuyển cho đơn hàng trên 500.000đ</p>
                </div>
                
                <div className="guarantee-info">
                    <h3><i className="fas fa-shield-alt"></i> Cam kết</h3>
                    <p>Sản phẩm chính hãng 100%, đổi trả trong vòng 7 ngày nếu sản phẩm lỗi</p>
                </div>
                     {/* Thêm phần đánh giá ở đây */}
                <ReviewSection 
                itemType="product" 
                itemId={id} 
                reviews={reviews}
                />

            </div>
        </div>
    );
};

export default ProductDetailPage;