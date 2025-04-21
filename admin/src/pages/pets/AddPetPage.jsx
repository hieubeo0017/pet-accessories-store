import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPet } from '../../services/petService';
import { fetchCategories } from '../../services/categoryService';
import PetForm from '../../components/pets/PetForm';
import { toast } from 'react-toastify';

const AddPetPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Truyền pageSize lớn và filter type=pet để lấy tất cả danh mục thú cưng
        const response = await fetchCategories({
          pageSize: 1000, 
          filter: 'pet'  // Chỉ lấy danh mục loại thú cưng
        });
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Lỗi khi tải danh mục');
      }
    };
    
    loadCategories();
  }, []);
  
  const initialPet = {
    name: '',
    type: '',
    breed: '',
    age: '',
    gender: '',
    color: '',
    weight: '',
    price: '',
    description: '',
    vaccination: '',
    health: '',
    origin: '',
    stock: 1,
    is_adopted: false,
    is_active: true,
    is_featured: false, // Thêm giá trị mặc định này
    images: []
  };
  
  const handleSubmit = async (petData) => {
    setLoading(true);
    try {
      await createPet(petData);
      toast.success('Thêm thú cưng thành công');
      navigate('/pets');
    } catch (err) {
      console.error('Error creating pet:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo thú cưng');
      toast.error(err.response?.data?.message || 'Lỗi khi tạo thú cưng');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-pet page">
      <div className="page-header">
        <h1>Thêm thú cưng mới</h1>
        <div className="breadcrumbs">
          <Link to="/pets">Quản lý thú cưng</Link> / Thêm thú cưng mới
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Đang xử lý...</div>
      ) : (
        <PetForm
          initialData={initialPet}
          categories={categories}
          onSubmit={handleSubmit}
          submitButtonText="Thêm thú cưng"
        />
      )}
    </div>
  );
};

export default AddPetPage;