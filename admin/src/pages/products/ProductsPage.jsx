import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../services/productService';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  const pageSize = 10;
  
  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts({
        page: currentPage,
        pageSize,
        searchTerm
      });
      setProducts(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setShowDeleteModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Hình ảnh', 
      accessor: 'image',
      cell: (row) => (
        <img 
          src={row.image_url || '/placeholder-product.png'} 
          alt={row.name}
          className="product-thumbnail" 
        />
      )
    },
    { header: 'Tên sản phẩm', accessor: 'name' },
    { header: 'Giá', accessor: 'price', cell: (row) => `${row.price.toLocaleString('vi-VN')} đ` },
    { header: 'Danh mục', accessor: 'category_name' },
    { header: 'Thương hiệu', accessor: 'brand_name' },
    { header: 'Tồn kho', accessor: 'stock' },
    { 
      header: 'Trạng thái', 
      accessor: 'is_active',
      cell: (row) => (
        <span className={`status-badge ${row.is_active ? 'active' : 'inactive'}`}>
          {row.is_active ? 'Đang bán' : 'Ngừng bán'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <Link to={`/products/edit/${row.id}`} className="btn-edit">
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
    <div className="product-management page">
      <div className="page-header">
        <h1>Quản lý sản phẩm</h1>
        <Link to="/products/add" className="btn-add">
          <i className="fas fa-plus"></i> Thêm sản phẩm mới
        </Link>
      </div>
      
      <div className="filters">
        <SearchBar 
          placeholder="Tìm kiếm sản phẩm..." 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        
        {/* Thêm các bộ lọc sản phẩm khác nếu cần */}
        <div className="filter-actions">
          <select className="filter-select">
            <option value="">Tất cả danh mục</option>
            <option value="1">Thức ăn</option>
            <option value="2">Phụ kiện</option>
          </select>
          
          <select className="filter-select">
            <option value="">Sắp xếp theo</option>
            <option value="price_asc">Giá: Thấp → Cao</option>
            <option value="price_desc">Giá: Cao → Thấp</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : products.length === 0 ? (
        <div className="no-data">Không tìm thấy sản phẩm nào</div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={products} 
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
          title="Xóa sản phẩm"
          message={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ProductsPage;