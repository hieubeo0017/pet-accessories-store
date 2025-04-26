import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';
import { fetchSpaServices, deleteSpaService } from '../../services/spaService';

const SpaServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [isFeaturedFilter, setIsFeaturedFilter] = useState('all');
  const [sortOption, setSortOption] = useState('id_desc');
  
  const pageSize = 10;
  
  useEffect(() => {
    loadServices();
  }, [currentPage, searchTerm, filter, isActiveFilter, isFeaturedFilter, sortOption]);
  
  const loadServices = async () => {
    try {
      setLoading(true);
      
      const [sort_by, sort_order] = sortOption.split('_');
      
      const params = {
        page: currentPage,
        pageSize: pageSize,
        searchTerm: searchTerm,
        pet_type: filter !== 'all' ? filter : '',
        is_active: isActiveFilter !== 'all' ? isActiveFilter === 'active' : undefined,
        is_featured: isFeaturedFilter !== 'all' ? isFeaturedFilter === 'featured' : undefined,
        sort_by,
        sort_order
      };
      
      const result = await fetchSpaServices(params);
      
      // Kiểm tra dữ liệu trả về
      if (Array.isArray(result.data)) {
        setServices(result.data);
      } else {
        console.error('Dữ liệu không đúng định dạng:', result);
        setServices([]);
      }
      
      // Sửa lại phần này để truy cập đúng vào thông tin phân trang
      if (result.pagination && !isNaN(result.pagination.totalPages)) {
        setTotalPages(result.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Không thể tải danh sách dịch vụ spa');
      setServices([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await deleteSpaService(serviceToDelete.id);
      toast.success('Xóa dịch vụ spa thành công');
      setShowDeleteModal(false);
      loadServices();
    } catch (error) {
      console.error('Error deleting spa service:', error);
      
      if (error.response?.data?.inUse) {
        toast.warning(error.response?.data?.message || 'Dịch vụ đang được sử dụng, đã chuyển sang trạng thái không hoạt động');
      } else {
        toast.error('Lỗi khi xóa dịch vụ spa');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetail = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setIsActiveFilter('all');
    setIsFeaturedFilter('all');
    setSortOption('id_desc');
    setCurrentPage(1);
  };
  
  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      width: '120px',
      noWrap: true
    },
    { 
      header: 'Tên dịch vụ', 
      accessor: 'name',
      noWrap: true
    },
    { 
      header: 'Loại thú cưng', 
      accessor: 'pet_type',
      noWrap: true,
      cell: (row) => {
        switch(row.pet_type) {
          case 'dog': return 'Chó';
          case 'cat': return 'Mèo';
          case 'all': return 'Tất cả';
          default: return row.pet_type;
        }
      }
    },
    { 
      header: 'Kích thước', 
      accessor: 'pet_size',
      noWrap: true,
      cell: (row) => {
        switch(row.pet_size) {
          case 'small': return 'Nhỏ';
          case 'medium': return 'Vừa';
          case 'large': return 'Lớn';
          case 'all': return 'Tất cả';
          default: return row.pet_size;
        }
      }
    },
    { 
      header: 'Giá', 
      accessor: 'price',
      noWrap: true,
      cell: (row) => `${formatCurrency(row.price)} đ`
    },
    { 
      header: 'Thời gian (phút)', 
      accessor: 'duration',
      noWrap: true,
      cell: (row) => (
        <span className="duration-value">
          {row.duration} <span className="duration-unit">phút</span>
        </span>
      ),
      width: '130px'
    },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      noWrap: true,
      cell: (row) => (
        <div className="status-badges">
          <span className={`status-badge ${row.is_active ? 'active' : 'inactive'}`}>
            {row.is_active ? 'Đang hiển thị' : 'Ẩn'}
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
      width: '120px',
      noWrap: true,
      cell: (row) => (
        <div className="action-buttons">
          <button 
            className="btn-view"
            onClick={() => handleViewDetail(row)}
            title="Xem chi tiết"
          >
            <i className="fas fa-eye"></i>
          </button>
          <Link to={`/spa-services/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
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
    <div className="spa-services-management page">
      <div className="page-header">
        <h1>Quản lý dịch vụ spa</h1>
        <Link to="/spa-services/add" className="btn-add">
          <i className="fas fa-plus"></i> Thêm dịch vụ mới
        </Link>
      </div>
      
      <div className="filters">
        <SearchBar 
          placeholder="Tìm kiếm dịch vụ..." 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        
        <div className="filter-actions">
          <select 
            className="filter-select" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả loại thú</option>
            <option value="dog">Chó</option>
            <option value="cat">Mèo</option>
          </select>
          
          <select 
            className="filter-select" 
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đã ẩn</option>
          </select>
          
          <select 
            className="filter-select" 
            value={isFeaturedFilter}
            onChange={(e) => setIsFeaturedFilter(e.target.value)}
          >
            <option value="all">Tất cả dịch vụ</option>
            <option value="featured">Dịch vụ nổi bật</option>
            <option value="not_featured">Dịch vụ thường</option>
          </select>
          
          <select 
            className="filter-select" 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="id_desc">Mới nhất</option>
            <option value="id_asc">Cũ nhất</option>
            <option value="price_asc">Giá: Thấp → Cao</option>
            <option value="price_desc">Giá: Cao → Thấp</option>
            <option value="name_asc">Tên: A → Z</option>
            <option value="name_desc">Tên: Z → A</option>
            <option value="duration_asc">Thời gian: Ngắn → Dài</option>
            <option value="duration_desc">Thời gian: Dài → Ngắn</option>
          </select>
          
          <button 
            className="btn-reset-filter" 
            onClick={resetFilters}
            title="Xóa bộ lọc"
          >
            <i className="fas fa-times"></i> Xóa bộ lọc
          </button>
        </div>
      </div>
      
      <div className="active-filters">
        {(filter !== 'all' || isActiveFilter !== 'all' || isFeaturedFilter !== 'all' || searchTerm) && (
          <div className="applied-filters">
            <span>Bộ lọc đang dùng: </span>
            {searchTerm && <span className="filter-tag">Tìm kiếm: "{searchTerm}"</span>}
            {filter !== 'all' && (
              <span className="filter-tag">
                Loại thú: {filter === 'dog' ? 'Chó' : 'Mèo'}
              </span>
            )}
            {isActiveFilter !== 'all' && (
              <span className="filter-tag">
                Trạng thái: {isActiveFilter === 'active' ? 'Đang hiển thị' : 'Đã ẩn'}
              </span>
            )}
            {isFeaturedFilter !== 'all' && (
              <span className="filter-tag">
                {isFeaturedFilter === 'featured' ? 'Dịch vụ nổi bật' : 'Dịch vụ thường'}
              </span>
            )}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : services.length === 0 ? (
        <div className="no-data">Không tìm thấy dịch vụ nào</div>
      ) : (
        <>
          <div className="results-info">
            <p>Hiển thị {services.length} dịch vụ</p>
          </div>
          
          <Table 
            columns={columns} 
            data={services} 
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
          title="Xóa dịch vụ spa"
          message={`Bạn có chắc chắn muốn xóa dịch vụ "${serviceToDelete?.name}"?`}
          warningMessage="Lưu ý: Việc xóa dịch vụ có thể ảnh hưởng đến các lịch hẹn hiện tại và dữ liệu liên quan."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showDetailModal && selectedService && (
        <DetailModal
          title={`Chi tiết dịch vụ: ${selectedService.name}`}
          item={selectedService}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default SpaServicesPage;