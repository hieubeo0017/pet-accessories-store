import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';
import userService from '../../services/userService';

const ReviewsPage = () => {
    const [reviews, setReview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const pageSize = 10;

    // State cho modal chi tiết
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Debounce cho tìm kiếm
    useEffect(() => {
        const timer = setTimeout(() => {
            loadReviews();
        }, 500);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const response = await userService.fetchReviews({
                page: currentPage,
                pageSize,
                searchTerm
            });

            setReview(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast.error('Không thể tải dữ liệu đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await userService.deleteReview(userToDelete.review_id);
            setShowDeleteModal(false);
            toast.success('Xóa đánh giá thành công');
            loadReviews();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Lỗi khi xóa đánh giá');
        }
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const columns = [
        { header: 'Tên người đánh giá', accessor: 'username' },
        { header: 'Loại đánh giá', accessor: 'item_type' },
        { header: 'Tên sản phẩm', accessor: 'product_name' },
        { header: 'Số sao', accessor: 'rating' },
        { header: 'Bình luận', accessor: 'comment' },
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
        <div className="brand-management page">
            <div className="page-header">
                <h1>Quản lý đánh giá</h1>
            </div>

            <div className="filters">
                <SearchBar
                    placeholder="Tìm kiếm thông tin..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                />
            </div>

            {loading ? (
                <div className="loading">Đang tải dữ liệu...</div>
            ) : reviews.length === 0 ? (
                <div className="no-data">Không tìm thấy đánh giá nào</div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={reviews}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    title="Xóa đánh giá"
                    message={`Bạn có chắc chắn muốn xóa đánh giá "${userToDelete?.username}"?`}
                    warningMessage="Lưu ý: Việc xóa đánh giá sẽ ảnh hưởng đến các sản phẩm thuộc đánh giá này."
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {/* Detail modal */}
            {showDetailModal && selectedUser && (
                <DetailModal
                    title={`Chi tiết đánh giá: ${selectedUser.username}`}
                    item={selectedUser}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
};

export default ReviewsPage;