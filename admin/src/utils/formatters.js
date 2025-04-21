export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  // Kiểm tra nếu là Date object hoặc string định dạng datetime
  if (timeString instanceof Date) {
    return timeString.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Kiểm tra nếu là string định dạng 'HH:MM:SS'
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