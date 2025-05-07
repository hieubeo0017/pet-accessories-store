import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import FileUpload from '../common/FormComponents/FileUpload';
import ImagePreview from '../common/FormComponents/ImagePreview';
import '../common/FormComponents/FormStyles.css';

const BlogForm = ({ initialData = {}, onSubmit, submitButtonText = "Lưu" }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    is_published: true,
    thumbnail: '',
    is_featured: false,
  });

  const [errors, setErrors] = useState({});
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Thêm kiểm tra cho cả trường image và thumbnail
      const imageUrl = initialData.thumbnail || initialData.image || '';
      
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        excerpt: initialData.excerpt || '',
        thumbnail: imageUrl, // Sử dụng URL ảnh đã kiểm tra
        is_published: initialData.is_published === undefined ? true : initialData.is_published,
        is_featured: initialData.is_featured || false,
      });
      
      // Thiết lập preview nếu có ảnh
      if (imageUrl) {
        setThumbnailPreview(imageUrl);
        console.log("Đã tìm thấy ảnh:", imageUrl);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (images) => {
    if (images && images.length > 0) {
      console.log("BLOG FORM - Uploaded image:", images);
      console.log("BLOG FORM - Image URL:", images[0].url);
      
      setThumbnailPreview(images[0].url);
      setFormData(prevData => ({
        ...prevData,
        thumbnail: images[0].url
      }));
      
      console.log("BLOG FORM - Updated formData:", {...formData, thumbnail: images[0].url});
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setFormData({ ...formData, thumbnail: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }
    
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
    <form className="blog-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-section">
          <TextInput
            label="Tiêu đề"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
          />
          
          <TextareaInput
            label="Đoạn trích"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            hint="Mô tả ngắn gọn về nội dung bài viết (tối đa 500 ký tự)"
          />
          
          <TextareaInput
            label="Nội dung"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={15}
            error={errors.content}
            required
          />
          
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
              />
              Xuất bản
            </label>
          </div>
          
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
              />
              Hiển thị ở phần "Bài viết nổi bật" trang chủ
            </label>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Hình ảnh thu nhỏ</h3>
          
          <FileUpload
            onUpload={handleImageUpload}
            maxFiles={1}
            accept="image/*"
            note="Chọn một hình ảnh làm ảnh đại diện cho bài viết (khuyến nghị kích thước 16:9, tối thiểu 800x450px)"
          />
          
          {thumbnailPreview && (
            <div className="image-preview-container">
              <ImagePreview
                src={thumbnailPreview}
                onRemove={removeThumbnail}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="form-actions">
        <Link to="/blogs" className="btn-cancel">Hủy</Link>
        <button type="submit" className="btn-submit">{submitButtonText}</button>
      </div>
    </form>
  );
};

export default BlogForm;