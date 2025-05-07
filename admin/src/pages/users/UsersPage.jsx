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

    // Thêm hàm normalizeText vào đầu component
    const normalizeText = (text) => {
        if (typeof text !== 'string') return text;
        return text.normalize('NFC');
    };

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
        { 
            header: 'ID', 
            accessor: 'id',
            style: { whiteSpace: 'nowrap', maxWidth: '50px' }  // Giảm xuống từ 60px
        },
        { 
            header: 'Tên người dùng', 
            accessor: 'username',
            style: { whiteSpace: 'nowrap', maxWidth: '130px' }, // Giảm xuống từ 150px
            cell: (row) => normalizeText(row.username)
        },
        { 
            header: 'Email', 
            accessor: 'email',
            style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' } // Giảm từ 180px
        },
        { 
            header: 'Họ và tên', 
            accessor: 'full_name',
            style: { whiteSpace: 'nowrap', maxWidth: '250px' }, // Tăng từ 200px lên 250px
            cell: (row) => normalizeText(row.full_name)
        },
        { 
            header: 'Số điện thoại', 
            accessor: 'phone_number',
            style: { whiteSpace: 'nowrap', maxWidth: '110px' }  // Giảm từ 130px
        },
        { 
            header: 'Vai trò', 
            accessor: 'role',
            style: { whiteSpace: 'nowrap', maxWidth: '80px' },  // Giảm từ 100px
            cell: (row) => (
                <span className={`role-badge ${row.role?.toLowerCase() || 'user'}`}>
                    {row.role || 'User'}
                </span>
            )
        },
        // Thao tác giữ nguyên
        {
            header: 'Thao tác',
            accessor: 'actions',
            style: { whiteSpace: 'nowrap', width: '120px' },
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

    const tableStyles = `
      .table-container {
        width: 100%;
        overflow-x: auto;
      }
      
      table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
      }
      
      th, td {
        padding: 12px 15px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .role-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      
      .role-badge.admin {
        background-color: #f8d7da;
        color: #721c24;
      }
      
      .role-badge.user {
        background-color: #d1ecf1;
        color: #0c5460;
      }
      
      .role-badge.editor {
        background-color: #d4edda;
        color: #155724;
      }
    `;

    return (
        <div className="brand-management page">
            <style>{tableStyles}</style>
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