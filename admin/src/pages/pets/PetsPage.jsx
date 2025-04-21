import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPets, deletePet } from '../../services/petService';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';

const PetsPage = () => {
  const fixVietnameseText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Sửa các trường hợp phổ biến
    return text
      .replace(/tu\?i/g, 'tuổi')
      .replace(/\?/g, 'ổ'); // Thay thế các ký tự bị lỗi
  };

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [sortOption, setSortOption] = useState(''); // Thêm state cho tùy chọn sắp xếp
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  
  const pageSize = 10;
  
  useEffect(() => {
    loadPets();
  }, [currentPage, searchTerm, filter, sortOption]); // Thêm sortOption vào dependencies
  
  const loadPets = async () => {
    setLoading(true);
    try {
      // Xử lý sắp xếp
      let sort_by = 'id';
      let sort_order = 'desc';
      
      // Xử lý các tùy chọn sắp xếp
      if (sortOption === 'price_asc') {
        sort_by = 'price';
        sort_order = 'asc';
      } else if (sortOption === 'price_desc') {
        sort_by = 'price';
        sort_order = 'desc';
      } else if (sortOption === 'name_asc') {
        sort_by = 'name';
        sort_order = 'asc';
      }
      
      const response = await fetchPets({
        page: currentPage,
        pageSize,
        searchTerm,
        filter: filter === 'featured' ? null : (filter === 'all' ? null : filter),
        is_active: filter === 'all' || filter === 'featured' ? null : true,
        is_featured: filter === 'featured' ? true : null,
        sort_by,
        sort_order
      });
      
      // Kiểm tra response trả về đúng dữ liệu
      if (Array.isArray(response.data)) {
        setPets(response.data);
      } else {
        console.error('Dữ liệu không đúng định dạng:', response);
        setPets([]);
      }
      
      // Kiểm tra nếu totalPages không phải số
      if (isNaN(response.totalPages)) {
        setTotalPages(1);
      } else {
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
      toast.error('Không thể tải danh sách thú cưng');
      setPets([]);
      setTotalPages(1);
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
      toast.success('Xóa thú cưng thành công');
      setShowDeleteModal(false);
      loadPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa thú cưng');
    }
  };
  
  const handleViewDetail = (pet) => {
    setSelectedPet(pet);
    setShowDetailModal(true);
  };
  
  // Thêm hàm xử lý sự kiện thay đổi sắp xếp
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi sắp xếp
  };
  
  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      width: '120px',
      noWrap: true
    },
    { header: 'Tên thú cưng', accessor: 'name' },
    { 
      header: 'Loài', 
      accessor: 'type',
      cell: (row) => row.type === 'dog' ? 'Chó' : 'Mèo'
    },
    { header: 'Giống', accessor: 'breed' },
    { 
      header: 'Giới tính', 
      accessor: 'gender',
      cell: (row) => row.gender === 'male' ? 'Đực' : 'Cái'
    },
    { 
      header: 'Tuổi', 
      accessor: 'age',
      cell: (row) => fixVietnameseText(row.age)
    },
    { 
      header: 'Giá', 
      accessor: 'price',
      cell: (row) => `${row.price.toLocaleString('vi-VN')} đ`
    },
    { 
      header: 'Trạng thái', 
      accessor: 'is_adopted',
      cell: (row) => (
        <div className="status-badges">
          <span className={`status-badge ${row.is_adopted ? 'warning' : row.is_active ? 'active' : 'inactive'}`}>
            {row.is_adopted ? 'Đã bán' : row.is_active ? 'Đang bán' : 'Ẩn'}
          </span>
          
          {row.is_featured && (
            <span className="status-badge featured">
              <i className="fas fa-star"></i> Nổi bật
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <button 
            className="btn-view"
            onClick={() => handleViewDetail(row)}
            title="Xem chi tiết"
          >
            <i className="fas fa-eye"></i>
          </button>
          <Link to={`/pets/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
            <i className="fas fa-edit"></i>
          </Link>
          <button 
            className="btn-delete"
            onClick={() => handleDeleteClick(row)}
            title="Xóa"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      )
    }
  ];
  
  const filteredPets = pets;
  
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
          placeholder="Tìm kiếm thú cưng..." 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        
        <div className="filter-actions">
          <select 
            className="filter-select" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả loại thú</option>
            <option value="dog">Chó</option>
            <option value="cat">Mèo</option>
            <option value="featured">Thú cưng nổi bật</option>
          </select>
          
          {/* Thêm dropdown sắp xếp */}
          <select 
            className="filter-select"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="">Sắp xếp theo</option>
            <option value="price_asc">Giá: Thấp → Cao</option>
            <option value="price_desc">Giá: Cao → Thấp</option>
            <option value="name_asc">Tên A-Z</option>
          </select>
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
          warningMessage="Lưu ý: Việc xóa thú cưng sẽ ảnh hưởng đến các đơn hàng và dữ liệu liên quan. Nếu thú cưng đã được bán hoặc đang thuộc đơn hàng nào đó, bạn không nên xóa."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showDetailModal && selectedPet && (
        <DetailModal
          title={`Chi tiết thú cưng: ${selectedPet.name}`}
          item={selectedPet}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default PetsPage;