import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify';
import blogService from '../../services/blogService';
import BlogForm from "../../components/blogs/BlogForm";


const EditBlogPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBlog = async () => {
            try {
                const data = await blogService.fetchBlogById(id);
                setBlog(data);
            } catch (error) {
                console.error('Error loading brand:', error);
                setError('Không thể tải thông tin bài viết');
                toast.error('Không thể tải thông tin bài viết');
            } finally {
                setLoading(false);
            }
        };

        loadBlog();
    }, [id]);

    const handleSubmit = async (formData) => {
        setUpdating(true);
        setError('');

        try {
            await blogService.updateBlog(id, formData);
            toast.success('Cập nhật bài viết thành công!');
            navigate('/blogs');
        } catch (error) {
            console.error('Error updating brand:', error);
            setError(error.message || 'Có lỗi xảy ra khi cập nhật bài viết');
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật bài viết');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (!blog) {
        return <div className="error">Không tìm thấy bài viết</div>;
    }

    return (
        <div className="edit-brand-page page">
            <PageHeader title={`Chỉnh sửa bài viết: ${blog.title}`} />

            {error && <div className="error-message">{error}</div>}

            {updating ? (
                <div className="loading">Đang cập nhật...</div>
            ) : (
                <BlogForm
                    initialData={blog}
                    onSubmit={handleSubmit}
                    submitButtonText="Cập nhật bài viết"
                />
            )}
        </div>
    );
};

export default EditBlogPage;