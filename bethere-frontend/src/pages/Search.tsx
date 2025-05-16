import React, { useState, useEffect } from 'react';
import ProfileIcon from '../components/profileicon/profileicon';
import './Search.css';

interface Party {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  host: string;
}

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [parties, setParties] = useState<Party[]>([]);
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);

  useEffect(() => {
    // Partys aus dem localStorage laden
    const storedParties = JSON.parse(localStorage.getItem('parties') || '[]');
    setParties(storedParties);
    setFilteredParties(storedParties);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = parties.filter(
      (party) =>
        party.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredParties(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="search-container">
      <header className="header">
        <h1>Partys</h1>
        <ProfileIcon />
      </header>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Nach Partys suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <div className="parties-grid">
        {filteredParties.map((party) => (
          <div key={party.id} className="party-card">
            <h3>{party.title}</h3>
            <p className="party-description">{party.description}</p>
            <div className="party-details">
              <p>
                <strong>Datum:</strong> {formatDate(party.date)}
              </p>
              <p>
                <strong>Ort:</strong> {party.location}
              </p>
              <p>
                <strong>Host:</strong> {party.host}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;