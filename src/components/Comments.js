import React, { useState } from 'react';
import './Comments.css';

const Comments = ({ comments, addComment, removeComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [playerName, setPlayerName] = useState(currentUser || '');

  // Update playerName if currentUser changes
  React.useEffect(() => {
    setPlayerName(currentUser || '');
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && playerName.trim()) {
      addComment({
        id: Date.now(),
        playerName: playerName.trim(),
        text: newComment.trim(),
        timestamp: new Date().toISOString()
      });
      setNewComment('');
    }
  };

  // Check if the comment was made by the current user
  const isCurrentUserComment = (commentPlayerName) => {
    return currentUser === commentPlayerName;
  };

  return (
    <div className="comments-container">
      <h3>Comments</h3>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          className="player-name-input"
          required
          disabled
        />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment about the round..."
          className="comment-input"
          required
        />
        <button type="submit" className="post-button">Post Comment</button>
      </form>
      
      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map(comment => {
            const isOwnComment = isCurrentUserComment(comment.playerName);
            
            return (
              <div key={comment.id} className={`comment ${isOwnComment ? 'own-comment' : ''}`}>
                <div className="comment-header">
                  <span className="comment-author">{comment.playerName}</span>
                  <div className="comment-actions">
                    <span className="comment-time">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                    {isOwnComment && (
                      <button 
                        className="delete-comment-button" 
                        onClick={() => removeComment(comment.id)}
                        title="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            );
          })
        ) : (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default Comments; 