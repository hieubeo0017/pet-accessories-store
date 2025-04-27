import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';
import userService from '../../services/userService';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
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
            loadUsers();
        }, 500);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.fetchUsers({
                page: currentPage,
                pageSize,
                searchTerm
            });

            setUsers(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Không thể tải dữ liệu người dùng');
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
            await userService.deleteUser(userToDelete.id);
            setShowDeleteModal(false);
            toast.success('Xóa người dùng thành công');
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Lỗi khi xóa người dùng');
        }
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Tên người dùng', accessor: 'username' },
        { header: 'email', accessor: 'email' },
        { header: 'Họ và tên', accessor: 'full_name' },
        { header: 'Số điện thoại', accessor: 'phone_number' },
        { header: 'Địa chỉ', accessor: 'address' },
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
                    <Link to={`/users/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
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
                <h1>Quản lý người dùng</h1>
                <Link to="/users/add" className="btn-add">
                    <i className="fas fa-plus"></i> Thêm người dùng mới
                </Link>
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
            ) : users.length === 0 ? (
                <div className="no-data">Không tìm thấy người dùng nào</div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={users}
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
                    title="Xóa người dùng"
                    message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.username}"?`}
                    warningMessage="Lưu ý: Việc xóa người dùng sẽ ảnh hưởng đến các sản phẩm thuộc người dùng này."
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {/* Detail modal */}
            {showDetailModal && selectedUser && (
                <DetailModal
                    title={`Chi tiết người dùng: ${selectedUser.username}`}
                    item={selectedUser}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
};

export default UsersPage;