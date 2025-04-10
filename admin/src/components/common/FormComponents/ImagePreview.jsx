import React from 'react';

const ImagePreview = ({ src, isPrimary, onRemove, onSetPrimary }) => {
  return (
    <div className="image-preview">
      <img src={src} alt="Preview" />
      
      <div className="image-preview-actions">
        {onSetPrimary && !isPrimary && (
          <button 
            type="button" 
            className="image-preview-action" 
            onClick={onSetPrimary} 
            title="Đặt làm ảnh chính"
          >
            <i className="fas fa-star"></i>
          </button>
        )}
        
        {onRemove && (
          <button 
            type="button" 
            className="image-preview-action" 
            onClick={onRemove} 
            title="Xóa ảnh"
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
      
      {isPrimary && (
        <div className="image-primary-badge">
          Ảnh chính
        </div>
      )}
    </div>
  );
};

export default ImagePreview;