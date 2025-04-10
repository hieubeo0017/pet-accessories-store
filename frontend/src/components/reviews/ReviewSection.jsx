import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import './ReviewSection.css';

const ReviewSection = ({ itemType, itemId, reviews = [] }) => {
    // Tính điểm trung bình đánh giá
    const averageRating = reviews.length 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
    
    // Hàm render số sao dựa trên điểm đánh giá
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;
        
        // Thêm sao đầy đủ
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
        }
        
        // Thêm nửa sao nếu có
        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="star-icon filled" />);
        }
        
        // Thêm sao rỗng cho đủ 5 sao
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} className="star-icon" />);
        }
        
        return stars;
    };

    return (
        <div className="review-section">
            <h2 className="review-heading">Đánh giá từ khách hàng</h2>
            
            <div className="review-summary">
                {reviews.length > 0 ? (
                    <>
                        <div className="average-rating">
                            <div className="rating-number">{averageRating.toFixed(1)}</div>
                            <div className="rating-stars">{renderStars(averageRating)}</div>
                        </div>
                        <div className="rating-count">{reviews.length} đánh giá</div>
                    </>
                ) : (
                    <p className="no-reviews">Chưa có đánh giá nào cho sản phẩm này</p>
                )}
            </div>
            
            {reviews.length > 0 && (
                <div className="reviews-list">
                    {reviews.map((review, index) => (
                        <div key={review.id || index} className="review-item">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <h4 className="reviewer-name">{review.user_name}</h4>
                                    <p className="review-date">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="reviewer-rating">{renderStars(review.rating)}</div>
                            </div>
                            
                            <div className="review-content">
                                <p>{review.comment}</p>
                            </div>
                            
                            {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                    {review.images.map((image, imageIndex) => (
                                        <img 
                                            key={imageIndex} 
                                            src={image.image_url} 
                                            alt={`Review image ${imageIndex + 1}`} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            <div className="review-note">
                <p>Đánh giá chỉ dành cho khách hàng đã mua sản phẩm</p>
            </div>
        </div>
    );
};

export default ReviewSection;