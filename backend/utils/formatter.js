// Đây là file định dạng dữ liệu time slots để dễ sử dụng ở frontend

const formatTimeSlots = (timeSlots) => {
  const formattedSlots = {};
  
  timeSlots.forEach(slot => {
    // Định dạng giờ từ timestamp thành HH:MM
    const timeObj = new Date(slot.time_slot);
    const hours = timeObj.getUTCHours().toString().padStart(2, '0');
    const minutes = timeObj.getUTCMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    formattedSlots[formattedTime] = {
      id: slot.id,
      total: slot.max_capacity,
      booked: slot.booked_slots,
      available: slot.available_slots
    };
  });
  
  return formattedSlots;
};

module.exports = {
  formatTimeSlots
};