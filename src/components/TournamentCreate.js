import React, { useState, useEffect } from 'react';
import './TournamentCreate.css';

const TournamentCreate = ({ onCreateTournament, onCancel, currentUser }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [dayTitles, setDayTitles] = useState({day1: 'Golf Scorecard'});
  const [formErrors, setFormErrors] = useState({});
  
  // Helper function to add days to a date string (YYYY-MM-DD format)
  const addDaysToDateString = (dateString, daysToAdd) => {
    // Parse the date parts from the string
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create a new date object using local date parts (to avoid timezone issues)
    // JavaScript months are 0-indexed (0 = January, 11 = December)
    const date = new Date(year, month - 1, day);
    
    // Add the days - ensure we're operating on the local date
    date.setDate(date.getDate() + daysToAdd);
    
    // Format back to YYYY-MM-DD using local date components
    const newYear = date.getFullYear();
    // getMonth() returns 0-11, so add 1 and ensure 2 digits with padStart
    const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    // Ensure 2 digits with padStart
    const newDay = date.getDate().toString().padStart(2, '0');
    
    return `${newYear}-${newMonth}-${newDay}`;
  };
  
  // Update day titles when number of days changes
  useEffect(() => {
    // Create default titles for each day
    const newDayTitles = {};
    for (let i = 1; i <= numberOfDays; i++) {
      // Preserve existing titles or create default ones
      newDayTitles[`day${i}`] = dayTitles[`day${i}`] || `Round ${i}`;
    }
    setDayTitles(newDayTitles);
  }, [numberOfDays]);
  
  useEffect(() => {
    // When start date changes, set end date based on number of days
    if (startDate) {
      try {
        const calculatedEndDate = addDaysToDateString(startDate, numberOfDays - 1);
        setEndDate(calculatedEndDate);
      } catch (error) {
        console.error('Error calculating end date:', error);
      }
    }
  }, [startDate, numberOfDays]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Tournament name is required';
    }
    
    if (!location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (numberOfDays < 1) {
      errors.numberOfDays = 'Number of days must be at least 1';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleDayTitleChange = (day, title) => {
    setDayTitles(prev => ({
      ...prev,
      [day]: title
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Log the input values for debugging
      console.log('Creating tournament with start date:', startDate);
      
      const tournament = {
        name,
        location,
        startDate,
        endDate,
        numberOfDays: parseInt(numberOfDays),
        creator: currentUser,
        createdAt: new Date().toISOString(),
        days: {}
      };
      
      // Initialize the days structure with empty data
      for (let i = 1; i <= numberOfDays; i++) {
        // Calculate the date for this day by adding (i-1) days to the start date
        const dayDate = addDaysToDateString(startDate, i - 1);
        const dayKey = `day${i}`;
        
        tournament.days[dayKey] = {
          date: dayDate,
          title: dayTitles[dayKey] || `Round ${i}`,
          players: [],
          comments: []
        };
      }
      
      // Log the tournament days for debugging
      console.log('Tournament days created:', Object.entries(tournament.days).map(([key, value]) => ({
        day: key,
        date: value.date,
        title: value.title
      })));
      
      onCreateTournament(tournament);
    }
  };
  
  return (
    <div className="tournament-create-container">
      <div className="tournament-create-header">
        <h2>Create New Tournament</h2>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="tournament-form">
        <div className="form-group">
          <label htmlFor="name">Tournament Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formErrors.name ? 'error' : ''}
          />
          {formErrors.name && <span className="error-message">{formErrors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={formErrors.location ? 'error' : ''}
          />
          {formErrors.location && <span className="error-message">{formErrors.location}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={formErrors.startDate ? 'error' : ''}
          />
          {formErrors.startDate && <span className="error-message">{formErrors.startDate}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="numberOfDays">Number of Days</label>
          <input
            type="number"
            id="numberOfDays"
            min="1"
            max="14"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
            className={formErrors.numberOfDays ? 'error' : ''}
          />
          {formErrors.numberOfDays && <span className="error-message">{formErrors.numberOfDays}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate">End Date (Auto-calculated)</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            disabled
          />
        </div>
        
        <h3 className="day-titles-header">Scorecard Titles</h3>
        <div className="day-titles-container">
          {[...Array(numberOfDays)].map((_, index) => {
            const day = `day${index + 1}`;
            return (
              <div key={day} className="form-group day-title-group">
                <label htmlFor={`title-${day}`}>Day {index + 1} Title</label>
                <input
                  type="text"
                  id={`title-${day}`}
                  value={dayTitles[day] || ''}
                  onChange={(e) => handleDayTitleChange(day, e.target.value)}
                  placeholder={`Day ${index + 1} Scorecard`}
                />
              </div>
            );
          })}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="create-button">Create Tournament</button>
        </div>
      </form>
    </div>
  );
};

export default TournamentCreate; 