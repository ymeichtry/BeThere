import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HostParty.css';

interface Party {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  host: string;
}

const HostParty = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !date || !location) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    // Neue Party erstellen
    const newParty: Party = {
      id: Date.now().toString(),
      title,
      description,
      date,
      location,
      host: 'current-user@example.com', // In einer echten App würde hier die E-Mail des eingeloggten Users stehen
    };

    // Party zum localStorage hinzufügen
    const existingParties = JSON.parse(localStorage.getItem('parties') || '[]');
    localStorage.setItem('parties', JSON.stringify([...existingParties, newParty]));

    // Zurück zur Suchseite navigieren
    navigate('/');
  };

  return (
    <div className="host-party-container">
      <div className="host-party-box">
        <h2>Party erstellen</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Titel der Party"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Beschreibung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Ort"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="host-party-button">
            Party erstellen
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostParty;
  