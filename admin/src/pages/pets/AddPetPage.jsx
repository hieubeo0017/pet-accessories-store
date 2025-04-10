import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPet } from '../../services/petService';
import PetForm from '../../components/pets/PetForm';

const AddPetPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    images: []
  };
  
  const handleSubmit = async (petData) => {
    setLoading(true);
    try {
      await createPet(petData);
      navigate('/pets');
    } catch (err) {
      console.error('Error creating pet:', err);
      setError('Lỗi khi tạo thú cưng: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-pet page">
      <div className="page-header">
        <h1>Thêm thú cưng mới</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Đang xử lý...</div>
      ) : (
        <PetForm
          initialData={initialPet}
          onSubmit={handleSubmit}
          submitButtonText="Thêm thú cưng"
        />
      )}
    </div>
  );
};

export default AddPetPage;