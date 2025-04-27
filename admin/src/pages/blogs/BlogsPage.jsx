import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';
import blogService from '../../services/blogService';

const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const pageSize = 10;

    // State cho modal chi tiết
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);

    // Debounce cho tìm kiếm
    useEffect(() => {
        const timer = setTimeout(() => {
            loadBlogs();
        }, 500);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const loadBlogs = async () => {
        setLoading(true);
        try {
            const response = await blogService.fetchBlogs({
                page: currentPage,
                pageSize,
                searchTerm
            });

            setBlogs(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error loading brands:', error);
            toast.error('Không thể tải dữ liệu bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (brand) => {
        setBlogToDelete(brand);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await blogService.deleteBlog(blogToDelete.id);
            setShowDeleteModal(false);
            toast.success('Xóa bài viết thành công');
            loadBlogs();
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error(error.message || 'Lỗi khi xóa bài viết');
        }
    };

    const handleViewDetail = (brand) => {
        setSelectedBlog(brand);
        setShowDetailModal(true);
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Tên bài viết', accessor: 'title' },
        { header: 'Tên đoạn trích', accessor: 'excerpt' },
        { header: 'Slug', accessor: 'slug' },
        {
            header: 'Trạng thái',
            accessor: 'is_published',
            cell: (row) => (
                <div className="status-badges">
          <span className={`status-badge ${row.is_published ? 'active' : 'inactive'}`}>
            {row.is_published ? 'Xuất bản' : 'Không xuất bản'}
          </span>
                    {row.is_featured && (
                        <span className="status-badge featured">
              <i className="fas fa-star"></i> Nổi bật
            </span>
                    )}
                </div>
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
                    <Link to={`/blogs/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
                        <i className="fas fa-edit"></i>
                    </Link>
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
                <h1>Quản lý bài viết</h1>
                <Link to="/blogs/add" className="btn-add">
                    <i className="fas fa-plus"></i> Thêm blog mới
                </Link>
            </div>

            <div className="filters">
                <SearchBar
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                />
            </div>

            {loading ? (
                <div className="loading">Đang tải dữ liệu...</div>
            ) : blogs.length === 0 ? (
                <div className="no-data">Không tìm thấy bài viết nào</div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={blogs}
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
                    title="Xóa bài viết"
                    message={`Bạn có chắc chắn muốn xóa bài viết "${blogToDelete?.title}"?`}
                    warningMessage="Lưu ý: Việc xóa bài viết sẽ ảnh hưởng đến các sản phẩm thuộc bài viết này."
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {/* Detail modal */}
            {showDetailModal && selectedBlog && (
                <DetailModal
                    title={`Chi tiết bài viết: ${selectedBlog.title}`}
                    item={selectedBlog}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
};

export default BlogsPage;