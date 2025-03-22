# Golf Scorecard App

A live golf scorecard application that allows multiple users to track scores and comments in real-time.

## Features

- Add and remove players
- Update scores for each hole
- View front nine and back nine holes separately
- Automatic sorting of players by score (leaderboard style)
- Add comments about the round
- Real-time updates for all users

## Setup Instructions

### Running the Application Locally

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

### Setting Up Firebase for Data Persistence

This app uses Firebase Realtime Database to store scorecard data. To set up your own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "golf-scorecard-app")
4. Follow the prompts to create the project
5. Once the project is created, click on "Web" (</>) to add a web app
6. Register your app with a nickname (e.g., "golf-scorecard-web")
7. Copy the Firebase configuration object shown
8. Open the `src/firebase.js` file in this project
9. Replace the placeholder configuration with your actual Firebase config values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

10. In the Firebase Console, go to "Realtime Database" in the left sidebar
11. Click "Create Database"
12. Choose a location for your database
13. Start in test mode for development purposes (you can set up proper security rules later)

The app will now use your Firebase Realtime Database to store all scorecard data, allowing it to be accessed from any device in real-time.

## Security Considerations

For a production environment, you should set up proper security rules in Firebase. The current implementation uses the default test mode which allows anyone to read and write to your database.

## Technologies Used

- React
- Firebase Realtime Database
- CSS3
