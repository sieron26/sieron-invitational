import React, { useState } from 'react';
import './UserLogin.css';

const UserLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to The Sieron Invitational</h2>
        <p className="login-message">Please enter your name to continue</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="username-input"
            required
          />
          <button type="submit" className="login-button">Continue</button>
        </form>
        
        <p className="login-note">
          This will be used to identify you for score updates and comments.
        </p>
      </div>
    </div>
  );
};

export default UserLogin; 