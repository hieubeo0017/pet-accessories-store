import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppointmentDetailPanel from '../../components/spa-appointments/AppointmentDetailPanel';
import RescheduleModal from '../../components/spa-appointments/RescheduleModal';
import { toast } from 'react-toastify';
import { fetchAppointmentById, updateAppointmentStatus, updatePaymentStatus, restoreAppointment } from '../../services/spaAppointmentService';
import './SpaAppointmentDetail.css';

const SpaAppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [restoring, setRestoring] = useState(false);
  
  // Tải chi tiết lịch hẹn từ API
  const loadAppointmentDetails = async () => {
    setLoading(true);
    try {
      const result = await fetchAppointmentById(id);
      setAppointment(result.data);
    } catch (err) {
      console.error(`Error loading appointment details:`, err);
      setError('Không tìm thấy lịch hẹn hoặc có lỗi xảy ra');
      toast.error('Không thể tải thông tin lịch hẹn');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAppointmentDetails();
  }, [id]);
  
  // Cập nhật trạng thái lịch hẹn
  const handleStatusUpdate = async (newStatus) => {
    try {
      const result = await updateAppointmentStatus(id, newStatus);
      setAppointment(result.data);
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };
  
  // Cập nhật trạng thái thanh toán
  const handlePaymentUpdate = async (paymentStatus) => {
    try {
      const result = await updatePaymentStatus(id, paymentStatus);
      setAppointment(result.data);
      toast.success('Cập nhật trạng thái thanh toán thành công');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Không thể cập nhật trạng thái thanh toán');
    }
  };
  
  // Xử lý sau khi đổi lịch hẹn thành công
  const handleRescheduleSuccess = () => {
    setShowRescheduleModal(false);
    loadAppointmentDetails(); // Tải lại thông tin lịch hẹn
    toast.success('Đổi lịch hẹn thành công'); // Chỉ hiển thị một lần tại đây
  };

  // Xử lý khôi phục lịch hẹn
  const handleRestoreAppointment = async () => {
    try {
      setRestoring(true);
      await restoreAppointment(id);
      toast.success('Khôi phục lịch hẹn thành công');
      loadAppointmentDetails(); // Tải lại thông tin
    } catch (error) {
      console.error('Error restoring appointment:', error);
      toast.error(error.response?.data?.message || 'Không thể khôi phục lịch hẹn');
    } finally {
      setRestoring(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!appointment) {
    return <div className="error">Không tìm thấy lịch hẹn</div>;
  }
  
  const canReschedule = ['pending', 'confirmed'].includes(appointment.status);
  
  return (
    <div className="spa-appointment-detail page">
      <div className="page-header">
        <h1>Chi tiết lịch hẹn</h1>
        <div className="breadcrumbs">
          <Link to="/spa-appointments">Quản lý lịch hẹn</Link> / Chi tiết lịch hẹn
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="btn-edit"
          onClick={() => navigate(`/spa-appointments/edit/${id}`)}
        >
          <i className="fas fa-edit"></i> Chỉnh sửa lịch hẹn
        </button>
        
        {canReschedule && (
          <button 
            className="btn-reschedule"
            onClick={() => setShowRescheduleModal(true)}
          >
            <i className="fas fa-calendar-alt"></i> Đổi lịch hẹn
          </button>
        )}
        
        {appointment.status === 'cancelled' && (
          <button 
            className="btn-restore"
            onClick={handleRestoreAppointment}
            disabled={restoring}
          >
            <i className={restoring ? "fas fa-spinner fa-spin" : "fas fa-undo"}></i> 
            {restoring ? 'Đang khôi phục...' : 'Khôi phục lịch hẹn'}
          </button>
        )}
      </div>
      
      <AppointmentDetailPanel 
        appointment={appointment}
        onStatusUpdate={handleStatusUpdate}
        onPaymentUpdate={handlePaymentUpdate}
      />
      
      {showRescheduleModal && (
        <RescheduleModal 
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  );
};

export default SpaAppointmentDetailPage;