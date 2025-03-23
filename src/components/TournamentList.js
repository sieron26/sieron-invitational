import React, { useState } from 'react';
import './TournamentList.css';

const TournamentList = ({ tournaments, onSelectTournament, onCreateTournament, onDeleteTournament, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, name, location
  
  // Filter tournaments based on search term
  const filteredTournaments = tournaments.filter(tournament => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (tournament.name || '').toLowerCase().includes(searchLower) ||
      (tournament.location || '').toLowerCase().includes(searchLower) ||
      (tournament.creator || '').toLowerCase().includes(searchLower)
    );
  });
  
  // Sort tournaments based on selected criteria
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'location':
        return (a.location || '').localeCompare(b.location || '');
      case 'date':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest first
    }
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };
  
  // Get the number of days in a tournament
  const getNumberOfDays = (tournament) => {
    if (!tournament) return 0;
    if (tournament.numberOfDays) return tournament.numberOfDays;
    if (tournament.days && typeof tournament.days === 'object') {
      return Object.keys(tournament.days).length;
    }
    return 0;
  };
  
  // Check if current user is the creator of the tournament
  const isUserCreator = (tournament) => {
    return tournament.creator === currentUser;
  };
  
  // Handle delete tournament with confirmation
  const handleDeleteTournament = (e, tournamentId) => {
    e.stopPropagation(); // Prevent card click from firing
    
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      onDeleteTournament(tournamentId);
    }
  };
  
  return (
    <div className="tournament-list-container">
      <div className="tournament-list-header">
        <h2>Golf Tournaments</h2>
        <button 
          onClick={onCreateTournament} 
          className="create-tournament-button"
        >
          Create Tournament
        </button>
      </div>
      
      <div className="tournament-search">
        <input
          type="text"
          placeholder="Search tournaments by name, location, or creator..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Date (Newest)</option>
            <option value="name">Name</option>
            <option value="location">Location</option>
          </select>
        </div>
      </div>
      
      {sortedTournaments.length > 0 ? (
        <div className="tournaments-grid">
          {sortedTournaments.map(tournament => (
            <div 
              key={tournament.id} 
              className={`tournament-card ${isUserCreator(tournament) ? 'user-created' : ''}`}
              onClick={() => onSelectTournament(tournament)}
            >
              <h3 className="tournament-name">{tournament.name || 'Unnamed Tournament'}</h3>
              {isUserCreator(tournament) && (
                <button 
                  className="delete-tournament-button" 
                  onClick={(e) => handleDeleteTournament(e, tournament.id)}
                  title="Delete tournament"
                >
                  ×
                </button>
              )}
              <div className="tournament-info">
                <p className="tournament-location">
                  <span className="info-label">Location:</span> {tournament.location || 'Not specified'}
                </p>
                <p className="tournament-date">
                  <span className="info-label">Dates:</span> {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                </p>
                <p className="tournament-days">
                  <span className="info-label">Number of Days:</span> {getNumberOfDays(tournament)}
                </p>
                <p className="tournament-creator">
                  <span className="info-label">Created by:</span> {tournament.creator || 'Unknown'}
                  {isUserCreator(tournament) && <span className="user-badge"> (You)</span>}
                </p>
              </div>
              <div className="tournament-card-footer">
                <button className="view-tournament-button">View Tournament</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-tournaments">
          {searchTerm ? (
            <p>No tournaments match your search criteria. Try a different search term or create a new tournament.</p>
          ) : (
            <p>No tournaments available. Create your first tournament to get started!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentList; 