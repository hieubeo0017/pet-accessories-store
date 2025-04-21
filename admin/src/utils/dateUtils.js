/**
 * Định dạng ngày tháng cho hiển thị trên giao diện người dùng
 * @param {string|Date} dateString - Chuỗi ngày hoặc đối tượng Date cần định dạng
 * @param {string} format - Định dạng mong muốn: 'short', 'long', 'full', hoặc 'time'
 * @returns {string} Chuỗi ngày đã định dạng
 */
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '';
  
  // Chuyển đổi thành đối tượng Date
  const date = new Date(dateString);
  
  // Kiểm tra xem date có hợp lệ không
  if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
  
  // Lấy các thành phần ngày tháng theo UTC để tránh chuyển đổi múi giờ
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
  // Định dạng theo yêu cầu
  switch (format) {
    case 'short': // DD/MM/YYYY
      return `${day}/${month}/${year}`;
    
    case 'long': // DD/MM/YYYY HH:MM
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    
    case 'full': // DD/MM/YYYY HH:MM:SS
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    case 'time': // HH:MM
      return `${hours}:${minutes}`;
      
    case 'friendly':
      return getFriendlyDate(date, true); // true = dùng UTC
    
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Hiển thị ngày thân thiện: "Hôm nay", "Hôm qua", hoặc ngày cụ thể
 */
const getFriendlyDate = (date, useUTC = false) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(date, today, useUTC)) {
    const hours = useUTC ? date.getUTCHours() : date.getHours();
    const minutes = useUTC ? date.getUTCMinutes() : date.getMinutes();
    return `Hôm nay, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else if (isSameDay(date, yesterday, useUTC)) {
    const hours = useUTC ? date.getUTCHours() : date.getHours();
    const minutes = useUTC ? date.getUTCMinutes() : date.getMinutes();
    return `Hôm qua, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    const day = useUTC ? date.getUTCDate() : date.getDate();
    const month = useUTC ? date.getUTCMonth() + 1 : date.getMonth() + 1;
    const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }
};

/**
 * Kiểm tra xem hai ngày có cùng ngày không
 */
const isSameDay = (date1, date2, useUTC = false) => {
  if (useUTC) {
    return date1.getUTCDate() === date2.getUTCDate() &&
           date1.getUTCMonth() === date2.getUTCMonth() &&
           date1.getUTCFullYear() === date2.getUTCFullYear();
  }
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};