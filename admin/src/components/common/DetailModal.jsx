import ReactDOM from 'react-dom';
import { useEffect } from 'react';
import { formatDate } from '../../utils/dateUtils';

const DetailModal = ({ title, onClose, item }) => {
  // Thêm các hàm tiện ích
  const fixVietnameseText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Sửa các trường hợp phổ biến
    return text
      .replace(/tu\?i/g, 'tuổi')
      .replace(/\?/g, 'ổ');
  };

  // Cập nhật hàm getImageUrl để ưu tiên hình ảnh từ mảng images
  const getImageUrl = () => {
    // Trường hợp 1: Nếu có mảng images và có ít nhất 1 ảnh
    if (item.images && item.images.length > 0) {
      // Ưu tiên lấy ảnh được đánh dấu là primary
      const primaryImage = item.images.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image_url;
      }
      // Nếu không có ảnh primary, lấy ảnh đầu tiên
      return item.images[0].image_url;
    }
    
    // Trường hợp 2: Nếu có trường image_url đơn lẻ
    if (item.image_url) {
      return item.image_url;
    }
    
    // Trường hợp 3: Nếu có thông tin cụ thể về loại đối tượng (thú cưng, dịch vụ spa...)
    if (item.type === 'dog') {
      return '/images/default-dog.png';
    } else if (item.type === 'cat') {
      return '/images/default-cat.png';
    }
    
    // Trường hợp 4: Mặc định
    return '/images/default-image.png';
  };

  // Kiểm tra xem item có phải là thú cưng hay không
  const isPet = item.breed !== undefined && item.gender !== undefined;
  
  // Kiểm tra xem item có phải là dịch vụ spa hay không
  const isSpaService = item.duration !== undefined && item.pet_size !== undefined;
  
  // Kiểm tra xem item có phải là danh mục hay không
  const isCategory = item.slug !== undefined && item.type !== undefined && !isPet;
  
  // Kiểm tra xem item có phải là thương hiệu hay không
  const isBrand = item.website !== undefined && item.logo !== undefined;
  
  // Hiển thị tên field phù hợp
  const getFieldDisplayName = (key) => {
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
      total_count: isBrand ? 'Số lượng sản phẩm' : 'Tổng số lượng',
      
      // Thú cưng (Pets)
      breed: 'Giống',
      age: 'Tuổi',
      gender: 'Giới tính',
      color: 'Màu sắc',
      weight: 'Cân nặng',
      vaccination: 'Tiêm chủng',
      health: 'Tình trạng sức khỏe',
      origin: 'Nguồn gốc',
      is_adopted: 'Đã bán',
      
      // Dịch vụ spa
      pet_size: 'Kích thước thú cưng',
      duration: 'Thời gian thực hiện (phút)',
      is_featured: 'Dịch vụ nổi bật'
    };
    
    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  // Format giá trị của field dựa vào loại field và giá trị
  const formatValue = (key, value) => {
    if (key === 'created_at' || key === 'updated_at' || key.includes('date') || key.includes('time')) {
      return formatDate(value, 'long');
    }
    
    if (key === 'price' && !isNaN(value)) {
      return `${parseInt(value).toLocaleString('vi-VN')} đ`;
    }
    
    if (key === 'gender') {
      return value === 'male' ? 'Đực' : 'Cái';
    }
    
    if (key === 'pet_size') {
      switch(value) {
        case 'small': return 'Nhỏ';
        case 'medium': return 'Vừa';
        case 'large': return 'Lớn';
        case 'all': return 'Tất cả';
        default: return value;
      }
    }
    
    if (key === 'pet_type' || key === 'type') {
      switch (value) {
        case 'dog': return 'Chó';
        case 'cat': return 'Mèo';
        case 'all': return 'Tất cả';
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

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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