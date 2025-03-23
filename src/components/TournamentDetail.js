import React from 'react';
import './TournamentDetail.css';
import Scorecard from './Scorecard';
import CommentSection from './CommentSection';

const TournamentDetail = ({
  tournament,
  selectedDay,
  onSelectDay,
  onBackToTournaments,
  players,
  holes,
  onAddPlayer,
  onRemovePlayer,
  onScoreChange,
  onAddComment,
  onDeleteComment,
  comments,
  currentUser,
  onDeleteTournament
}) => {
  // Format a date string (YYYY-MM-DD) in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Parse the date parts explicitly to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Month is 0-indexed in JavaScript Date
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString || '';
    }
  };

  // Get array of days from tournament object
  const days = tournament && tournament.days ? Object.keys(tournament.days).map(dayKey => ({
    id: dayKey,
    date: tournament.days[dayKey].date || '',
    title: tournament.days[dayKey].title || `Day ${dayKey.replace('day', '')}`,
    label: `Day ${dayKey.replace('day', '')}`
  })) : [];
  
  // Get the current day's data
  const currentDayData = tournament && tournament.days && tournament.days[selectedDay] || {};
  
  // Get the title for the current day's scorecard
  const scorecardTitle = currentDayData.title || 'Golf Scorecard';
  
  // Log days for debugging
  console.log('Tournament days in detail view:', days);
  
  // Check if current user is the creator of the tournament
  const isUserCreator = tournament.creator === currentUser;
  
  // Handle delete tournament with confirmation
  const handleDeleteTournament = () => {
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      onDeleteTournament(tournament.id);
    }
  };

  return (
    <div className="tournament-detail-container">
      <div className="tournament-detail-header">
        <div className="header-top-row">
          <button className="back-button" onClick={onBackToTournaments}>
            ← Back to Tournaments
          </button>
          
          {isUserCreator && (
            <button 
              className="delete-tournament-button-detail" 
              onClick={handleDeleteTournament}
              title="Delete tournament"
            >
              Delete Tournament
            </button>
          )}
        </div>
        
        <h2>{tournament.name || 'Tournament'}</h2>
        <div className="tournament-info-bar">
          <span className="tournament-location">
            <i className="fa fa-map-marker"></i> {tournament.location || 'No location set'}
          </span>
          <span className="tournament-dates">
            <i className="fa fa-calendar"></i> {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
          </span>
          <span className="tournament-creator">
            <i className="fa fa-user"></i> Created by {tournament.creator || 'Unknown'}
            {isUserCreator && <span className="user-badge"> (You)</span>}
          </span>
        </div>
      </div>

      <div className="day-tabs">
        {days.length > 0 ? days.map(day => (
          <button
            key={day.id}
            className={`day-tab ${selectedDay === day.id ? 'active' : ''}`}
            onClick={() => onSelectDay(day.id)}
          >
            {day.label} - {formatDate(day.date)}
          </button>
        )) : (
          <div className="no-days-message">No days available for this tournament</div>
        )}
      </div>

      <div className="day-content">
        <Scorecard
          players={players || []}
          holes={holes}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onScoreChange={onScoreChange}
          currentUser={currentUser}
          scorecardTitle={scorecardTitle}
        />
        
        <CommentSection
          comments={comments || []}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default TournamentDetail; 