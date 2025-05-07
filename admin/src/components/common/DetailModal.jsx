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

  // Thêm hàm normalize trong component
  const normalizeText = (value) => {
    if (typeof value !== 'string') return value;
    return value.normalize('NFC');
  };

  // Cập nhật hàm getImageUrl để ưu tiên hình ảnh từ mảng images
  const getImageUrl = () => {
    // Ưu tiên lấy logo nếu đối tượng là thương hiệu
    if (item.logo) {
      return item.logo;
    }
    
    // Trường hợp 1: Nếu có mảng images và có ít nhất 1 ảnh
    if (item.images && item.images.length > 0) {
      const primaryImage = item.images.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image_url;
      }
      return item.images[0].image_url;
    }
    
    // Trường hợp 2: Nếu có trường thumbnail (cho blog)
    if (item.thumbnail) {
      return item.thumbnail;
    }
    
    // Trường hợp 3: Nếu có trường image (cho blog trong DB)
    if (item.image) {
      return item.image;
    }
    
    // Trường hợp 4: Nếu có trường image_url đơn lẻ
    if (item.image_url) {
      return item.image_url;
    }
    
    // Trường hợp mặc định
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
      // Thông tin người dùng
      username: 'Tên người dùng',
      email: 'Email',
      full_name: 'Họ và tên',
      phone_number: 'Số điện thoại',
      address: 'Địa chỉ',
      role: 'Vai trò',
      created_at: 'Ngày tạo',
      updated_at: 'Ngày cập nhật',
      
      // Danh mục (Categories)
      slug: 'Đường dẫn',
      type: isPet ? 'Loại thú cưng' : 'Loại danh mục',
      is_active: 'Trạng thái hiển thị',
      
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
      name: isPet ? 'Tên thú cưng' : (isBrand ? 'Tên thương hiệu' : 'Tên danh mục'),
      breed: 'Giống',
      age: 'Tuổi',
      gender: 'Giới tính',
      color: 'Màu sắc',
      weight: 'Cân nặng',
      description: 'Mô tả',
      vaccination: 'Tiêm chủng',
      health: 'Sức khỏe',
      origin: 'Nguồn gốc',
      is_adopted: 'Đã được nhận nuôi',
      is_featured: 'Nổi bật'
    };
    
    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  // Format giá trị của field dựa vào loại field và giá trị
  const formatValue = (key, value) => {
    // Xử lý trường hợp giới tính - kiểm tra cả giá trị
    if (key === 'gender' || value === 'male' || value === 'female') {
      if (value === 'male') return 'Đực';
      if (value === 'female') return 'Cái';
    }
    
    // Xử lý loại danh mục/loại thú - kiểm tra cả giá trị
    if (key === 'type' || key === 'category_name' || key === 'pet_type' || value === 'cat' || value === 'dog') {
      if (value === 'cat') return 'Mèo';
      if (value === 'dog') return 'Chó';
      if (value === 'accessory') return 'Phụ kiện';
      if (value === 'pet') return 'Thú cưng';
      if (value === 'food') return 'Thức ăn';
      if (value === 'all') return 'Tất cả';
    }

    // Xử lý vai trò người dùng
    if (key === 'role') {
      if (value === 'admin') return 'Quản trị viên';
      if (value === 'user') return 'Người dùng';
      return value;
    }
    
    // Các xử lý khác như đã có
    if (key === 'created_at' || key === 'updated_at' || key.includes('date') || key.includes('time')) {
      return formatDate(value, 'long');
    }
    
    // Chuẩn hóa text trước khi hiển thị
    if (typeof value === 'string') {
      return normalizeText(value);
    }
    
    if (key === 'price' && !isNaN(value)) {
      return `${parseInt(value).toLocaleString('vi-VN')} đ`;
    }
    
    // Xử lý kích thước thú cưng
    if (key === 'pet_size') {
      switch(value) {
        case 'small': return 'Nhỏ';
        case 'medium': return 'Vừa';
        case 'large': return 'Lớn';
        case 'all': return 'Tất cả';
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

  // Thêm phần xử lý hình ảnh đánh giá vào component DetailModal
  const renderReviewImages = () => {
    if (item.review_images && item.review_images.length > 0) {
      return (
        <div className="detail-section">
          <h3>Hình ảnh đánh giá</h3>
          <div className="review-detail-images">
            {item.review_images.map((image, index) => (
              <img 
                key={index}
                src={image.image_url}
                alt={`Hình ảnh đánh giá ${index + 1}`}
                onClick={() => window.open(image.image_url, '_blank')}
              />
            ))}
          </div>
        </div>
      );
    }
    return null;
  };
  
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
          {item.review_images && renderReviewImages()}
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