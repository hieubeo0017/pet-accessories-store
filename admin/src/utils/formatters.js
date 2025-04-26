export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Cập nhật hàm formatTime để xử lý mọi định dạng thời gian
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  // Trường hợp 1: Định dạng "1970-01-01T15:00:00" hoặc có chứa T (ISO format)
  if (timeString.includes('T')) {
    const timePart = timeString.split('T')[1];
    const parts = timePart.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  
  // Trường hợp 2: Định dạng "HH:MM:SS.0000000" (SQL Server Time)
  if (timeString.includes('.')) {
    const parts = timeString.split('.')[0].split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  
  // Trường hợp 3: Định dạng "HH:MM:SS" hoặc "HH:MM"
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  
  return timeString;
};

export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0';
  return Math.round(value).toLocaleString('vi-VN');
};