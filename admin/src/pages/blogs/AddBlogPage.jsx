import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify';
import BlogForm from "../../components/blogs/BlogForm";
import blogService from '../../services/blogService';

const AddBlogPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      await blogService.createBlog(formData);
      toast.success('Bài viết đã được tạo thành công!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error creating brand:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo Bài viết');
      toast.error(error.message || 'Có lỗi xảy ra khi tạo Bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-brand-page page">
      <PageHeader title="Thêm Bài viết mới" />

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang xử lý...</div>
      ) : (
        <BlogForm
          onSubmit={handleSubmit}
          submitButtonText="Thêm Bài viết"
        />
      )}
    </div>
  );
};

export default AddBlogPage;