import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import SelectInput from '../common/FormComponents/SelectInput';
import FileUpload from '../common/FormComponents/FileUpload';
import ImagePreview from '../common/FormComponents/ImagePreview';

const PetForm = ({ initialData, onSubmit, submitButtonText }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState(initialData?.images || []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageUpload = (uploadedImages) => {
    setImages([...images, ...uploadedImages]);
    
    // Update formData with image URLs
    setFormData({
      ...formData,
      images: [...images, ...uploadedImages].map(img => ({
        image_url: img.url,
        is_primary: img.is_primary || false
      }))
    });
  };
  
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    // Update formData
    setFormData({
      ...formData,
      images: newImages.map(img => ({
        image_url: img.url,
        is_primary: img.is_primary || false
      }))
    });
  };
  
  const setImageAsPrimary = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setImages(newImages);
    
    // Update formData
    setFormData({
      ...formData,
      images: newImages.map(img => ({
        image_url: img.url,
        is_primary: img.is_primary || false
      }))
    });
  };
  
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
              onChange={handleChange}
              error={errors.age}
              required
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
            />
            
            <TextInput
              label="Cân nặng"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
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
          
          <h3>Hình ảnh</h3>
          
          <FileUpload
            onUpload={handleImageUpload}
            maxFiles={5}
            accept="image/*"
            multiple
            note="Tối đa 5 ảnh, định dạng JPG, PNG"
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