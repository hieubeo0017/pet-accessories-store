import { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ placeholder, value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);
  
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    if (onChange) {
      onChange(searchTerm);
    }
    
    // Hiệu ứng tìm kiếm giả lập
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && searchTerm !== value) {
        setIsSearching(true);
        onChange(searchTerm);
        
        // Hiệu ứng tìm kiếm giả lập
        setTimeout(() => {
          setIsSearching(false);
        }, 500);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, onChange, value]);
  
  return (
    <form className={`search-bar ${isSearching ? 'searching' : ''}`} onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder || "Tìm kiếm..."}
        className="search-input"
      />
      <button type="submit" className="search-button">
        <i className={`fas ${isSearching ? 'fa-spinner' : 'fa-search'}`}></i>
      </button>
    </form>
  );
};

export default SearchBar;