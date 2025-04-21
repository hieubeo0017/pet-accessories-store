import React from 'react';
import './SpaProcessSteps.css';

const SpaProcessSteps = () => {
  const steps = [
    { 
      id: 1, 
      title: 'Đặt lịch', 
      description: 'Lựa chọn dịch vụ phù hợp và đặt lịch online hoặc qua điện thoại',
      icon: 'fas fa-calendar-check'
    },
    { 
      id: 2, 
      title: 'Tiếp nhận thú cưng', 
      description: 'Kiểm tra tình trạng sức khỏe và tư vấn dịch vụ phù hợp',
      icon: 'fas fa-paw'
    },
    { 
      id: 3, 
      title: 'Thực hiện dịch vụ', 
      description: 'Chăm sóc thú cưng theo quy trình chuyên nghiệp, với sản phẩm cao cấp',
      icon: 'fas fa-shower'
    },
    { 
      id: 4, 
      title: 'Hoàn thành & giao thú cưng', 
      description: 'Hoàn tất dịch vụ, tư vấn chăm sóc tại nhà và đón thú cưng về',
      icon: 'fas fa-check-circle'
    }
  ];

  return (
    <div className="spa-process">
      <div className="process-steps">
        {steps.map((step) => (
          <div key={step.id} className="process-step">
            <div className="step-icon">
              <i className={step.icon}></i>
            </div>
            <div className="step-number">{step.id}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaProcessSteps;