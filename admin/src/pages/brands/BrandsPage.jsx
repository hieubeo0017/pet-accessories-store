import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBrands, deleteBrand } from '../../services/brandService';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const pageSize = 10;

  // State cho modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Debounce cho tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBrands();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);
  
  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await fetchBrands({
        page: currentPage,
        pageSize,
        searchTerm
      });
      
      console.log("Brands data:", response.data); 
      console.log("Featured status:", response.data.map(b => ({
        id: b.id, 
        name: b.name, 
        is_featured: b.is_featured
      })));
      
      setBrands(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Không thể tải dữ liệu thương hiệu');
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
      toast.success('Xóa thương hiệu thành công');
      loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error(error.message || 'Lỗi khi xóa thương hiệu');
    }
  };

  const handleViewDetail = (brand) => {
    setSelectedBrand(brand);
    setShowDetailModal(true);
  };
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Logo', 
      accessor: 'logo',
      cell: (row) => (
        <img src={row.logo} alt={row.name} className="brand-logo" />
      )
    },
    { header: 'Tên thương hiệu', accessor: 'name' },
    { header: 'Website', accessor: 'website', cell: (row) => (
      row.website ? <a href={row.website} target="_blank" rel="noopener noreferrer">{row.website}</a> : '-'
    )},
    { 
      header: 'Trạng thái', 
      accessor: 'is_active',
      cell: (row) => (
        <div className="status-badges">
          <span className={`status-badge ${row.is_active ? 'active' : 'inactive'}`}>
            {row.is_active ? 'Hiển thị' : 'Ẩn'}
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
          <Link to={`/brands/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
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
      ) : brands.length === 0 ? (
        <div className="no-data">Không tìm thấy thương hiệu nào</div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={brands} 
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
          title="Xóa thương hiệu"
          message={`Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete?.name}"?`}
          warningMessage="Lưu ý: Việc xóa thương hiệu sẽ ảnh hưởng đến các sản phẩm thuộc thương hiệu này."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Detail modal */}
      {showDetailModal && selectedBrand && (
        <DetailModal
          title={`Chi tiết thương hiệu: ${selectedBrand.name}`}
          item={selectedBrand}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default BrandsPage;