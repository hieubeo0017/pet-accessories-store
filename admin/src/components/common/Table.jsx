const Table = ({ columns, data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">Không có dữ liệu</div>;
  }
  
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th 
              key={index}
              style={{ 
                width: column.width || 'auto',
                whiteSpace: column.noWrap ? 'nowrap' : 'normal',
                paddingLeft: '20px', // Thêm padding bên trái cho header
                paddingRight: '20px'  // Thêm padding bên phải cho header
              }}
              align={column.align || 'left'}
              className={column.className || ''}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td 
                key={colIndex}
                style={{ 
                  width: column.width || 'auto',
                  whiteSpace: column.noWrap ? 'nowrap' : 'normal',
                  paddingLeft: '20px', // Thêm padding bên trái cho ô dữ liệu
                  paddingRight: '20px'  // Thêm padding bên phải cho ô dữ liệu
                }}
                align={column.align || 'left'}
                className={column.className || ''}
              >
                {column.cell ? column.cell(row) : row[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;