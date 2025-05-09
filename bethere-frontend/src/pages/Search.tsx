import React, { useState } from 'react';
import ProfileIcon from '../components/profileicon/profileicon';
import './Search.css';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="search-container">
      <header className="header">
        <h1>Search</h1>
        <ProfileIcon />
      </header>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </div>
  );
}

export default Search;