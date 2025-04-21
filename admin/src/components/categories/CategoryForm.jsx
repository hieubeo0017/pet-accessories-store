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
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  
  // Hàm chuyển đổi tiếng Việt sang không dấu
  const convertToNonAccentVietnamese = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  }
  
  // Tạo slug từ chuỗi
  const createSlug = (text) => {
    if (!text) return '';
    
    return convertToNonAccentVietnamese(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/[\s_-]+/g, '-')  // Thay thế khoảng trắng bằng dấu gạch ngang
      .replace(/^-+|-+$/g, '');  // Xóa dấu gạch ngang ở đầu và cuối
  };
  
  // Generate slug from name
  useEffect(() => {
    if (!isSlugManuallyEdited) {
      if (formData.name) {
        const generatedSlug = createSlug(formData.name);
        setFormData(prev => ({...prev, slug: generatedSlug}));
      } else {
        // Xóa slug khi name trống
        setFormData(prev => ({...prev, slug: ''}));
      }
    }
  }, [formData.name, isSlugManuallyEdited]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Đánh dấu nếu người dùng đang sửa slug thủ công
    if (name === 'slug') {
      setIsSlugManuallyEdited(true);
    }
    
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