import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import DetailModal from '../../components/common/DetailModal';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const pageSize = 10;
  
  useEffect(() => {
    // Tải danh sách danh mục
    const loadCategories = async () => {
      try {
        const response = await fetchCategories({ pageSize: 1000 });
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);
  
  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, categoryFilter, sortOption]);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      // Xử lý sắp xếp
      let sort_by = 'id';
      let sort_order = 'desc';
      
      if (sortOption === 'price_asc') {
        sort_by = 'price';
        sort_order = 'asc';
      } else if (sortOption === 'price_desc') {
        sort_by = 'price';
        sort_order = 'desc';
      } else if (sortOption === 'newest') {
        sort_by = 'created_at';
        sort_order = 'desc';
      } else if (sortOption === 'name_asc') {
        sort_by = 'name';
        sort_order = 'asc';
      }
      
      const response = await fetchProducts({
        page: currentPage,
        pageSize,
        searchTerm,
        category_id: categoryFilter === 'featured' ? null : categoryFilter, 
        is_featured: categoryFilter === 'featured' ? true : null,
        sort_by,
        sort_order
      });
      setProducts(response.data);
      setTotalPages(response.totalPages);
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
      toast.success('Xóa sản phẩm thành công'); // Thêm thông báo thành công
      setShowDeleteModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Lỗi khi xóa sản phẩm'); // Thêm thông báo lỗi
    }
  };
  
  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };
  
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi sắp xếp
  };
  
  const columns = [
    { header: 'ID', accessor: 'id', width: '120px', noWrap: true },
    { header: 'Tên sản phẩm', accessor: 'name', width: '25%' },
    { header: 'Giá', accessor: 'price', cell: (row) => `${row.price.toLocaleString('vi-VN')} đ`, width: '100px', noWrap: true },
    { header: 'Danh mục', accessor: 'category_name', width: '20%' },
    { header: 'Thương hiệu', accessor: 'brand_name', width: '15%' },
    { header: 'Tồn kho', accessor: 'stock', width: '80px', noWrap: true },
    { 
      header: 'Trạng thái', 
      accessor: 'is_active',
      width: '120px',
      noWrap: true,
      cell: (row) => (
        <div className="status-badges">
          <span className={`status-badge ${row.is_active ? 'active' : 'inactive'}`}>
            {row.is_active ? 'Đang bán' : 'Ngừng bán'}
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
      width: '120px',
      noWrap: true,
      cell: (row) => (
        <div className="action-buttons">
          <button 
            className="btn-view"
            onClick={() => handleViewDetail(row)}
            title="Xem chi tiết"
          >
            <i className="fas fa-eye"></i>
          </button>
          <Link to={`/products/edit/${row.id}`} className="btn-edit" title="Chỉnh sửa">
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
        
        <div className="filter-actions">
          <select 
            className="filter-select" 
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="">Tất cả danh mục</option>
            <option value="featured">Sản phẩm nổi bật</option>
            {categories
              .filter(category => category.type === 'food' || category.type === 'accessory')
              .map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            }
          </select>
          
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
          warningMessage="Lưu ý: Việc xóa sản phẩm sẽ ảnh hưởng đến các đơn hàng liên quan. Nếu sản phẩm đang được sử dụng trong đơn hàng, bạn không thể xóa."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showDetailModal && selectedProduct && (
        <DetailModal
          title={`Chi tiết sản phẩm: ${selectedProduct.name}`}
          item={selectedProduct}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ProductsPage;