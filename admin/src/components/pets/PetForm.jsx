import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import SelectInput from '../common/FormComponents/SelectInput';
import FileUpload from '../common/FormComponents/FileUpload';
import ImagePreview from '../common/FormComponents/ImagePreview';

// Thêm hàm này vào đầu component
const fixVietnameseText = (text) => {
  if (typeof text !== 'string') return text;
  
  // Sửa các trường hợp phổ biến
  return text
    .replace(/tu\?i/g, 'tuổi')
    .replace(/\?/g, 'ổ'); // Thay thế các ký tự bị lỗi
};

const PetForm = ({ initialData, onSubmit, submitButtonText, categories }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState(initialData?.images || []);
  
  // Sửa đổi khi hiển thị giá trị ban đầu
  useEffect(() => {
    if (initialData?.age) {
      setFormData(prev => ({
        ...prev,
        age: fixVietnameseText(initialData.age)
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Thay đổi hàm handleImageUpload như sau
  const handleImageUpload = async (uploadedImages) => {
    // Kiểm tra số lượng ảnh tối đa
    const totalImages = images.length + uploadedImages.length;
    
    if (totalImages > 5) {
      alert('Chỉ được phép tải lên tối đa 5 ảnh. Vui lòng xóa bớt ảnh hiện có.');
      return; // Không thêm ảnh nếu vượt quá số lượng cho phép
    }
    
    // Cập nhật state và UI trước để người dùng thấy ngay
    const newImages = [...images, ...uploadedImages];
    setImages(newImages);
    
    // Tạo một mảng mới với định dạng chuẩn
    const formattedImages = newImages.map(img => ({
      image_url: img.url || img.image_url,
      is_primary: img.is_primary || false
    }));
    
    // Đảm bảo có một ảnh chính
    if (!formattedImages.some(img => img.is_primary) && formattedImages.length > 0) {
      formattedImages[0].is_primary = true;
    }
    
    // Cập nhật formData với mảng đã được format đúng
    setFormData(prevData => ({
      ...prevData,
      images: formattedImages
    }));
  };
  
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    const wasPrimary = removedImage.is_primary;
    
    newImages.splice(index, 1);
    setImages(newImages);
    
    // Nếu xóa ảnh chính và vẫn còn ảnh khác, thiết lập ảnh đầu tiên làm ảnh chính
    if (wasPrimary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    
    // Format lại mảng ảnh với cách xử lý nhất quán
    const formattedImages = newImages.map(img => ({
      image_url: img.url || img.image_url,
      is_primary: img.is_primary || false
    }));
    
    // Đảm bảo luôn có một ảnh chính nếu có ít nhất một ảnh
    if (formattedImages.length > 0 && !formattedImages.some(img => img.is_primary)) {
      formattedImages[0].is_primary = true;
    }
    
    // Cập nhật formData với mảng ảnh đã được xử lý đúng
    setFormData({
      ...formData,
      images: formattedImages
    });
  };
  
  // Cập nhật hàm setImageAsPrimary
  const setImageAsPrimary = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setImages(newImages);
    
    // Cập nhật formData
    setFormData({
      ...formData,
      images: newImages.map(img => ({
        image_url: img.url || img.image_url,
        is_primary: img.is_primary || false
      }))
    });
  };
  
  // Cập nhật hàm validateForm để thêm kiểm tra nguồn gốc
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Tên thú cưng không được để trống';
    if (!formData.type) newErrors.type = 'Vui lòng chọn loài';
    if (!formData.breed?.trim()) newErrors.breed = 'Giống không được để trống';
    if (!formData.age?.trim()) newErrors.age = 'Tuổi không được để trống';
    if (!formData.gender) newErrors.gender = 'Vui lòng chọn giới tính';
    if (!formData.price) newErrors.price = 'Giá không được để trống';
    if (formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.description?.trim()) newErrors.description = 'Mô tả không được để trống';
    
    // Kiểm tra màu sắc
    if (!formData.color?.trim()) newErrors.color = 'Màu sắc không được để trống';
    
    // Kiểm tra cân nặng
    if (!formData.weight?.trim()) newErrors.weight = 'Cân nặng không được để trống';
    
    // Kiểm tra danh mục
    if (!formData.category_id) newErrors.category_id = 'Vui lòng chọn danh mục';
    
    // Thêm kiểm tra cho nguồn gốc
    if (!formData.origin?.trim()) newErrors.origin = 'Nguồn gốc không được để trống';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
// Sửa hàm handleSubmit để đảm bảo đã xử lý ảnh đúng
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Luôn tạo bản sao để tránh thay đổi trực tiếp state
      const normalizedData = {...formData};
      
      // Đảm bảo trường age được chuẩn hóa
      if (normalizedData.age) {
        normalizedData.age = normalizedData.age.normalize('NFC');
      }
      
      // Kiểm tra và định dạng lại mảng images
      if (normalizedData.images && normalizedData.images.length > 0) {
        // Đảm bảo tất cả images đều có đủ thuộc tính
        normalizedData.images = normalizedData.images.map(img => ({
          image_url: img.image_url || img.url,
          is_primary: !!img.is_primary
        }));
        
        // Đảm bảo có một ảnh chính
        if (!normalizedData.images.some(img => img.is_primary)) {
          normalizedData.images[0].is_primary = true;
        }
      }
      
      // Gửi dữ liệu đã chuẩn hóa
      onSubmit(normalizedData);
    }
  };
  
  return (
    <form className="pet-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          
          <TextInput
            label="Tên thú cưng"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          
          <div className="form-row">
            <SelectInput
              label="Loài"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
              required
              options={[
                { value: 'dog', label: 'Chó' },
                { value: 'cat', label: 'Mèo' }
              ]}
            />
            
            <TextInput
              label="Giống"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              error={errors.breed}
              required
            />
          </div>
          
          <div className="form-row">
            <TextInput
              label="Tuổi"
              name="age"
              value={formData.age}
              onChange={(e) => {
                // Chuẩn hóa văn bản Unicode theo chuẩn NFC
                const normalizedValue = e.target.value.normalize('NFC');
                
                // Cập nhật formData với giá trị đã được chuẩn hóa
                setFormData({
                  ...formData,
                  age: normalizedValue
                });
              }}
              error={errors.age}
              required
              placeholder="Ví dụ: 2 tuổi, 3 tháng"
            />
            
            <SelectInput
              label="Giới tính"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              error={errors.gender}
              required
              options={[
                { value: 'male', label: 'Đực' },
                { value: 'female', label: 'Cái' }
              ]}
            />
          </div>
          
          <div className="form-row">
            <TextInput
              label="Màu sắc"
              name="color"
              value={formData.color}
              onChange={handleChange}
              error={errors.color}
              required
            />
            
            <TextInput
              label="Cân nặng"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              error={errors.weight}
              required
            />
          </div>
          
          <TextInput
            label="Giá (VNĐ)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            required
          />
          
          <SelectInput
            label="Danh mục"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            error={errors.category_id}
            required
            options={(categories || [])
              .filter(cat => cat.type === 'pet')
              .map(cat => ({ value: cat.id, label: cat.name }))}
          />
          
          <TextareaInput
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={4}
            required
          />
        </div>
        
        <div className="form-section">
          <h3>Sức khỏe & Nguồn gốc</h3>
          
          <TextareaInput
            label="Thông tin tiêm chủng"
            name="vaccination"
            value={formData.vaccination}
            onChange={handleChange}
            rows={3}
          />
          
          <TextareaInput
            label="Thông tin sức khỏe"
            name="health"
            value={formData.health}
            onChange={handleChange}
            rows={3}
          />
          
          <TextInput
            label="Nguồn gốc"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            error={errors.origin}
            required
          />
          
          <div className="form-row">
            <TextInput
              label="Số lượng"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />
          </div>
          
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_adopted"
                checked={formData.is_adopted}
                onChange={handleChange}
              />
              Đã bán
            </label>
          </div>
          
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Hiển thị trên website
            </label>
          </div>

          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured || false}
                onChange={handleChange}
              />
              Hiển thị ở phần "Thú cưng nổi bật" trang chủ
            </label>
          </div>
          
          <h3>Hình ảnh</h3>
          
          <FileUpload
            onUpload={handleImageUpload}
            maxFiles={5}
            accept="image/*"
            multiple
            note="Tối đa 5 ảnh, định dạng JPG, PNG, kích thước mỗi ảnh không quá 5MB"
          />
          
          <div className="image-previews">
            {images.map((img, index) => (
              <ImagePreview
                key={index}
                src={img.url || img.image_url}
                isPrimary={img.is_primary}
                onRemove={() => handleRemoveImage(index)}
                onSetPrimary={() => setImageAsPrimary(index)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <Link to="/pets" className="btn-cancel">Hủy</Link>
        <button type="submit" className="btn-submit">{submitButtonText || 'Lưu'}</button>
      </div>
    </form>
  );
};

export default PetForm;