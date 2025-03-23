import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import Scorecard from './components/Scorecard';
import CommentSection from './components/CommentSection';
import UserLogin from './components/UserLogin';
import TournamentList from './components/TournamentList';
import TournamentCreate from './components/TournamentCreate';
import TournamentDetail from './components/TournamentDetail';
import './App.css';

function App() {
  // State for players, comments, and tournaments
  const [players, setPlayers] = useState([]);
  const [comments, setComments] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Current user state
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('golfScorecard_currentUser') || ''
  );
  
  // Current selected tournament and day
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedDay, setSelectedDay] = useState('day1');
  
  // UI State
  const [view, setView] = useState('tournaments'); // tournaments, create-tournament, tournament-detail
  
  // Number of holes for the round
  const numberOfHoles = 18;

  // Save current user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('golfScorecard_currentUser', currentUser);
    } else {
      localStorage.removeItem('golfScorecard_currentUser');
    }
  }, [currentUser]);
  
  // Load tournaments from Firebase
  useEffect(() => {
    const tournamentsRef = ref(database, 'tournaments');
    
    const tournamentsUnsubscribe = onValue(tournamentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tournamentsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setTournaments(tournamentsArray);
      } else {
        setTournaments([]);
      }
      setLoading(false);
    });
    
    return () => {
      tournamentsUnsubscribe();
    };
  }, []);
  
  // Load players and comments when a tournament and day is selected
  useEffect(() => {
    if (!selectedTournament || !selectedDay) {
      setPlayers([]);
      setComments([]);
      return;
    }
    
    const tournamentId = selectedTournament.id;
    
    const playersRef = ref(database, `tournamentData/${tournamentId}/${selectedDay}/players`);
    const commentsRef = ref(database, `tournamentData/${tournamentId}/${selectedDay}/comments`);
    
    // Listen for players data changes
    const playersUnsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array and ensure scores is always an array
        const playersArray = Object.entries(data).map(([key, value]) => {
          // Ensure scores is always an array with proper length
          const scores = Array.isArray(value.scores) 
            ? value.scores 
            : Array(numberOfHoles).fill(null);
          
          // If scores array is shorter than numberOfHoles, pad it
          if (scores.length < numberOfHoles) {
            scores.push(...Array(numberOfHoles - scores.length).fill(null));
          }
          
          return {
            id: key,
            name: value.name || 'Unknown Player',
            scores,
          };
        });
        setPlayers(playersArray);
      } else {
        setPlayers([]);
      }
    });
    
    // Listen for comments data changes
    const commentsUnsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array and sort by timestamp (newest first)
        const commentsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          playerName: value.playerName || 'Anonymous',
          text: value.text || '',
          timestamp: value.timestamp || new Date().toISOString()
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setComments(commentsArray);
      } else {
        setComments([]);
      }
    });
    
    // Cleanup function to unsubscribe from Firebase listeners
    return () => {
      playersUnsubscribe();
      commentsUnsubscribe();
    };
  }, [selectedTournament, selectedDay, numberOfHoles]);
  
  // Function to create a new tournament
  const createTournament = (tournamentData) => {
    const tournamentsRef = ref(database, 'tournaments');
    const newTournamentRef = push(tournamentsRef);
    const tournamentId = newTournamentRef.key;
    
    // Create the tournament in the tournaments collection
    set(newTournamentRef, tournamentData);
    
    // Initialize the tournament data structure for each day
    Object.keys(tournamentData.days).forEach(dayId => {
      const dayRef = ref(database, `tournamentData/${tournamentId}/${dayId}`);
      set(dayRef, {
        players: {},
        comments: {}
      });
    });
    
    // Select the newly created tournament and set view to detail
    setSelectedTournament({
      id: tournamentId,
      ...tournamentData
    });
    setSelectedDay('day1');
    setView('tournament-detail');
  };
  
  // Function to delete a tournament
  const deleteTournament = (tournamentId) => {
    // Find the tournament to check if the current user is the creator
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      console.error('Tournament not found');
      return;
    }
    
    // Only allow deletion if current user is the creator
    if (tournament.creator !== currentUser) {
      console.error('Only the tournament creator can delete this tournament');
      return;
    }
    
    // Remove the tournament from the tournaments collection
    const tournamentRef = ref(database, `tournaments/${tournamentId}`);
    remove(tournamentRef)
      .then(() => {
        // Also remove the tournament data
        const tournamentDataRef = ref(database, `tournamentData/${tournamentId}`);
        return remove(tournamentDataRef);
      })
      .then(() => {
        // If the deleted tournament was selected, go back to the tournament list
        if (selectedTournament && selectedTournament.id === tournamentId) {
          setSelectedTournament(null);
          setView('tournaments');
        }
      })
      .catch(error => {
        console.error('Error deleting tournament:', error);
      });
  };
  
  // Function to select a tournament
  const selectTournament = (tournament) => {
    setSelectedTournament(tournament);
    setSelectedDay('day1'); // Default to first day
    setView('tournament-detail');
  };
  
  // Function to select a day
  const selectDay = (dayId) => {
    setSelectedDay(dayId);
  };
  
  // Function to add a new player
  const addPlayer = (name) => {
    if (!selectedTournament || !selectedDay) return;
    
    const tournamentId = selectedTournament.id;
    
    const playersRef = ref(database, `tournamentData/${tournamentId}/${selectedDay}/players`);
    const newPlayerRef = push(playersRef);
    
    set(newPlayerRef, {
      name,
      scores: Array(numberOfHoles).fill(null)
    });
  };
  
  // Function to remove a player
  const removePlayer = (playerId) => {
    if (!selectedTournament || !selectedDay) return;
    
    const tournamentId = selectedTournament.id;
    
    const playerRef = ref(database, `tournamentData/${tournamentId}/${selectedDay}/players/${playerId}`);
    remove(playerRef);
  };
  
  // Function to update a player's score for a specific hole
  const updateScore = (playerId, holeIndex, score) => {
    if (!selectedTournament || !selectedDay) return;
    
    // Get the current player to update just the scores array
    const player = players.find(p => p.id === playerId);
    if (player) {
      const newScores = [...player.scores];
      newScores[holeIndex] = score;
      
      const tournamentId = selectedTournament.id;
      
      const playerScoresRef = ref(database, `tournamentData/${tournamentId}/${selectedDay}/players/${playerId}/scores`);
      set(playerScoresRef, newScores);
    }
  };
  
  // Function to add a new comment
  const addComment = (comment) => {
    if (!selectedTournament || !selectedDay) return;
    
    const tournamentId = selectedTournament.id;
    
    const commentsRef = ref(database, `tournamentData/${tournamentId}/${selectedDay}/comments`);
    const newCommentRef = push(commentsRef);
    
    set(newCommentRef, {
      playerName: comment.playerName,
      text: comment.text,
      timestamp: comment.timestamp
    });
  };
  
  // Function to remove a comment
  const removeComment = (commentId) => {
    if (!selectedTournament || !selectedDay) return;
    
    const tournamentId = selectedTournament.id;
    
    const commentRef = ref(database, `tournamentData/${tournamentId}/${selectedDay}/comments/${commentId}`);
    remove(commentRef);
  };
  
  // Function to handle user login/logout
  const handleUserLogin = (username) => {
    setCurrentUser(username);
  };
  
  const handleUserLogout = () => {
    setCurrentUser('');
  };
  
  const handleBackToTournaments = () => {
    setSelectedTournament(null);
    setView('tournaments');
  };
  
  if (loading) {
    return <div className="loading">Loading tournament data...</div>;
  }
  
  // Render login screen if user is not logged in
  if (!currentUser) {
    return <UserLogin onLogin={handleUserLogin} />;
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Golf Trips</h1>
        <div className="user-info">
          Logged in as: <span className="username">{currentUser}</span>
          <button onClick={handleUserLogout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <main className="App-main">
        {view === 'tournaments' && (
          <TournamentList 
            tournaments={tournaments} 
            onSelectTournament={selectTournament}
            onCreateTournament={() => setView('create-tournament')}
            onDeleteTournament={deleteTournament}
            currentUser={currentUser}
          />
        )}
        
        {view === 'create-tournament' && (
          <TournamentCreate 
            onCreateTournament={createTournament}
            onCancel={() => setView('tournaments')}
            currentUser={currentUser}
          />
        )}
        
        {view === 'tournament-detail' && selectedTournament && (
          <TournamentDetail
            tournament={selectedTournament}
            selectedDay={selectedDay}
            onSelectDay={selectDay}
            onBackToTournaments={handleBackToTournaments}
            players={players}
            holes={numberOfHoles}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onScoreChange={updateScore}
            onAddComment={addComment}
            onDeleteComment={removeComment}
            comments={comments}
            currentUser={currentUser}
            onDeleteTournament={deleteTournament}
          />
        )}
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Golf Tournament Tracker</p>
      </footer>
    </div>
  );
}

export default App;
