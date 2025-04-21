import { useState, useEffect } from 'react';
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
  
  // Khởi tạo mảng images từ initialData
  useEffect(() => {
    if (initialData && initialData.images && initialData.images.length > 0) {
      console.log("Initial data images:", initialData.images);
      
      // Đảm bảo chuyển đổi đúng và đầy đủ thuộc tính
        // Kiểm tra xem mỗi ảnh có phải là URL từ server hay URL Blob
      const convertedImages = initialData.images.map(img => {
        // Kiểm tra nếu url đã tồn tại và là URL server hợp lệ
        const imageUrl = img.image_url || img.url;
        
        // Không sử dụng URL blob cũ - chỉ dùng URL từ server
        return {
          url: imageUrl, // Ưu tiên URL từ server
          is_primary: img.is_primary === true || img.is_primary === 1
        };
      });
      
      console.log("Converted images for display:", convertedImages);
      setImages(convertedImages);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageUpload = (uploadedImages) => {
    // Kiểm tra số lượng ảnh hiện tại + số ảnh mới upload
    const totalImagesAfterUpload = images.length + uploadedImages.length;
    
    if (totalImagesAfterUpload > 5) {
      // Hiển thị thông báo hoặc chỉ lấy đủ số ảnh tối đa
      alert(`Chỉ được phép tối đa 5 ảnh. Đã chọn ${images.length} ảnh, không thể thêm ${uploadedImages.length} ảnh nữa.`);
      
      // Tùy chọn: Nếu muốn vẫn lấy một số ảnh mới (không quá giới hạn)
      const remainingSlots = Math.max(0, 5 - images.length);
      if (remainingSlots > 0) {
        const limitedNewImages = uploadedImages.slice(0, remainingSlots);
        
        // Kiểm tra nếu chưa có ảnh chính nào thì mới đánh dấu ảnh đầu tiên là chính
        const hasMainImage = images.some(img => img.is_primary);
        const newImages = [...images];
        
        limitedNewImages.forEach((img, index) => {
          newImages.push({
            ...img,
            is_primary: !hasMainImage && index === 0 // Chỉ ảnh đầu tiên của batch đầu tiên là primary
          });
        });
        
        setImages(newImages);
        
        // Update formData với đúng trạng thái is_primary
        setFormData({
          ...formData,
          images: newImages.map(img => ({
            image_url: img.url,
            is_primary: img.is_primary || false
          }))
        });
        
        alert(`Đã thêm ${limitedNewImages.length} ảnh. Đạt giới hạn tối đa 5 ảnh.`);
      }
      return;
    }
    
    // Nếu số lượng ảnh nằm trong giới hạn, tiếp tục xử lý bình thường
    const hasMainImage = images.some(img => img.is_primary);
    const newImages = [...images];
    
    uploadedImages.forEach((img, index) => {
      newImages.push({
        ...img,
        is_primary: !hasMainImage && index === 0 // Chỉ ảnh đầu tiên của batch đầu tiên là primary
      });
    });
    
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
  
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    const wasPrimary = removedImage.is_primary;
    
    newImages.splice(index, 1);
    
    // Nếu ảnh bị xóa là ảnh chính và vẫn còn ảnh khác, đặt ảnh đầu tiên làm ảnh chính
    if (wasPrimary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    
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
    // Tạo mảng mới với tất cả ảnh đặt is_primary=false, sau đó đặt ảnh được chọn là is_primary=true
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index // Chỉ có ảnh được chọn là true, tất cả ảnh khác là false
    }));
    
    // Log để debug
    console.log(`Đặt ảnh ${index} làm ảnh chính:`, newImages);
    setImages(newImages);
    
    // Cập nhật formData để đảm bảo khi submit dữ liệu đúng
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
    
    if (!formData.name) {
      newErrors.name = 'Vui lòng nhập tên sản phẩm';
    }
    
    if (!formData.description) {
      newErrors.description = 'Vui lòng nhập mô tả sản phẩm';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Vui lòng chọn danh mục';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Vui lòng nhập giá sản phẩm hợp lệ';
    }
    
    // Thêm kiểm tra các trường bắt buộc mới
    if (formData.discount === '' || formData.discount === null) {
      newErrors.discount = 'Vui lòng nhập chiết khấu';
    }
    
    if (!formData.sku) {
      newErrors.sku = 'Vui lòng nhập mã SKU';
    }
    
    if (formData.stock === '' || formData.stock === null || formData.stock < 0) {
      newErrors.stock = 'Vui lòng nhập số lượng tồn kho';
    }
    
    if (!formData.brand_id) {
      newErrors.brand_id = 'Vui lòng chọn thương hiệu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Thay đổi hàm handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Tạo bản sao của formData để xử lý
      let dataToSend = { ...formData };
      
      // Xử lý thông số kỹ thuật - CHÚ Ý PHẦN NÀY
      if (dataToSend.specifications && Array.isArray(dataToSend.specifications)) {
        if (dataToSend.specifications.length > 0) {
          // Lọc các thông số rỗng và định dạng lại theo yêu cầu của backend
          dataToSend.specifications = dataToSend.specifications
            .filter(spec => (spec.name || spec.spec_name || '').trim() !== '')
            .map(spec => ({
              spec_name: spec.spec_name || spec.name || '',
              spec_value: spec.spec_value || spec.value || ''
            }));
        } else {
          // Nếu mảng rỗng, LOẠI BỎ trường specifications hoàn toàn
          delete dataToSend.specifications;
        }
      } else {
        // Nếu không có specifications, LOẠI BỎ trường này khỏi request
        delete dataToSend.specifications;
      }
      
      // Xử lý dữ liệu ảnh
      if (dataToSend.images && dataToSend.images.length > 0) {
        // Đảm bảo mỗi ảnh đều có is_primary xác định
        const hasPrimary = dataToSend.images.some(img => img.is_primary);
        if (!hasPrimary && dataToSend.images.length > 0) {
          dataToSend.images[0].is_primary = true;
        }
      }
      
      // console.log("Submitting form data:", dataToSend);
      onSubmit(dataToSend);
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
              required
              error={errors.discount}
            />
          </div>
          
          <div className="form-row">
            <TextInput
              label="Mã SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              error={errors.sku}
            />
            
            <TextInput
              label="Số lượng tồn kho"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              error={errors.stock}
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
              required
              error={errors.brand_id}
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

          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured || false}
                onChange={handleChange}
              />
              Hiển thị ở phần "Sản phẩm nổi bật" trang chủ
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
            {images.length > 0 ? (
              images.map((img, index) => (
                <ImagePreview
                  key={index}
                  src={img.url}
                  isPrimary={Boolean(img.is_primary)}
                  onRemove={() => handleRemoveImage(index)}
                  onSetPrimary={() => setImageAsPrimary(index)}
                />
              ))
            ) : (
              <p className="no-images-message">Chưa có hình ảnh nào.</p>
            )}
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