import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../common/FormComponents/TextInput';
import TextareaInput from '../common/FormComponents/TextareaInput';
import '../common/FormComponents/FormStyles.css';

const BlogForm = ({ initialData, onSubmit, submitButtonText }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        content: '',
        excerpt: '',
        is_published: true
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title?.trim()) newErrors.title = 'Tên bài viết không được để trống';
        if (!formData.content?.trim()) newErrors.content = 'Nội dung bài viết không được để trống';
        if (!formData.excerpt?.trim()) newErrors.excerpt = 'Đoạn trích bài viết không được để trống';
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
        <form className="brand-form" onSubmit={handleSubmit}>
            <div>
                <div className="form-section">
                    <TextInput
                        label="Tên bài viết"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        error={errors.title}
                        required
                    />
                    <TextInput
                        label="Tên đoạn trích"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        error={errors.excerpt}
                        required
                    />
                    <TextareaInput
                        label="Mô tả bài viết"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        error={errors.content}
                        rows={5}
                    />
                    <div className="form-row checkbox-row">
                        <label>
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                            />
                            Xuất bản bài viết
                        </label>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <Link to="/blogs" className="btn-cancel">Hủy</Link>
                <button type="submit" className="btn-submit">{submitButtonText || 'Lưu'}</button>
            </div>
        </form>
    );
};

export default BlogForm;