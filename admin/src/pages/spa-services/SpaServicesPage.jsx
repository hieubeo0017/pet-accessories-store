import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';
import { mockSpaServices } from '../../services/spaService';
import './SpaServices.css';

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
  
  const pageSize = 10;
  
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredServices = [...mockSpaServices];
      
      if (searchTerm) {
        filteredServices = filteredServices.filter(service => 
          service.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (filter !== 'all') {
        filteredServices = filteredServices.filter(service => 
          service.pet_type === filter || service.pet_type === 'all'
        );
      }
      
      setServices(filteredServices);
      setTotalPages(Math.ceil(filteredServices.length / pageSize));
      setLoading(false);
    }, 500);
  }, [currentPage, searchTerm, filter]);
  
  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      toast.success('Xóa dịch vụ spa thành công');
      setShowDeleteModal(false);
      setServices(services.filter(s => s.id !== serviceToDelete.id));
    } catch (error) {
      console.error('Error deleting spa service:', error);
      toast.error('Lỗi khi xóa dịch vụ spa');
    }
  };
  
  const handleViewDetail = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };
  
  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      width: '120px',
      noWrap: true
    },
    { header: 'Tên dịch vụ', accessor: 'name' },
    { 
      header: 'Loại thú cưng', 
      accessor: 'pet_type',
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
      cell: (row) => `${formatCurrency(row.price)} đ`
    },
    { 
      header: 'Thời gian (phút)', 
      accessor: 'duration',
    },
    { 
      header: 'Trạng thái', 
      accessor: 'is_active',
      cell: (row) => (
        <div className="status-badges">
          <span className={`status-badge ${row.is_active ? 'active' : 'inactive'}`}>
            {row.is_active ? 'Hiện' : 'Ẩn'}
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
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : services.length === 0 ? (
        <div className="no-data">Không tìm thấy dịch vụ nào</div>
      ) : (
        <>
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