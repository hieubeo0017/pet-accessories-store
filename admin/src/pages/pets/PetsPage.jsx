import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPets, deletePet } from '../../services/petService';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';

const PetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const pageSize = 10;
  
  useEffect(() => {
    loadPets();
  }, [currentPage, searchTerm, filter]); // Thêm currentPage vào dependencies
  
  const loadPets = async () => {
    setLoading(true);
    try {
      // Cập nhật API call để hỗ trợ phân trang
      const response = await fetchPets({
        page: currentPage,
        pageSize,
        searchTerm,
        filter: filter !== 'all' ? filter : null
      });
      
      setPets(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deletePet(petToDelete.id);
      setShowDeleteModal(false);
      loadPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };
  
  // Lọc theo loại thú cưng và tìm kiếm
  const filteredPets = pets;
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Hình ảnh', 
      accessor: 'image',
      cell: (row) => {
        const primaryImage = row.images?.find(img => img.is_primary);
        return (
          <img 
            src={primaryImage?.url || '/placeholder-pet.png'} 
            alt={row.name}
            className="pet-thumbnail" 
          />
        );
      }
    },
    { header: 'Tên', accessor: 'name' },
    { 
      header: 'Loại', 
      accessor: 'type',
      cell: (row) => row.type === 'dog' ? 'Chó' : 'Mèo'
    },
    { header: 'Giống', accessor: 'breed' },
    { header: 'Tuổi', accessor: 'age' },
    { header: 'Giá', accessor: 'price', cell: (row) => `${row.price.toLocaleString('vi-VN')} đ` },
    { 
      header: 'Trạng thái', 
      accessor: 'is_adopted',
      cell: (row) => (
        <span className={`status-badge ${row.is_adopted ? 'inactive' : 'active'}`}>
          {row.is_adopted ? 'Đã bán' : 'Còn hàng'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <Link to={`/pets/edit/${row.id}`} className="btn-edit">
            <i className="fas fa-edit"></i>
          </Link>
          <button 
            className="btn-delete"
            onClick={() => handleDeleteClick(row)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      )
    }
  ];
  
  return (
    <div className="pet-management page">
      <div className="page-header">
        <h1>Quản lý thú cưng</h1>
        <Link to="/pets/add" className="btn-add">
          <i className="fas fa-plus"></i> Thêm thú cưng mới
        </Link>
      </div>
      
      <div className="filters">
        <SearchBar 
          placeholder="Tìm theo tên, giống..." 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-btn ${filter === 'dog' ? 'active' : ''}`}
            onClick={() => setFilter('dog')}
          >
            Chó
          </button>
          <button 
            className={`filter-btn ${filter === 'cat' ? 'active' : ''}`}
            onClick={() => setFilter('cat')}
          >
            Mèo
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : filteredPets.length === 0 ? (
        <div className="no-data">Không tìm thấy thú cưng nào</div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={filteredPets} 
          />
          
          {/* Thêm phân trang */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      
      {showDeleteModal && (
        <DeleteConfirmationModal 
          title="Xóa thú cưng"
          message={`Bạn có chắc chắn muốn xóa thú cưng "${petToDelete?.name}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default PetsPage;