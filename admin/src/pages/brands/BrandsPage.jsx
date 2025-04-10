import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBrands, deleteBrand } from '../../services/brandService';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const pageSize = 10;
  
  useEffect(() => {
    loadBrands();
  }, [currentPage, searchTerm]); // Thêm dependencies
  
  const loadBrands = async () => {
    setLoading(true);
    try {
      // Cập nhật API call để hỗ trợ phân trang
      const response = await fetchBrands({
        page: currentPage,
        pageSize,
        searchTerm
      });
      
      setBrands(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (brand) => {
    setBrandToDelete(brand);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteBrand(brandToDelete.id);
      setShowDeleteModal(false);
      loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };
  
  // Dữ liệu được lọc từ API nên không cần lọc lại ở frontend
  const filteredBrands = brands;
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Logo', 
      accessor: 'logo',
      cell: (row) => (
        <img 
          src={row.logo} 
          alt={row.name}
          className="brand-logo" 
        />
      )
    },
    { header: 'Tên thương hiệu', accessor: 'name' },
    { header: 'Website', accessor: 'website' },
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
          <Link to={`/brands/edit/${row.id}`} className="btn-edit">
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
    <div className="brand-management page">
      <div className="page-header">
        <h1>Quản lý thương hiệu</h1>
        <Link to="/brands/add" className="btn-add">
          <i className="fas fa-plus"></i> Thêm thương hiệu mới
        </Link>
      </div>
      
      <div className="filters">
        <SearchBar 
          placeholder="Tìm kiếm thương hiệu..." 
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : filteredBrands.length === 0 ? (
        <div className="no-data">Không tìm thấy thương hiệu nào</div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={filteredBrands} 
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
          title="Xóa thương hiệu"
          message={`Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete?.name}"?`}
          warningMessage="Lưu ý: Việc xóa thương hiệu sẽ ảnh hưởng đến các sản phẩm thuộc thương hiệu này."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default BrandsPage;