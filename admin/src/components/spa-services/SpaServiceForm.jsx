import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import SelectInput from '../common/FormComponents/SelectInput';
import FileUpload from '../common/FormComponents/FileUpload';
import ImagePreview from '../common/FormComponents/ImagePreview';

const SpaServiceForm = ({ initialData, onSubmit, submitButtonText }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    price: '',
    duration: '',
    pet_type: 'all',
    pet_size: 'all',
    is_active: true,
    is_featured: false,
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState(initialData?.images || []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageUpload = async (uploadedImages) => {
    // Kiểm tra số lượng ảnh tối đa
    const totalImages = images.length + uploadedImages.length;
    
    if (totalImages > 5) {
      alert('Chỉ được phép tải lên tối đa 5 ảnh. Vui lòng xóa bớt ảnh hiện có.');
      return;
    }
    
    // Cập nhật state và UI
    const newImages = [...images, ...uploadedImages];
    setImages(newImages);
    
    // Format lại mảng ảnh
    const formattedImages = newImages.map(img => ({
      image_url: img.url || img.image_url,
      is_primary: img.is_primary || false
    }));
    
    // Đảm bảo có một ảnh chính
    if (!formattedImages.some(img => img.is_primary) && formattedImages.length > 0) {
      formattedImages[0].is_primary = true;
    }
    
    // Cập nhật formData
    setFormData({
      ...formData,
      images: formattedImages
    });
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
    
    // Format lại mảng ảnh
    const formattedImages = newImages.map(img => ({
      image_url: img.url || img.image_url,
      is_primary: img.is_primary || false
    }));
    
    // Cập nhật formData
    setFormData({
      ...formData,
      images: formattedImages
    });
  };
  
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
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Tên dịch vụ không được để trống';
    if (!formData.description?.trim()) newErrors.description = 'Mô tả không được để trống';
    if (!formData.price) newErrors.price = 'Giá dịch vụ không được để trống';
    if (formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.duration) newErrors.duration = 'Thời gian thực hiện không được để trống';
    if (formData.duration <= 0) newErrors.duration = 'Thời gian phải lớn hơn 0';
    if (!formData.pet_type) newErrors.pet_type = 'Vui lòng chọn loại thú cưng';
    if (!formData.pet_size) newErrors.pet_size = 'Vui lòng chọn kích thước thú cưng';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form className="spa-service-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          
          <TextInput
            label="Tên dịch vụ"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
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
          
          <div className="form-row">
            <TextInput
              label="Giá (VNĐ)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              required
            />
            
            <TextInput
              label="Thời gian thực hiện (phút)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              error={errors.duration}
              required
            />
          </div>
          
          <div className="form-row">
            <SelectInput
              label="Loại thú cưng"
              name="pet_type"
              value={formData.pet_type}
              onChange={handleChange}
              error={errors.pet_type}
              required
              options={[
                { value: 'dog', label: 'Chó' },
                { value: 'cat', label: 'Mèo' },
                { value: 'all', label: 'Tất cả' }
              ]}
            />
            
            <SelectInput
              label="Kích thước thú cưng"
              name="pet_size"
              value={formData.pet_size}
              onChange={handleChange}
              error={errors.pet_size}
              required
              options={[
                { value: 'small', label: 'Nhỏ (dưới 10kg)' },
                { value: 'medium', label: 'Vừa (10-25kg)' },
                { value: 'large', label: 'Lớn (trên 25kg)' },
                { value: 'all', label: 'Tất cả' }
              ]}
            />
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
              Hiển thị ở phần "Dịch vụ nổi bật" trang chủ
            </label>
          </div>
        </div>
        
        <div className="form-section">
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
        <Link to="/spa-services" className="btn-cancel">Hủy</Link>
        <button type="submit" className="btn-submit">{submitButtonText || 'Lưu'}</button>
      </div>
    </form>
  );
};

export default SpaServiceForm;