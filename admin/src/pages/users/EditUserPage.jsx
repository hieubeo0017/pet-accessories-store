import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify';
import blogService from '../../services/blogService';
import userService from '../../services/userService';
import UserForm from "../../components/users/UserForm";


const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await userService.fetchUserById(id);
                setUser(data);
            } catch (error) {
                console.error('Error loading brand:', error);
                setError('Không thể tải thông tin người dùng');
                toast.error('Không thể tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [id]);

    const handleSubmit = async (formData) => {
        setUpdating(true);
        setError('');

        try {
            await userService.updateUser(id, formData);
            toast.success('Cập nhật người dùng thành công!');
            navigate('/users');
        } catch (error) {
            console.error('Error updating brand:', error);
            setError(error.message || 'Có lỗi xảy ra khi cập nhật người dùng');
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật người dùng');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (!user) {
        return <div className="error">Không tìm thấy người dùng</div>;
    }

    return (
        <div className="edit-brand-page page">
            <PageHeader title={`Chỉnh sửa người dùng: ${user.username}`} />

            {error && <div className="error-message">{error}</div>}

            {updating ? (
                <div className="loading">Đang cập nhật...</div>
            ) : (
                <UserForm
                    initialData={user}
                    onSubmit={handleSubmit}
                    submitButtonText="Cập nhật người dùng"
                    condition={{
                        hidden_required_password: true,
                    }}
                />
            )}
        </div>
    );
};

export default EditUserPage;