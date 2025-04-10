const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Tạo mảng các trang để hiển thị
  if (totalPages <= 5) {
    // Nếu có ít hơn hoặc bằng 5 trang, hiển thị tất cả
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Nếu có nhiều hơn 5 trang, hiển thị một số trang với dấu "..." ở giữa
    if (currentPage <= 3) {
      // Nếu đang ở các trang đầu
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Nếu đang ở các trang cuối
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu đang ở giữa
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return (
    <div className="pagination">
      {/* Nút Previous */}
      <button
        className="pagination-button prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      {/* Các trang */}
      {pages.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="ellipsis">...</span>
        ) : (
          <button
            key={`page-${page}`}
            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      ))}
      
      {/* Nút Next */}
      <button
        className="pagination-button next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;