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
  
  // Cải thiện xử lý kéo thả
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    try {
      // Ưu tiên xử lý files nếu có
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
        return;
      }
      
      // Xử lý trường hợp kéo thả từ trang web khác (có thể là URL hình ảnh)
      const items = Array.from(e.dataTransfer.items || []);
      if (items.length > 0) {
        const imageItems = items.filter(item => item.kind === 'string' && item.type.match(/^text\/uri-list|^text\/plain/));
        
        if (imageItems.length > 0) {
          setUploading(true);
          const promises = imageItems.map(item => 
            new Promise((resolve) => {
              item.getAsString(url => {
                resolve(url);
              });
            })
          );
          
          const urls = await Promise.all(promises);
          // Lọc URL hợp lệ
          const validUrls = urls
            .map(url => url.trim())
            .filter(url => url.match(/\.(jpeg|jpg|gif|png|webp)$/i));
          
          if (validUrls.length > 0) {
            // Tải hình ảnh từ URL và chuyển đổi thành File
            const fetchPromises = validUrls.slice(0, maxFiles).map(async (url) => {
              try {
                // Sử dụng proxy hoặc CORS-friendly endpoint nếu cần
                const response = await fetch(url);
                const blob = await response.blob();
                const fileName = url.split('/').pop() || 'image.jpg';
                
                // Tạo File object từ Blob
                const file = new File([blob], fileName, {
                  type: blob.type || 'image/jpeg'
                });
                
                return file;
              } catch (err) {
                console.error(`Error fetching image from ${url}:`, err);
                return null;
              }
            });
            
            const fetchedFiles = (await Promise.all(fetchPromises)).filter(file => file !== null);
            if (fetchedFiles.length > 0) {
              processFiles(fetchedFiles);
              return;
            }
          }
        }
      }
      
      // Thông báo nếu không tìm thấy dữ liệu hình ảnh hợp lệ
      console.warn('Không tìm thấy dữ liệu hình ảnh hợp lệ để xử lý');
      
    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };
  
  const processFiles = async (fileList) => {
    try {
      // Giới hạn số lượng file
      const files = Array.from(fileList).slice(0, maxFiles);
      
      if (fileList.length > maxFiles) {
        alert(`Chỉ được chọn tối đa ${maxFiles} file cùng lúc.`);
      }
      
      // Kiểm tra kích thước
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSizeInBytes);
      
      if (oversizedFiles.length > 0) {
        alert(`Các file sau vượt quá kích thước cho phép (5MB):\n${oversizedFiles.map(f => f.name).join('\n')}\n\nVui lòng chọn lại file có kích thước nhỏ hơn.`);
        return;
      }
      
      setUploading(true);
      
      // Tạo API với timeout dài hơn
      const api = axios.create({
        baseURL: 'http://localhost:5000',
        timeout: 40000 // 40 giây 
      });
      
      // Xử lý upload files
      if (multiple) {
        const formData = new FormData();
        files.forEach(file => {
          // Kiểm tra xem nó có phải là File object không
          if (file instanceof File) {
            formData.append('images', file);
          } else if (file instanceof Blob) {
            // Nếu là Blob, chuyển đổi thành File
            formData.append('images', new File([file], 'image.jpg', { type: file.type || 'image/jpeg' }));
          }
        });
        
        // Upload lên server
        const response = await api.post('/api/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Chuyển đổi kết quả
        const uploadedFiles = response.data.map(fileInfo => ({
          url: `http://localhost:5000${fileInfo.url}`,
          image_url: `http://localhost:5000${fileInfo.url}`, // Thêm trường này để đảm bảo tính nhất quán
          name: fileInfo.originalName,
          size: fileInfo.size,
          type: fileInfo.mimetype,
          is_primary: false
        }));
        
        onUpload(uploadedFiles);
      } else {
        // Xử lý tương tự cho single file upload
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