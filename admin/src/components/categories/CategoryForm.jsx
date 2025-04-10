import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import SelectInput from '../common/FormComponents/SelectInput';
import FileUpload from '../common/FormComponents/FileUpload';
import ImagePreview from '../common/FormComponents/ImagePreview';

const CategoryForm = ({ initialData, onSubmit, submitButtonText }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || null);
  
  // Generate slug from name
  useEffect(() => {
    if (formData.name && (!formData.slug || formData.slug.length === 0)) {
      // Convert name to slug format (lowercase, replace spaces with hyphens, remove special chars)
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setFormData({ ...formData, slug });
    }
  }, [formData.name]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageUpload = (images) => {
    if (images && images.length > 0) {
      setImagePreview(images[0].url);
      setFormData({ ...formData, image_url: images[0].url });
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Tên danh mục không được để trống';
    if (!formData.description?.trim()) newErrors.description = 'Mô tả không được để trống';
    if (!formData.slug?.trim()) newErrors.slug = 'Đường dẫn không được để trống';
    if (!formData.type) newErrors.type = 'Vui lòng chọn loại danh mục';
    
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
    <form className="category-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-section">
          <TextInput
            label="Tên danh mục"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          
          <TextInput
            label="Đường dẫn (slug)"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            required
          />
          
          <SelectInput
            label="Loại danh mục"
            name="type"
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
            required
            options={[
              { value: 'pet', label: 'Thú cưng' },
              { value: 'food', label: 'Thức ăn' },
              { value: 'accessory', label: 'Phụ kiện' }
            ]}
          />
          
          <TextareaInput
            label="Mô tả danh mục"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={5}
            required
          />
          
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Hiển thị danh mục
            </label>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Hình ảnh danh mục</h3>
          
          <FileUpload
            onUpload={handleImageUpload}
            maxFiles={1}
            accept="image/*"
            note="Chọn một hình ảnh đại diện cho danh mục"
          />
          
          {imagePreview && (
            <div className="image-preview-container">
              <ImagePreview
                src={imagePreview}
                onRemove={removeImage}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="form-actions">
        <Link to="/categories" className="btn-cancel">Hủy</Link>
        <button type="submit" className="btn-submit">{submitButtonText || 'Lưu'}</button>
      </div>
    </form>
  );
};

export default CategoryForm;