import React from 'react';

const PageHeader = ({ title, children }) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

export default PageHeader;