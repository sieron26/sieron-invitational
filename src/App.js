import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import Scorecard from './components/Scorecard';
import Comments from './components/Comments';
import UserLogin from './components/UserLogin';
import './App.css';

function App() {
  // State for players and comments
  const [players, setPlayers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Current user state
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('golfScorecard_currentUser') || ''
  );
  
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
  
  // Load data from Firebase on component mount
  useEffect(() => {
    const playersRef = ref(database, 'players');
    const commentsRef = ref(database, 'comments');
    
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
      setLoading(false);
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
  }, [numberOfHoles]);
  
  // Function to add a new player
  const addPlayer = (name) => {
    const playersRef = ref(database, 'players');
    const newPlayerRef = push(playersRef);
    
    set(newPlayerRef, {
      name,
      scores: Array(numberOfHoles).fill(null)
    });
  };
  
  // Function to remove a player
  const removePlayer = (playerId) => {
    const playerRef = ref(database, `players/${playerId}`);
    remove(playerRef);
  };
  
  // Function to update a player's score for a specific hole
  const updateScore = (playerId, holeIndex, score) => {
    // Get the current player to update just the scores array
    const player = players.find(p => p.id === playerId);
    if (player) {
      const newScores = [...player.scores];
      newScores[holeIndex] = score;
      
      const playerScoresRef = ref(database, `players/${playerId}/scores`);
      set(playerScoresRef, newScores);
    }
  };
  
  // Function to add a new comment
  const addComment = (comment) => {
    const commentsRef = ref(database, 'comments');
    const newCommentRef = push(commentsRef);
    
    set(newCommentRef, {
      playerName: comment.playerName,
      text: comment.text,
      timestamp: comment.timestamp
    });
  };
  
  // Function to remove a comment
  const removeComment = (commentId) => {
    const commentRef = ref(database, `comments/${commentId}`);
    remove(commentRef);
  };
  
  // Function to handle user login/logout
  const handleUserLogin = (username) => {
    setCurrentUser(username);
  };
  
  const handleUserLogout = () => {
    setCurrentUser('');
  };
  
  if (loading) {
    return <div className="loading">Loading scorecard data...</div>;
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>The Sieron Invitational</h1>
        <p className="app-subtitle">All users can see and update this scorecard in real-time</p>
        {currentUser && (
          <div className="user-info">
            Logged in as: <span className="username">{currentUser}</span>
            <button onClick={handleUserLogout} className="logout-button">Logout</button>
          </div>
        )}
      </header>
      
      <main className="App-main">
        {!currentUser ? (
          <UserLogin onLogin={handleUserLogin} />
        ) : (
          <>
            <Scorecard 
              players={players} 
              addPlayer={addPlayer}
              removePlayer={removePlayer}
              updateScore={updateScore}
              holes={numberOfHoles}
              currentUser={currentUser}
            />
            
            <Comments 
              comments={comments}
              addComment={addComment}
              removeComment={removeComment}
              currentUser={currentUser}
            />
          </>
        )}
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Golf Scorecard App</p>
      </footer>
    </div>
  );
}

export default App;
