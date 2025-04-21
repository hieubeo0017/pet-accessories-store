import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, deleteCategory } from '../../services/categoryService';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const pageSize = 10;
  
  useEffect(() => {
    loadCategories();
  }, [currentPage, searchTerm, filter]);
  
  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchCategories({
        page: currentPage,
        pageSize,
        searchTerm,
        filter: filter === 'all' ? null : filter
      });
      
      setCategories(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      toast.error('Không thể tải danh mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(categoryToDelete.id);
      setShowDeleteModal(false);
      toast.success('Xóa danh mục thành công');
      loadCategories();
    } catch (error) {
      console.error('Lỗi xóa danh mục:', error);
      setError(error.message);
      toast.error('Lỗi khi xóa danh mục: ' + error.message);
    }
  };
  
  const handleViewDetail = (category) => {
    setSelectedCategory(category);
    setShowDetailModal(true);
  };
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Tên danh mục', accessor: 'name' },
    { 
      header: 'Loại danh mục', 
      accessor: 'type',
      cell: (row) => {
        switch (row.type) {
          case 'pet': return 'Thú cưng';
          case 'food': return 'Thức ăn';
          case 'accessory': return 'Phụ kiện';
          default: return row.type;
        }
      }
    },
    { header: 'Đường dẫn', accessor: 'slug' },
    { 
      header: 'Trạng thái', 
      accessor: 'is_active',
      cell: (row) => (
        <span className={`status-badge ${row.is_active ? 'active' : 'inactive'}`}>
          {row.is_active ? 'Hiển thị' : 'Ẩn'}
        </span>
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
          <Link to={`/categories/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
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
    <div className="category-management page">
      <div className="page-header">
        <h1>Quản lý danh mục</h1>
        <Link to="/categories/add" className="btn-add">
          <i className="fas fa-plus"></i> Thêm danh mục mới
        </Link>
      </div>
      
      <div className="filters">
        <SearchBar 
          placeholder="Tìm kiếm danh mục..." 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-btn ${filter === 'pet' ? 'active' : ''}`}
            onClick={() => setFilter('pet')}
          >
            Thú cưng
          </button>
          <button 
            className={`filter-btn ${filter === 'food' ? 'active' : ''}`}
            onClick={() => setFilter('food')}
          >
            Thức ăn
          </button>
          <button 
            className={`filter-btn ${filter === 'accessory' ? 'active' : ''}`}
            onClick={() => setFilter('accessory')}
          >
            Phụ kiện
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : categories.length === 0 ? (
        <div className="no-data">Không tìm thấy danh mục nào</div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={categories} 
          />
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      
      {showDeleteModal && (
        <DeleteConfirmationModal 
          title="Xóa danh mục"
          message={`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete?.name}"?`}
          warningMessage="Lưu ý: Việc xóa danh mục sẽ ảnh hưởng đến các sản phẩm thuộc danh mục này."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        /> 
      )}

      {showDetailModal && selectedCategory && (
        <DetailModal
          title={`Chi tiết danh mục: ${selectedCategory.name}`}
          item={selectedCategory}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default CategoriesPage;