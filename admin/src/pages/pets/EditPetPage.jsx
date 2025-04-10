import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPetById, updatePet } from '../../services/petService';
import PetForm from '../../components/pets/PetForm';

const EditPetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadPet = async () => {
      try {
        const data = await fetchPetById(id);
        setPet(data);
      } catch (error) {
        console.error('Error loading pet:', error);
        setError('Không thể tải thông tin thú cưng');
      } finally {
        setLoading(false);
      }
    };
    
    loadPet();
  }, [id]);
  
  const handleSubmit = async (petData) => {
    setUpdating(true);
    try {
      await updatePet(id, petData);
      navigate('/pets');
    } catch (error) {
      console.error('Error updating pet:', error);
      setError('Có lỗi xảy ra khi cập nhật thông tin thú cưng');
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
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {updating ? (
        <div className="loading">Đang cập nhật...</div>
      ) : (
        <PetForm 
          initialData={pet}
          onSubmit={handleSubmit}
          submitButtonText="Cập nhật thú cưng"
        />
      )}
    </div>
  );
};

export default EditPetPage;