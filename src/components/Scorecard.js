import React from 'react';
import './Scorecard.css';

const Scorecard = ({ players, onAddPlayer, onRemovePlayer, onScoreChange, holes = 18, currentUser, scorecardTitle = "Golf Scorecard" }) => {
  const [newPlayerName, setNewPlayerName] = React.useState('');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  // Safely calculate score totals with error handling
  const calculateTotal = (scores) => {
    if (!Array.isArray(scores)) return 0;
    return scores.reduce((sum, score) => sum + (score || 0), 0);
  };

  // Calculate front nine total safely
  const calculateFrontNineTotal = (scores) => {
    if (!Array.isArray(scores)) return 0;
    return scores.slice(0, 9).reduce((sum, score) => sum + (score || 0), 0);
  };

  // Calculate back nine total safely
  const calculateBackNineTotal = (scores) => {
    if (!Array.isArray(scores)) return 0;
    return scores.slice(9, 18).reduce((sum, score) => sum + (score || 0), 0);
  };

  // Check if current user is the player
  const isCurrentUserPlayer = (playerName) => {
    return currentUser === playerName;
  };

  // Sort players by total score (lowest first) with error handling
  const sortedPlayers = [...players].sort((a, b) => {
    const totalA = calculateTotal(a.scores);
    const totalB = calculateTotal(b.scores);
    return totalA - totalB;
  });

  // Generate hole numbers array (1 to holes) for front and back nine
  const frontNine = Array.from({ length: Math.min(9, holes) }, (_, i) => i + 1);
  const backNine = holes > 9 ? Array.from({ length: holes - 9 }, (_, i) => i + 10) : [];

  // Check if currentUser already exists as a player
  const currentUserExists = players.some(player => player.name === currentUser);

  return (
    <div className="scorecard-container">
      <h2>{scorecardTitle}</h2>
      
      {!currentUserExists && (
        <form onSubmit={handleAddPlayer} className="add-player-form">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="player-input"
            defaultValue={currentUser}
          />
          <button type="submit" className="add-button">Add Player</button>
        </form>
      )}

      {players.length > 0 ? (
        <div className="scorecard">
          {/* Front Nine */}
          <table className="scorecard-table">
            <thead>
              <tr>
                <th className="player-name-header">Player</th>
                {frontNine.map(hole => (
                  <th key={hole}>Hole {hole}</th>
                ))}
                <th className="subtotal-header">Out</th>
                <th className="action-header"></th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map(player => {
                const frontNineTotal = calculateFrontNineTotal(player.scores);
                const canEdit = isCurrentUserPlayer(player.name);
                
                return (
                  <tr key={`front-${player.id}`} className={canEdit ? 'current-user-row' : ''}>
                    <td className="player-name">{player.name}</td>
                    {frontNine.map(hole => (
                      <td key={hole}>
                        <input
                          type="number"
                          min="1"
                          value={(player.scores && player.scores[hole - 1]) || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            onScoreChange(player.id, hole - 1, value);
                          }}
                          className="score-input"
                          disabled={!canEdit}
                          title={!canEdit ? "You can only update your own score" : ""}
                        />
                      </td>
                    ))}
                    <td className="subtotal-score">{frontNineTotal}</td>
                    <td className="action-cell">
                      {canEdit && (
                        <button 
                          className="remove-button" 
                          onClick={() => onRemovePlayer(player.id)}
                          title="Remove player"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Back Nine (only render if holes > 9) */}
          {backNine.length > 0 && (
            <table className="scorecard-table">
              <thead>
                <tr>
                  <th className="player-name-header">Player</th>
                  {backNine.map(hole => (
                    <th key={hole}>Hole {hole}</th>
                  ))}
                  <th className="subtotal-header">In</th>
                  <th className="total-header">Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map(player => {
                  const backNineTotal = calculateBackNineTotal(player.scores);
                  const total = calculateTotal(player.scores);
                  const canEdit = isCurrentUserPlayer(player.name);
                  
                  return (
                    <tr key={`back-${player.id}`} className={canEdit ? 'current-user-row' : ''}>
                      <td className="player-name">{player.name}</td>
                      {backNine.map(hole => (
                        <td key={hole}>
                          <input
                            type="number"
                            min="1"
                            value={(player.scores && player.scores[hole - 1]) || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value);
                              onScoreChange(player.id, hole - 1, value);
                            }}
                            className="score-input"
                            disabled={!canEdit}
                            title={!canEdit ? "You can only update your own score" : ""}
                          />
                        </td>
                      ))}
                      <td className="subtotal-score">{backNineTotal}</td>
                      <td className="total-score">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p className="no-players-message">No players added yet. Add players to start tracking scores.</p>
      )}
    </div>
  );
};

export default Scorecard; 