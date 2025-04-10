import { useState, useRef } from 'react';

const FileUpload = ({ onUpload, maxFiles = 1, accept = '*', multiple = false, note }) => {
  const [isDragging, setIsDragging] = useState(false);
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
  
  const processFiles = (fileList) => {
    // Giới hạn số lượng file
    const files = Array.from(fileList).slice(0, maxFiles);
    
    // Tạo preview và chuẩn bị để upload
    const uploadedFiles = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      is_primary: false
    }));
    
    // Nếu chỉ có một file được upload, đánh dấu là primary
    if (uploadedFiles.length === 1) {
      uploadedFiles[0].is_primary = true;
    }
    
    onUpload(uploadedFiles);
  };
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div 
      className={`file-upload ${isDragging ? 'dragging' : ''}`}
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
      />
      <div className="file-upload-label">
        <i className="fas fa-cloud-upload-alt file-upload-icon"></i>
        <div className="file-upload-text">
          Kéo thả hình ảnh vào đây hoặc bấm để chọn file
        </div>
        {note && <div className="file-upload-note">{note}</div>}
      </div>
    </div>
  );
};

export default FileUpload;