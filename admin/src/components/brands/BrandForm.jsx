import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import FileUpload from '../common/FormComponents/FileUpload';
import ImagePreview from '../common/FormComponents/ImagePreview';
import '../common/FormComponents/FormStyles.css';

const BrandForm = ({ initialData, onSubmit, submitButtonText }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    website: '',
    logo: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(initialData?.logo || null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageUpload = (images) => {
    if (images && images.length > 0) {
      setLogoPreview(images[0].url);
      setFormData({ ...formData, logo: images[0].url });
    }
  };
  
  const removeLogo = () => {
    setLogoPreview(null);
    setFormData({ ...formData, logo: '' });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Tên thương hiệu không được để trống';
    if (!formData.logo?.trim()) newErrors.logo = 'Logo thương hiệu không được để trống';
    if (formData.website && !isValidUrl(formData.website)) 
      newErrors.website = 'Website phải là một URL hợp lệ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form className="brand-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-section">
          <TextInput
            label="Tên thương hiệu"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          
          <TextInput
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            error={errors.website}
            placeholder="https://example.com"
          />
          
          <TextareaInput
            label="Mô tả thương hiệu"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={5}
          />
          
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Hiển thị thương hiệu
            </label>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Logo thương hiệu</h3>
          {errors.logo && <div className="error-message">{errors.logo}</div>}
          
          <FileUpload
            onUpload={handleImageUpload}
            maxFiles={1}
            accept="image/*"
            note="Chọn một hình ảnh làm logo cho thương hiệu (khuyến nghị kích thước vuông, tối thiểu 200x200px)"
          />
          
          {logoPreview && (
            <div className="image-preview-container">
              <ImagePreview
                src={logoPreview}
                onRemove={removeLogo}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="form-actions">
        <Link to="/brands" className="btn-cancel">Hủy</Link>
        <button type="submit" className="btn-submit">{submitButtonText || 'Lưu'}</button>
      </div>
    </form>
  );
};

export default BrandForm;