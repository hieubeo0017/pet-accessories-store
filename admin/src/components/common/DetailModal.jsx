import ReactDOM from 'react-dom';
import { useEffect } from 'react';
import { formatDate } from '../../utils/dateUtils';

// Thêm hàm fixVietnameseText vào đầu component
const fixVietnameseText = (text) => {
  if (typeof text !== 'string') return text;
  
  // Sửa các trường hợp phổ biến
  return text
    .replace(/tu\?i/g, 'tuổi')
    .replace(/\?/g, 'ổ');
};

const DetailModal = ({ title, onClose, item }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const getImageUrl = () => {
    if (item.image_url) return item.image_url;
    if (item.logo) return item.logo;
    if (item.images && item.images.length > 0) {
      return item.images[0].url || item.images[0].image_url;
    }
    return '/images/placeholder.png';
  };

  // Sửa hàm formatValue trong DetailModal.jsx
  const formatValue = (key, value) => {
    // Định dạng ngày tháng cho các trường thời gian
    if (key === 'created_at' || key === 'updated_at' || key.includes('date') || key.includes('time')) {
      return formatDate(value, 'long');
    }
    
    if (key === 'price' && !isNaN(value)) {
      return `${parseInt(value).toLocaleString('vi-VN')} đ`;
    }
    
    if (key === 'gender') {
      return value === 'male' ? 'Đực' : 'Cái';
    }
    
    // Sửa đổi phần này để xử lý cả type của danh mục
    if (key === 'pet_type' || key === 'type') {
      switch (value) {
        case 'dog': return 'Chó';
        case 'cat': return 'Mèo';
        case 'all': return 'Tất cả';
        // Thêm các trường hợp cho loại danh mục
        case 'accessory': return 'Phụ kiện';
        case 'pet': return 'Thú cưng';
        case 'food': return 'Thức ăn';
        default: return value;
      }
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }
    
    if (value === null || value === undefined) {
      return '';
    }
    
    return value;
  };

  // Sửa hàm getFieldDisplayName để xử lý riêng cho thương hiệu
  const getFieldDisplayName = (key) => {
    // Xác định loại đối tượng dựa vào thuộc tính trong item
    const isBrand = item.website !== undefined && item.logo !== undefined;
    
    const fieldNames = {
      // Danh mục (Categories)
      name: isBrand ? 'Tên thương hiệu' : 'Tên danh mục',
      description: 'Mô tả',
      slug: 'Đường dẫn',
      type: 'Loại danh mục',
      is_active: 'Trạng thái hiển thị',
      created_at: 'Ngày tạo',
      updated_at: 'Ngày cập nhật',
      
      // Sản phẩm (Products)
      price: 'Giá',
      stock: 'Tồn kho',
      discount: 'Chiết khấu',
      sku: 'Mã SKU',
      brand: 'Thương hiệu',
      category: 'Danh mục',
      pet_type: 'Loại thú cưng', 
      category_name: 'Danh mục', 
      brand_name: 'Thương hiệu', 
      
      // Thương hiệu (Brands)
      country: 'Quốc gia',
      website: 'Website',
      total_count: isBrand ? 'Số lượng sản phẩm' : 'Tổng số lượng', // Thêm dòng này để xử lý total_count
      
      // Thú cưng (Pets)
      breed: 'Giống',
      age: 'Tuổi',
      gender: 'Giới tính',
      color: 'Màu sắc',
      weight: 'Cân nặng',
      vaccination: 'Tiêm chủng',
      health: 'Tình trạng sức khỏe',
      origin: 'Nguồn gốc',
      is_adopted: 'Đã bán'
    };
    
    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  // Kiểm tra xem item có phải là thú cưng hay không
  const isPet = item.type === 'dog' || item.type === 'cat';

  // Nếu là thú cưng, hiển thị theo 2 cột đặc biệt
  if (isPet) {
    // Các trường không hiển thị
    const excludedFields = ['id', 'images', 'image_url', 'logo', 'specifications', 'is_adopted', 'is_active', 'stock', 'category_id', 'brand_id'];
    
    // Các thông tin dài hiển thị riêng
    const longFields = ['description', 'vaccination', 'health', 'origin', 'created_at', 'updated_at'];
    
    // Dữ liệu cho cột trái và cột phải
    const leftColumnData = [];
    const rightColumnData = [];
    const additionalData = [];
    
    // Thứ tự hiển thị cho cột trái
    const leftOrder = ['name', 'type', 'breed', 'age'];
    // Thứ tự hiển thị cho cột phải
    const rightOrder = ['gender', 'color', 'weight', 'price'];
    
    // Phân loại dữ liệu
    Object.entries(item).forEach(([key, value]) => {
      if (excludedFields.includes(key)) return;
      
      const displayKey = getFieldDisplayName(key);
      const displayValue = formatValue(key, value);
      
      if (leftOrder.includes(key)) {
        leftColumnData.push({ key, displayKey, value: displayValue });
      } else if (rightOrder.includes(key)) {
        rightColumnData.push({ key, displayKey, value: displayValue });
      } else if (!longFields.includes(key)) {
        additionalData.push({ key, displayKey, value: displayValue });
      }
    });
    
    // Sắp xếp theo thứ tự đã định nghĩa
    leftColumnData.sort((a, b) => leftOrder.indexOf(a.key) - leftOrder.indexOf(b.key));
    rightColumnData.sort((a, b) => rightOrder.indexOf(a.key) - rightOrder.indexOf(b.key));
    
    // Thêm các trường thông tin dài
    longFields.forEach(field => {
      if (item[field]) {
        const displayKey = getFieldDisplayName(field);
        additionalData.push({
          key: field,
          displayKey,
          value: formatValue(field, item[field])
        });
      }
    });

    return ReactDOM.createPortal(
      <div className="modal-overlay">
        <div className="modal-container" style={{maxWidth: '700px', maxHeight: '90vh'}}>
          <div className="modal-header">
            <h3>{title || 'Chi tiết thú cưng'}</h3>
            <button 
              className="modal-close" 
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body" style={{overflow: 'auto', maxHeight: 'calc(90vh - 130px)'}}>
            <div className="detail-content">
              <div className="detail-image">
                <img 
                  src={getImageUrl()} 
                  alt={item.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto 20px'
                  }}
                />
              </div>
              
              <div className="detail-info">
                {/* Hiển thị 2 cột như yêu cầu */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  {/* Cột trái */}
                  <div>
                    {leftColumnData.map(({ key, displayKey, value }) => (
                      <div key={key} style={{
                        padding: '8px',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span style={{fontWeight: 'bold'}}>{displayKey}:</span> {fixVietnameseText(value)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Cột phải */}
                  <div>
                    {rightColumnData.map(({ key, displayKey, value }) => (
                      <div key={key} style={{
                        padding: '8px',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span style={{fontWeight: 'bold'}}>{displayKey}:</span> {fixVietnameseText(value)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Các thông tin bổ sung hiển thị đầy đủ chiều rộng */}
                {additionalData.length > 0 && (
                  <table className="detail-table" style={{width: '100%'}}>
                    <tbody>
                      {additionalData.map(({ key, displayKey, value }) => (
                        <tr key={key}>
                          <td style={{
                            fontWeight: 'bold', 
                            padding: '8px', 
                            borderBottom: '1px solid #eee',
                            verticalAlign: 'top',
                            width: '25%'
                          }}>
                            {displayKey}:
                          </td>
                          <td style={{
                            padding: '8px', 
                            borderBottom: '1px solid #eee'
                          }}>
                            {fixVietnameseText(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }
  
  // Hiển thị mặc định cho các loại khác (sản phẩm, danh mục, thương hiệu)
  const excludedFields = ['id', 'images', 'image_url', 'logo', 'specifications', 'category_id', 'brand_id'];
  
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-container" style={{maxWidth: '700px', maxHeight: '90vh'}}>
        <div className="modal-header">
          <h3>{title || 'Chi tiết'}</h3>
          <button 
            className="modal-close" 
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body" style={{overflow: 'auto', maxHeight: 'calc(90vh - 130px)'}}>
          <div className="detail-content">
            <div className="detail-image">
              <img 
                src={getImageUrl()} 
                alt={item.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto 20px'
                }}
              />
            </div>
            
            <div className="detail-info">
              <table className="detail-table" style={{width: '100%'}}>
                <tbody>
                  {Object.entries(item).map(([key, value]) => {
                    if (excludedFields.includes(key)) return null;
                    
                    // Sử dụng hàm mới để lấy tên trường tiếng Việt
                    const displayKey = getFieldDisplayName(key);
                    const displayValue = formatValue(key, value);
                    
                    return (
                      <tr key={key}>
                        <td style={{
                          fontWeight: 'bold', 
                          padding: '8px', 
                          borderBottom: '1px solid #eee',
                          verticalAlign: 'top',
                          width: '30%'
                        }}>
                          {displayKey}:
                        </td>
                        <td style={{
                          padding: '8px', 
                          borderBottom: '1px solid #eee'
                        }}>
                          {fixVietnameseText(displayValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DetailModal;