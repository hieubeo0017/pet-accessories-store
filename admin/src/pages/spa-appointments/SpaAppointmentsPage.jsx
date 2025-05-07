import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { toast } from 'react-toastify';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { fetchAppointments, deleteAppointment, restoreAppointment } from '../../services/spaAppointmentService';
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import './SpaAppointments.css';

// Đăng ký locale tiếng Việt
registerLocale("vi", vi);

const SpaAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    from: null,
    to: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  
  const pageSize = 10;
  
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        sort_by: 'id',
        sort_order: 'desc'
      };

      if (searchTerm && searchTerm.trim() !== '') {
        // Xử lý searchTerm để tìm kiếm được chính xác hơn
        params.search = searchTerm.trim();
        
        // Kiểm tra nếu searchTerm chứa chỉ số, có thể là số điện thoại
        // Loại bỏ các ký tự không phải số nếu người dùng nhập số điện thoại có dấu cách
        if (/^\d[\d\s-]*$/.test(searchTerm)) {
          params.search = searchTerm.replace(/\D/g, '');
        }
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (dateFilter.from) {
        params.from_date = dateFilter.from.toISOString().split('T')[0];
      }
      if (dateFilter.to) {
        params.to_date = dateFilter.to.toISOString().split('T')[0];
      }

      const result = await fetchAppointments(params);
      
      setAppointments(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error loading spa appointments:', err);
      setError('Lỗi khi tải dữ liệu lịch hẹn');
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAppointments();
  }, [currentPage, searchTerm, statusFilter, dateFilter]);
  
  const handleDateFilterChange = (field, date) => {
    console.log(`Setting ${field} date before adjustment:`, date);
    
    let adjustedDate = date;
    
    if (date) {
      // Tạo ngày mới và đặt giờ để tránh vấn đề múi giờ
      adjustedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      
      // Nếu là ngày kết thúc, cộng thêm 1 ngày rồi trừ 1 millisecond để lấy cuối ngày
      if (field === 'to') {
        // Không cần điều chỉnh ngày kết thúc nữa
      }
    }
    
    console.log(`Setting ${field} date after adjustment:`, adjustedDate);
    
    setDateFilter(prev => ({
      ...prev,
      [field]: adjustedDate
    }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter({ from: null, to: null });
    setCurrentPage(1);
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;
    
    try {
      setLoading(true);
      await deleteAppointment(appointmentToDelete.id);
      toast.success(`Đã xóa lịch hẹn #${appointmentToDelete.id} thành công`);
      
      await loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa lịch hẹn');
    } finally {
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  };

  const handleRestoreClick = async (appointment) => {
    try {
      const result = await restoreAppointment(appointment.id);
      toast.success(`Đã khôi phục lịch hẹn #${appointment.id} thành công`);
      await loadAppointments();
    } catch (error) {
      console.error(`Error restoring appointment #${appointment.id}:`, error);
      toast.error(error.response?.data?.message || 'Lỗi khi khôi phục lịch hẹn');
    }
  };
  
  const handleSearch = (value) => {
    // Đặt lại trang về 1 khi thực hiện tìm kiếm mới
    setCurrentPage(1);
    setSearchTerm(value);
  };

  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      width: '120px',
      noWrap: true
    },
    { 
      header: 'Khách hàng', 
      accessor: 'full_name',
      width: '150px', // Thêm chiều rộng cố định
      noWrap: true,   // Thêm thuộc tính không xuống dòng
      cell: (row) => (
        <div className="customer-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.full_name}
        </div>
      )
    },
    { header: 'Liên hệ', 
      accessor: 'phone_number',
      cell: (row) => (
        <div>
          <div>{row.phone_number}</div>
          {row.email && <div className="small">{row.email}</div>}
        </div>
      )
    },
    { 
      header: 'Thời gian', 
      accessor: 'appointment_date',
      cell: (row) => (
        <div>
          <div>{formatDate(row.appointment_date)}</div>
          <div className="small">{formatTime(row.appointment_time)}</div>
        </div>
      )
    },
    {
      header: 'Thú cưng',
      accessor: 'pet_name',
      cell: (row) => (
        <div>
          <div>{row.pet_name}</div>
          <div className="small">
            {row.pet_type === 'dog' ? 'Chó' : 'Mèo'}
            {row.pet_breed ? ` - ${row.pet_breed}` : ''}
          </div>
        </div>
      )
    },
    { 
      header: 'Tổng tiền', 
      accessor: 'total_amount',
      cell: (row) => (
        <span className="currency-value">{formatCurrency(row.total_amount)}&nbsp;đ</span>
      )
    },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      cell: (row) => (
        <div className="status-container">
          <span className={`status-badge ${getStatusClass(row.status)}`}>
            {getStatusText(row.status)}
          </span>
          <span className={`status-badge ${row.payment_status === 'paid' ? 'status-completed' : 'status-pending'}`}>
            {row.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </span>
        </div>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      cell: (row) => (
        <div className="table-actions">
          <Link to={`/spa-appointments/${row.id}`} className="btn-view" title="Chi tiết">
            <i className="fas fa-eye"></i>
          </Link>
          <Link to={`/spa-appointments/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
            <i className="fas fa-edit"></i>
          </Link>
          <button 
            className="btn-delete" 
            title="Xóa lịch hẹn" 
            onClick={() => handleDeleteClick(row)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
          {row.status === 'cancelled' && (
            <button
              className="btn-restore"
              title="Khôi phục lịch hẹn"
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreClick(row);
              }}
            >
              <i className="fas fa-undo"></i>
            </button>
          )}
        </div>
      )
    }
  ];
  
  return (
    <div className="spa-appointments-management page">
      <div className="page-header">
        <h1>Quản lý lịch hẹn spa</h1>
        <Link to="/spa-appointments/add" className="btn-add">
          <i className="fas fa-plus"></i> Thêm lịch hẹn mới
        </Link>
      </div>
      
      <div className="spa-appointment-filters">
        <div className="filter-row">
          <SearchBar 
            placeholder="Tìm theo tên khách hàng, điện thoại..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          
          <div className="filter-control">
            <select 
              className="status-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="date-range">
            <div className="date-input-group">
              <label>Từ ngày:</label>
              <DatePicker
                selected={dateFilter.from}
                onChange={date => handleDateFilterChange('from', date)}
                locale="vi"
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="date-picker"
                isClearable
              />
            </div>
            <div className="date-input-group">
              <label>Đến ngày:</label>
              <DatePicker
                selected={dateFilter.to} 
                onChange={date => handleDateFilterChange('to', date)}
                locale="vi"
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="date-picker"
                isClearable
              />
            </div>
          </div>
          
          <button className="clear-filters-btn" onClick={clearFilters}>
            <i className="fas fa-times"></i> Xóa bộ lọc
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="no-data">Không tìm thấy lịch hẹn nào</div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={appointments} 
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
          title="Xóa lịch hẹn"
          message={`Bạn có chắc chắn muốn xóa lịch hẹn #${appointmentToDelete?.id} của khách hàng ${appointmentToDelete?.full_name} không?`}
          warningMessage="Lưu ý: Việc xóa lịch hẹn sẽ ảnh hưởng đến dữ liệu thống kê và lịch sử dịch vụ. Nếu lịch hẹn đã được thanh toán hoặc đã hoàn thành, bạn nên đánh dấu là đã hủy thay vì xóa."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
};

export default SpaAppointmentsPage;