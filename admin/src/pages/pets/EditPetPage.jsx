import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchPetById, updatePet } from '../../services/petService';
import { fetchCategories } from '../../services/categoryService';
import PetForm from '../../components/pets/PetForm';

const EditPetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [petData, categoriesData] = await Promise.all([
          fetchPetById(id),
          fetchCategories({
            pageSize: 1000,
            filter: 'pet'
          })
        ]);
        
        console.log("Pet data received:", petData); // Thêm log để debug
        
        // Đảm bảo is_featured là boolean
        setPet({
          ...petData,
          is_featured: petData.is_featured === true || petData.is_featured === 1
        });
        setCategories(categoriesData.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  const handleSubmit = async (petData) => {
    setUpdating(true);
    
    // Thêm log debug ở đây để xem dữ liệu form trước khi gửi đi
    console.log("Form data being submitted:", petData);
    
    try {
      await updatePet(id, petData);
      toast.success('Cập nhật thú cưng thành công');
      navigate('/pets');
    } catch (error) {
      console.error('Error updating pet:', error);
      setError(error.response?.data?.message || 'Lỗi khi cập nhật thú cưng');
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thú cưng');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }
  
  if (!pet) {
    return <div className="error">Không tìm thấy thú cưng</div>;
  }
  
  return (
    <div className="edit-pet page">
      <div className="page-header">
        <h1>Chỉnh sửa thú cưng: {pet.name}</h1>
        <div className="breadcrumbs">
          <Link to="/pets">Quản lý thú cưng</Link> / Chỉnh sửa thú cưng
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {updating ? (
        <div className="loading">Đang cập nhật...</div>
      ) : (
        <PetForm 
          initialData={pet}
          categories={categories}
          onSubmit={handleSubmit}
          submitButtonText="Cập nhật thú cưng"
        />
      )}
    </div>
  );
};

export default EditPetPage;