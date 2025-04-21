import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppointmentDetailPanel from '../../components/spa-appointments/AppointmentDetailPanel';
import { toast } from 'react-toastify';
// Thay đổi import để sử dụng mockSpaAppointments từ spaAppointmentService
import { mockSpaAppointments } from '../../services/spaAppointmentService';
import './SpaAppointmentDetail.css';

const SpaAppointmentDetailPage = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Mô phỏng việc tải dữ liệu
    setLoading(true);
    setTimeout(() => {
      const foundAppointment = mockSpaAppointments.find(a => a.id === id);
      if (foundAppointment) {
        setAppointment(foundAppointment);
      } else {
        setError('Không tìm thấy lịch hẹn');
      }
      setLoading(false);
    }, 500);
  }, [id]);
  
  const handleStatusUpdate = async (newStatus) => {
    try {
      // Mô phỏng việc cập nhật API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Cập nhật state bản ghi cục bộ
      setAppointment(prev => ({
        ...prev,
        status: newStatus
      }));
      
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
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
  
  return (
    <div className="spa-appointment-detail page">
      <div className="page-header">
        <h1>Chi tiết lịch hẹn</h1>
        <div className="breadcrumbs">
          <Link to="/spa-appointments">Quản lý lịch hẹn</Link> / Chi tiết lịch hẹn
        </div>
      </div>
      
      <AppointmentDetailPanel 
        appointment={appointment}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default SpaAppointmentDetailPage;