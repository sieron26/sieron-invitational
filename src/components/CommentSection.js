import React, { useState } from 'react';
import './CommentSection.css';

const CommentSection = ({ comments, onAddComment, onDeleteComment, currentUser }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (commentText.trim() === '') return;
    
    const newComment = {
      playerName: currentUser,
      text: commentText.trim(),
      timestamp: new Date().toISOString()
    };
    
    onAddComment(newComment);
    setCommentText('');
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="commentAuthor">Your Name</label>
            <input
              type="text"
              id="commentAuthor"
              value={currentUser}
              disabled
              className="author-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="commentText">Comment</label>
          <textarea
            id="commentText"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="comment-input"
          ></textarea>
        </div>
        
        <button type="submit" className="submit-comment">Post Comment</button>
      </form>
      
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map(comment => (
            <div 
              key={comment.id} 
              className={`comment-item ${comment.playerName === currentUser ? 'current-user-comment' : ''}`}
            >
              <div className="comment-header">
                <span className="comment-author">{comment.playerName}</span>
                <span className="comment-time">{formatDate(comment.timestamp)}</span>
              </div>
              
              <div className="comment-content">
                {comment.text}
              </div>
              
              {comment.playerName === currentUser && (
                <button 
                  className="delete-comment" 
                  onClick={() => onDeleteComment(comment.id)}
                  title="Delete comment"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection; 