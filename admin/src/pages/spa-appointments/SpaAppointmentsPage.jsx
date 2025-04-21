import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { mockSpaAppointments } from '../../services/spaAppointmentService';
import './SpaAppointments.css';

const SpaAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const pageSize = 10;
  
  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    setTimeout(() => {
      // Filter and search mock data
      let filteredAppointments = [...mockSpaAppointments];
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredAppointments = filteredAppointments.filter(app => 
          app.full_name.toLowerCase().includes(term) || 
          app.phone_number.includes(term) ||
          app.pet_name.toLowerCase().includes(term)
        );
      }
      
      if (statusFilter !== 'all') {
        filteredAppointments = filteredAppointments.filter(app => 
          app.status === statusFilter
        );
      }
      
      if (dateFilter.from) {
        filteredAppointments = filteredAppointments.filter(app => 
          app.appointment_date >= dateFilter.from
        );
      }
      
      if (dateFilter.to) {
        filteredAppointments = filteredAppointments.filter(app => 
          app.appointment_date <= dateFilter.to
        );
      }
      
      setAppointments(filteredAppointments);
      setTotalPages(Math.ceil(filteredAppointments.length / pageSize));
      setLoading(false);
    }, 500); // Simulating network delay
  }, [currentPage, searchTerm, statusFilter, dateFilter]);
  
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter({ from: '', to: '' });
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
  
  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      width: '120px',
      noWrap: true
    },
    { header: 'Khách hàng', accessor: 'full_name' },
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
        <div className="action-buttons">
          <Link to={`/spa-appointments/${row.id}`} className="btn-view" title="Xem chi tiết">
            <i className="fas fa-eye"></i>
          </Link>
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
            onChange={setSearchTerm}
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
              <input 
                type="date" 
                value={dateFilter.from} 
                onChange={(e) => handleDateFilterChange('from', e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label>Đến ngày:</label>
              <input 
                type="date" 
                value={dateFilter.to} 
                onChange={(e) => handleDateFilterChange('to', e.target.value)}
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
    </div>
  );
};

export default SpaAppointmentsPage;