import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import TimeSlotForm from '../../components/spa-time-slots/TimeSlotForm';
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import { 
  fetchTimeSlotsWithPagination, 
  createTimeSlot, 
  updateTimeSlot, 
  deleteTimeSlot,
  checkTimeSlotAvailability 
} from '../../services/spaTimeSlotService';
import { formatTime } from '../../utils/formatters';
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

// Đăng ký locale tiếng Việt
registerLocale("vi", vi);

const SpaTimeSlotsPage = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Thông tin phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Trạng thái filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('time_slot_asc');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Availability check
  const [checkDate, setCheckDate] = useState('');
  const [availabilityData, setAvailabilityData] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  useEffect(() => {
    loadTimeSlots();
  }, [currentPage, searchTerm, statusFilter, sortOption]);
  
  const loadTimeSlots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Chuẩn bị tham số cho API
      let sort_by, sort_order;
      if (sortOption === 'time_slot_asc' || sortOption === 'time_slot_desc') {
        sort_by = 'time_slot';
        sort_order = sortOption === 'time_slot_asc' ? 'asc' : 'desc';
      } else if (sortOption === 'max_capacity_asc' || sortOption === 'max_capacity_desc') {
        sort_by = 'max_capacity';
        sort_order = sortOption === 'max_capacity_asc' ? 'asc' : 'desc';
      } else {
        // Fallback
        sort_by = 'time_slot';
        sort_order = 'asc';
      }
      
      const params = {
        page: currentPage,
        limit: 10,
        sort_by,
        sort_order
      };
      
      // Thêm filter trạng thái nếu có
      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }
      
      // Thêm searchTerm với xử lý chuẩn hơn
      if (searchTerm && searchTerm.trim() !== '') {
        const timeRegex = /^([0-9][0-9]):([0-5][0-9])$/;
        if (timeRegex.test(searchTerm)) {
          // Đặt đúng định dạng để tìm kiếm thời gian
          params.search = searchTerm;
          console.log('Đang tìm kiếm với khung giờ:', params.search);
        } else {
          // Tìm kiếm thông thường
          params.search = searchTerm.trim();
          console.log('Đang tìm kiếm với từ khóa:', params.search);
        }
      }
      
      const result = await fetchTimeSlotsWithPagination(params);
      
      setTimeSlots(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setError('Lỗi khi tải danh sách khung giờ');
      toast.error('Không thể tải danh sách khung giờ');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTimeSlot = async (timeSlotData) => {
    await createTimeSlot(timeSlotData);
    loadTimeSlots();
  };
  
  const handleUpdateTimeSlot = async (timeSlotData) => {
    if (!selectedTimeSlot) return;
    
    await updateTimeSlot(selectedTimeSlot.id, timeSlotData);
    loadTimeSlots();
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedTimeSlot) return;
    
    setDeleteLoading(true);
    try {
      await deleteTimeSlot(selectedTimeSlot.id);
      toast.success('Xóa khung giờ thành công');
      loadTimeSlots();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Không thể xóa khung giờ');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleEditClick = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowDeleteModal(true);
  };
  
  const handleCheckAvailability = async () => {
    if (!selectedDate) {
      toast.error('Vui lòng chọn ngày cần kiểm tra');
      return;
    }
    
    setCheckingAvailability(true);
    try {
      // Phương pháp 1: Dùng hàm format thủ công để tránh vấn đề múi giờ
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Phương pháp 2 (thay thế): Sử dụng UTC methods
      // const formattedDate = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(selectedDate.getUTCDate()).padStart(2, '0')}`;
      
      console.log('Đã chọn ngày:', selectedDate);
      console.log('Ngày gửi đến API:', formattedDate);
      
      const result = await checkTimeSlotAvailability(formattedDate);
      setAvailabilityData(result.data);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Không thể kiểm tra khả dụng');
    } finally {
      setCheckingAvailability(false);
    }
  };
  
  const mapTimeKeyToDisplay = (timeKey) => {
    // Nếu timeKey đã là định dạng giờ (09:00, 10:00, ...) thì giữ nguyên
    if (timeKey.includes(':')) {
      return timeKey;
    }
    
    // Map các key tiếng Anh sang tiếng Việt hoặc khung giờ tương ứng
    const timeMap = {
      'Thu J': '09:00',
      'Fri J': '10:00',
      'Mon M': '11:00',
      'Tue M': '14:00',
      'Wed M': '15:00',
      'Thu M': '16:00',
      'Fri M': '17:00'
      // Thêm các mapping khác nếu cần
    };
    
    return timeMap[timeKey] || timeKey; // Trả về giá trị đã map hoặc giữ nguyên nếu không tìm thấy
  };
  
  // Thêm hàm xử lý tìm kiếm riêng biệt - cải tiến
  const handleSearch = (value) => {
    // Reset về trang 1 khi thực hiện tìm kiếm mới
    setCurrentPage(1);
    
    // Xử lý đặc biệt cho định dạng thời gian
    let searchValue = value.trim();
    
    // Kiểm tra nếu đang tìm theo định dạng thời gian (HH:MM hoặc H:MM)
    const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(searchValue)) {
      // Định dạng lại để đảm bảo có dạng HH:MM
      const parts = searchValue.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1];
      searchValue = `${hours}:${minutes}`;
      
      console.log('Đang tìm kiếm theo khung giờ:', searchValue);
    }
    
    setSearchTerm(searchValue);
  };

  // Định nghĩa cấu trúc cột cho bảng
  const columns = [
    {
      header: 'KHUNG GIỜ',
      accessor: 'time_slot',
      cell: (row) => formatTime(row.time_slot),
      width: '25%'
    },
    {
      header: 'SỐ CHỖ TỐI ĐA',
      accessor: 'max_capacity',
      width: '25%',
      align: 'center'
    },
    {
      header: 'TRẠNG THÁI',
      accessor: 'is_active',
      cell: (row) => (
        <span className={`status-badge ${row.is_active ? 'active' : 'inactive'}`}>
          {row.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
        </span>
      ),
      width: '25%',
      align: 'center'
    },
    {
      header: 'THAO TÁC',
      accessor: 'actions',
      cell: (row) => (
        <div className="table-actions" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            className="btn-edit"
            title="Chỉnh sửa"
            onClick={() => handleEditClick(row)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn-delete"
            title="Xóa"
            onClick={() => handleDeleteClick(row)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      ),
      width: '25%',
      align: 'center'
    }
  ];
  
  
  
  return (
    <div className="page">
      <div className="page-header">
        <h1>Quản lý khung giờ Spa</h1>
        <button 
          className="btn-add"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus"></i> Thêm khung giờ mới
        </button>
      </div>
      
      <div className="filter-container">
        <div className="filters">
          <SearchBar
            placeholder="Tìm kiếm khung giờ..."
            value={searchTerm}
            onChange={handleSearch} // Sử dụng hàm xử lý mới
          />
          
          <div className="filter-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select
              className="filter-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="time_slot_asc">Giờ (tăng dần)</option>
              <option value="time_slot_desc">Giờ (giảm dần)</option>
              <option value="max_capacity_asc">Số chỗ (tăng dần)</option>
              <option value="max_capacity_desc">Số chỗ (giảm dần)</option>
            </select>
          </div>
        </div>
        
        <div className="panel-section">
          <h3>Kiểm tra khả dụng theo ngày</h3>
          <div className="availability-check-container">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                if (date) {
                  setCheckDate(date.toISOString().split('T')[0]);
                }
              }}
              locale="vi"
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày"
              className="form-control"
              minDate={new Date()}
              isClearable
            />
            <button 
              className="btn btn-primary"
              onClick={handleCheckAvailability}
              disabled={checkingAvailability}
            >
              {checkingAvailability ? 'Đang kiểm tra...' : 'Kiểm tra'}
            </button>
          </div>
        </div>
        
        {availabilityData && (
          <div className="panel-section">
            <h3>Kết quả kiểm tra cho ngày {selectedDate ? selectedDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : 'đã chọn'}</h3>
            <div className="availability-grid">
              {Object.entries(availabilityData).map(([time, info]) => (
                <div 
                  key={time} 
                  className={`availability-card ${info.available <= 0 ? 'full' : ''}`}
                >
                  <div className="slot-time">{mapTimeKeyToDisplay(time)}</div>
                  <div className="slot-capacity">
                    <span className={info.available <= 0 ? 'text-danger' : 'text-success'}>
                      {info.available}
                    </span>
                    <span className="separator">/</span>
                    <span>{info.total}</span>
                  </div>
                  <span className={`status-badge ${info.available > 0 ? 'active' : 'inactive'}`}>
                    {info.available > 0 ? 'Còn chỗ' : 'Đã đầy'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : timeSlots.length === 0 ? (
        <div className="no-data">Không tìm thấy khung giờ nào</div>
      ) : (
        <>
          <Table
            columns={columns}
            data={timeSlots}
            className="spa-time-slots-table"
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      
      {/* Modal thêm khung giờ mới */}
      {showAddModal && (
        <TimeSlotForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTimeSlot}
        />
      )}
      
      {/* Modal chỉnh sửa khung giờ */}
      {showEditModal && selectedTimeSlot && (
        <TimeSlotForm
          isOpen={showEditModal}
          timeSlot={selectedTimeSlot}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateTimeSlot}
        />
      )}
      
      {/* Modal xác nhận xóa */}
      {showDeleteModal && selectedTimeSlot && (
        <DeleteConfirmationModal
          title="Xác nhận xóa khung giờ"
          message={`Bạn có chắc chắn muốn xóa khung giờ ${formatTime(selectedTimeSlot.time_slot)} không?`}
          warningMessage="Lưu ý: Việc xóa khung giờ sẽ ảnh hưởng đến các lịch hẹn được đặt trong khung giờ này."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default SpaTimeSlotsPage;