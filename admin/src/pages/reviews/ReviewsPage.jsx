import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import userService from '../../services/userService';
import './Reviews.css';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [updatingApproval, setUpdatingApproval] = useState(null);
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');

    // Load reviews with mockup data
    useEffect(() => {
        const timer = setTimeout(() => {
            // Temporary mock data
            const mockData = [
                {
                    review_id: "REVIEW-0001",
                    user_id: "USER-001",
                    username: "NguyenVanA",
                    email: "nguyenvana@example.com",
                    item_type: "product",
                    product_id: "PROD-001",
                    product_name: "Royal Canin Mini Adult",
                    pet_id: null,
                    pet_name: null,
                    rating: 5,
                    comment: "Thức ăn rất tốt, chó nhà tôi rất thích và khỏe mạnh hơn!",
                    is_approved: true,
                    created_at: "2025-04-15T08:30:00Z",
                    review_images: [
                        { image_url: "https://source.unsplash.com/random/300x300?dog-food" },
                        { image_url: "https://source.unsplash.com/random/300x300?puppy" }
                    ]
                },
                {
                    review_id: "REVIEW-0002",
                    user_id: "USER-002",
                    username: "TranThiB",
                    email: "tranthib@example.com",
                    item_type: "pet",
                    product_id: null,
                    product_name: null,
                    pet_id: "PET-001",
                    pet_name: "Golden Retriever",
                    rating: 4,
                    comment: "Chó rất khỏe mạnh và dễ thương, nhưng hơi hiếu động.",
                    is_approved: false,
                    created_at: "2025-04-18T10:15:00Z",
                    review_images: []
                },
                {
                    review_id: "REVIEW-0003",
                    user_id: "USER-003",
                    username: "LeVanC",
                    email: "levanc@example.com",
                    item_type: "product",
                    product_id: "PROD-002",
                    product_name: "Vòng cổ da cao cấp",
                    pet_id: null,
                    pet_name: null,
                    rating: 2,
                    comment: "Chất lượng không như mong đợi, đeo một thời gian đã bị hỏng.",
                    is_approved: true,
                    created_at: "2025-04-20T14:45:00Z",
                    review_images: [
                        { image_url: "https://source.unsplash.com/random/300x300?dog-collar" }
                    ]
                },
                {
                    review_id: "REVIEW-0004",
                    user_id: "USER-004",
                    username: "PhamThiD",
                    email: "phamthid@example.com",
                    item_type: "product",
                    product_id: "PROD-003",
                    product_name: "Bàn chải lông cho mèo",
                    pet_id: null,
                    pet_name: null,
                    rating: 5,
                    comment: "Sản phẩm rất tốt, mèo nhà tôi rất thích khi được chải lông.",
                    is_approved: true,
                    created_at: "2025-04-22T09:20:00Z",
                    review_images: [
                        { image_url: "https://source.unsplash.com/random/300x300?cat-brush" },
                        { image_url: "https://source.unsplash.com/random/300x300?cat" }
                    ]
                },
                {
                    review_id: "REVIEW-0005",
                    user_id: "USER-005",
                    username: "HoangVanE",
                    email: "hoangvane@example.com",
                    item_type: "pet",
                    product_id: null,
                    product_name: null,
                    pet_id: "PET-002",
                    pet_name: "Mèo Anh lông ngắn",
                    rating: 3,
                    comment: "Mèo khỏe mạnh nhưng hơi nhút nhát, cần thời gian để làm quen.",
                    is_approved: false,
                    created_at: "2025-04-25T11:50:00Z",
                    review_images: [
                        { image_url: "https://source.unsplash.com/random/300x300?british-shorthair" }
                    ]
                }
            ];
            
            // Filter based on current filters
            let filteredData = [...mockData];
            
            if (statusFilter !== 'all') {
                const isApproved = statusFilter === 'approved';
                filteredData = filteredData.filter(review => review.is_approved === isApproved);
            }
            
            if (ratingFilter !== 'all') {
                filteredData = filteredData.filter(review => review.rating === parseInt(ratingFilter));
            }
            
            if (searchTerm) {
                filteredData = filteredData.filter(review => 
                    review.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (review.product_name && review.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (review.pet_name && review.pet_name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            setReviews(filteredData);
            setTotalItems(filteredData.length);
            setTotalPages(Math.ceil(filteredData.length / pageSize));
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, statusFilter, ratingFilter]);

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            // In production: await userService.deleteReview(reviewToDelete.review_id);
            
            setShowDeleteModal(false);
            toast.success('Xóa đánh giá thành công');
            
            // Update the reviews list by removing the deleted review
            setReviews(prev => prev.filter(r => r.review_id !== reviewToDelete.review_id));
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(error.message || 'Lỗi khi xóa đánh giá');
        }
    };

    const handleViewDetail = (review) => {
        setSelectedReview(review);
        setShowDetailModal(true);
    };

    const handleToggleApproval = async (review) => {
        try {
            setUpdatingApproval(review.review_id);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            // In production: await userService.toggleReviewApproval(review.review_id, !review.is_approved);
            
            // Update the reviews list with the new approval status
            setReviews(prev => prev.map(r => {
                if (r.review_id === review.review_id) {
                    return { ...r, is_approved: !r.is_approved };
                }
                return r;
            }));
            
            toast.success(`Đánh giá đã được ${review.is_approved ? 'hủy duyệt' : 'phê duyệt'}`);
        } catch (error) {
            console.error('Error toggling review approval:', error);
            toast.error('Lỗi khi cập nhật trạng thái đánh giá');
        } finally {
            setUpdatingApproval(null);
        }
    };

    const columns = [
        { header: 'Tên người đánh giá', accessor: 'username' },
        { 
            header: 'Loại đánh giá', 
            accessor: 'item_type',
            cell: (row) => (
                <span className={`item-type ${row.item_type}`}>
                    {row.item_type === 'product' ? 'Sản phẩm' : 'Thú cưng'}
                </span>
            )
        },
        { 
            header: 'Tên sản phẩm/thú cưng', 
            accessor: 'product_name',
            cell: (row) => (
                <span>
                    {row.item_type === 'product' ? row.product_name : row.pet_name}
                </span>
            )
        },
        { 
            header: 'Số sao', 
            accessor: 'rating',
            cell: (row) => (
                <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < row.rating ? "star filled" : "star"}>★</span>
                    ))}
                </div>
            )
        },
        { 
            header: 'Bình luận', 
            accessor: 'comment',
            style: { maxWidth: '250px', whiteSpace: 'normal' },
            cell: (row) => (
                <div className="review-comment-preview">
                    {row.comment.length > 100 
                        ? `${row.comment.substring(0, 100)}...` 
                        : row.comment
                    }
                </div>
            )
        },
        {
            header: 'Hình ảnh',
            accessor: 'review_images',
            cell: (row) => (
                <div className="review-image-preview">
                    {row.review_images && row.review_images.length > 0 ? (
                        <div className="image-thumbnails">
                            {row.review_images.slice(0, 2).map((image, index) => (
                                <img 
                                    key={index} 
                                    src={image.image_url} 
                                    alt="Review" 
                                    onClick={() => handleViewDetail(row)}
                                />
                            ))}
                            {row.review_images.length > 2 && (
                                <div className="more-images">+{row.review_images.length - 2}</div>
                            )}
                        </div>
                    ) : (
                        <span className="no-images">Không có</span>
                    )}
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessor: 'is_approved',
            cell: (row) => (
                <span className={`status-badge ${row.is_approved ? 'approved' : 'pending'}`}>
                    {row.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>
            )
        },
        {
            header: 'Ngày tạo',
            accessor: 'created_at',
            cell: (row) => (
                <span>{new Date(row.created_at).toLocaleDateString('vi-VN')}</span>
            )
        },
        {
            header: 'Thao tác',
            accessor: 'actions',
            cell: (row) => (
                <div className="action-buttons">
                    <button
                        className="btn-view"
                        onClick={() => handleViewDetail(row)}
                        title="Xem chi tiết"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        className={`btn-approval ${row.is_approved ? 'btn-unapprove' : 'btn-approve'}`}
                        onClick={() => handleToggleApproval(row)}
                        disabled={updatingApproval === row.review_id}
                        title={row.is_approved ? 'Hủy duyệt' : 'Phê duyệt'}
                    >
                        {updatingApproval === row.review_id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                            <i className={row.is_approved ? "fas fa-times-circle" : "fas fa-check-circle"}></i>
                        )}
                    </button>
                    <button
                        className="btn-delete"
                        onClick={() => handleDeleteClick(row)}
                        title="Xóa"
                    >
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="reviews-page page">
            <div className="page-header">
                <h1>Quản lý đánh giá</h1>
            </div>

            <div className="filters-container">
                <div className="filters">
                    <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="pending">Chờ duyệt</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Số sao:</label>
                        <select 
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                        </select>
                    </div>
                    
                    <div className="search-container">
                        <SearchBar
                            placeholder="Tìm kiếm theo người dùng, nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="filter-summary">
                    Hiển thị {reviews.length} trên tổng số {totalItems} đánh giá
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="no-data">
                    <i className="fas fa-search"></i>
                    <p>Không tìm thấy đánh giá nào phù hợp với tiêu chí tìm kiếm</p>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <Table
                            columns={columns}
                            data={reviews}
                        />
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {showDeleteModal && (
                <DeleteConfirmationModal
                    title="Xóa đánh giá"
                    message={`Bạn có chắc chắn muốn xóa đánh giá của "${reviewToDelete.username}"?`}
                    warningMessage="Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn đánh giá này khỏi hệ thống."
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {showDetailModal && selectedReview && (
                <DetailModal
                    title="Chi tiết đánh giá"
                    item={{
                        ...selectedReview,
                        item_type_display: selectedReview.item_type === 'product' ? 'Sản phẩm' : 'Thú cưng',
                        item_name: selectedReview.item_type === 'product' ? selectedReview.product_name : selectedReview.pet_name,
                        is_approved_display: selectedReview.is_approved ? 'Đã duyệt' : 'Chờ duyệt',
                        created_at_formatted: new Date(selectedReview.created_at).toLocaleString('vi-VN')
                    }}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
};

export default ReviewsPage;