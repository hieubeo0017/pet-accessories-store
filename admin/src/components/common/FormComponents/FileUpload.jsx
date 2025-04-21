import { useState, useRef } from 'react';
import axios from 'axios';

const FileUpload = ({ onUpload, maxFiles = 1, accept = '*', multiple = false, note }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };
  
  const processFiles = async (fileList) => {
    try {
      // Giới hạn số lượng file được xử lý
      const files = Array.from(fileList).slice(0, maxFiles);
      
      if (fileList.length > maxFiles) {
        alert(`Chỉ được chọn tối đa ${maxFiles} file cùng lúc.`);
      }
      
      // Kiểm tra kích thước của từng file (giới hạn 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSizeInBytes);
      
      if (oversizedFiles.length > 0) {
        alert(`Các file sau vượt quá kích thước cho phép (5MB):\n${oversizedFiles.map(f => f.name).join('\n')}\n\nVui lòng chọn lại file có kích thước nhỏ hơn.`);
        return; // Dừng upload nếu có file quá lớn
      }
      
      setUploading(true);
      
      // Tạo đối tượng API với timeout dài hơn
      const api = axios.create({
        baseURL: 'http://localhost:5000',
        timeout: 30000 // 30 giây để xử lý upload lớn
      });
      
      // Xử lý upload nhiều file
      if (multiple) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });
        
        // Upload lên server trước
        const response = await api.post('/api/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Sau đó chuyển đổi kết quả
        const uploadedFiles = response.data.map(fileInfo => ({
          url: `http://localhost:5000${fileInfo.url}`,
          name: fileInfo.originalName,
          size: fileInfo.size,
          type: fileInfo.mimetype,
          is_primary: false
        }));
        
        // Gọi callback với kết quả từ server
        onUpload(uploadedFiles);
      } else {
        // Xử lý upload đơn lẻ
        const formData = new FormData();
        formData.append('image', files[0]);
        
        const response = await api.post('/api/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data && response.data.url) {
          const fullUrl = `http://localhost:5000${response.data.url}`;
          
          onUpload([{
            url: fullUrl, // URL từ server: http://localhost:5000/uploads/...
            name: response.data.originalName,
            size: response.data.size,
            type: response.data.mimetype,
            is_primary: true
          }]);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(`Lỗi khi tải lên ảnh: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div 
      className={`file-upload ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file"
        ref={fileInputRef}
        className="file-upload-input"
        onChange={handleFileInputChange}
        accept={accept}
        multiple={multiple}
        disabled={uploading}
      />
      <div className="file-upload-label">
        {uploading ? (
          <>
            <div className="upload-spinner"></div>
            <div className="file-upload-text">Đang tải lên...</div>
          </>
        ) : (
          <>
            <i className="fas fa-cloud-upload-alt file-upload-icon"></i>
            <div className="file-upload-text">
              Kéo thả hình ảnh vào đây hoặc bấm để chọn file
            </div>
            {note && <div className="file-upload-note">{note}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;