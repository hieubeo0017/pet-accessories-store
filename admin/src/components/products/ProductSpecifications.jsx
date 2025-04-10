import { useState } from 'react';

const ProductSpecifications = ({ specifications = [], onChange }) => {
  const [specs, setSpecs] = useState(specifications);
  const [newSpec, setNewSpec] = useState({ name: '', value: '' });
  
  const handleAddSpec = () => {
    if (newSpec.name.trim() && newSpec.value.trim()) {
      const updatedSpecs = [...specs, { ...newSpec }];
      setSpecs(updatedSpecs);
      setNewSpec({ name: '', value: '' });
      
      // Notify parent component
      if (onChange) {
        onChange(updatedSpecs);
      }
    }
  };
  
  const handleRemoveSpec = (index) => {
    const updatedSpecs = [...specs];
    updatedSpecs.splice(index, 1);
    setSpecs(updatedSpecs);
    
    // Notify parent component
    if (onChange) {
      onChange(updatedSpecs);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpec(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="product-specifications">
      <div className="specs-list">
        {specs.length > 0 ? (
          <table className="specs-table">
            <thead>
              <tr>
                <th>Thông số</th>
                <th>Giá trị</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, index) => (
                <tr key={index}>
                  <td>{spec.name}</td>
                  <td>{spec.value}</td>
                  <td>
                    <button 
                      type="button" 
                      className="btn-remove-spec"
                      onClick={() => handleRemoveSpec(index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-specs">Chưa có thông số nào</div>
        )}
      </div>
      
      <div className="add-spec-form">
        <div className="spec-inputs">
          <input
            type="text"
            name="name"
            value={newSpec.name}
            onChange={handleInputChange}
            placeholder="Tên thông số (ví dụ: Khối lượng)"
            className="form-control"
          />
          <input
            type="text"
            name="value"
            value={newSpec.value}
            onChange={handleInputChange}
            placeholder="Giá trị (ví dụ: 2kg)"
            className="form-control"
          />
          <button 
            type="button" 
            className="btn-add-spec"
            onClick={handleAddSpec}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .product-specifications {
          margin-top: 15px;
        }
        
        .specs-table {
          width: 100%;
          margin-bottom: 15px;
          border-collapse: collapse;
        }
        
        .specs-table th, .specs-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .specs-table th {
          font-weight: 500;
          color: #666;
        }
        
        .no-specs {
          padding: 15px 0;
          color: #999;
          font-style: italic;
        }
        
        .add-spec-form {
          margin-top: 15px;
        }
        
        .spec-inputs {
          display: flex;
          gap: 10px;
        }
        
        .btn-add-spec {
          background-color: var(--primary-color);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;
        }
        
        .btn-remove-spec {
          color: var(--danger-color);
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ProductSpecifications;