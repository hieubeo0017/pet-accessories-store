import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import SelectInput from '../common/FormComponents/SelectInput';
import FileUpload from '../common/FormComponents/FileUpload';
import ImagePreview from '../common/FormComponents/ImagePreview';
import ProductSpecifications from './ProductSpecifications';

const ProductForm = ({ initialData, categories, brands, onSubmit, submitButtonText }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  
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
  
  const handleSpecificationsChange = (specifications) => {
    setFormData({
      ...formData,
      specifications
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Tên sản phẩm không được để trống';
    if (!formData.description?.trim()) newErrors.description = 'Mô tả không được để trống';
    if (!formData.price) newErrors.price = 'Giá không được để trống';
    if (formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (!formData.category_id) newErrors.category_id = 'Vui lòng chọn danh mục';
    
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
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          
          <TextInput
            label="Tên sản phẩm"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          
          <TextareaInput
            label="Mô tả sản phẩm"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={5}
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
              label="Chiết khấu (%)"
              name="discount"
              type="number"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>
          
          <div className="form-row">
            <TextInput
              label="Mã SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
            />
            
            <TextInput
              label="Số lượng tồn kho"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />
          </div>
          
          <div className="form-row">
            <SelectInput
              label="Danh mục"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              error={errors.category_id}
              required
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            />
            
            <SelectInput
              label="Thương hiệu"
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              options={brands.map(brand => ({ value: brand.id, label: brand.name }))}
            />
          </div>
          
          <SelectInput
            label="Loại thú cưng"
            name="pet_type"
            value={formData.pet_type}
            onChange={handleChange}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'dog', label: 'Chó' },
              { value: 'cat', label: 'Mèo' }
            ]}
          />
          
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Hiển thị sản phẩm
            </label>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Hình ảnh sản phẩm</h3>
          
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
                src={img.url}
                isPrimary={img.is_primary}
                onRemove={() => handleRemoveImage(index)}
                onSetPrimary={() => setImageAsPrimary(index)}
              />
            ))}
          </div>
          
          <h3>Thông số kỹ thuật</h3>
          <ProductSpecifications
            specifications={formData.specifications || []}
            onChange={handleSpecificationsChange}
          />
        </div>
      </div>
      
      <div className="form-actions">
        <Link to="/products" className="btn-cancel">Hủy</Link>
        <button type="submit" className="btn-submit">{submitButtonText || 'Lưu'}</button>
      </div>
    </form>
  );
};

export default ProductForm;