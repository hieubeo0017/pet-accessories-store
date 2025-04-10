import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, deleteCategory } from '../../services/categoryService';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const pageSize = 10;
  
  useEffect(() => {
    loadCategories();
  }, [currentPage, searchTerm, filter]); // Thêm dependencies
  
  const loadCategories = async () => {
    setLoading(true);
    try {
      // Cập nhật API call để hỗ trợ phân trang
      const response = await fetchCategories({
        page: currentPage,
        pageSize,
        searchTerm,
        filter: filter !== 'all' ? filter : null
      });
      
      setCategories(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('Error loading categories:', error);
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
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  // Dữ liệu được lọc từ API nên không cần lọc lại ở frontend
  const filteredCategories = categories;
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Hình ảnh', 
      accessor: 'image_url',
      cell: (row) => row.image_url ? (
        <img 
          src={row.image_url} 
          alt={row.name}
          className="category-thumbnail" 
        />
      ) : <span className="no-image">Không có ảnh</span>
    },
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
          <Link to={`/categories/edit/${row.id}`} className="btn-edit">
            <i className="fas fa-edit"></i>
          </Link>
          <button 
            className="btn-delete"
            onClick={() => handleDeleteClick(row)}
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
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="no-data">Không tìm thấy danh mục nào</div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={filteredCategories} 
          />
          
          {/* Thêm phân trang */}
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
    </div>
  );
};

export default CategoriesPage;