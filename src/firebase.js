import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
// You can use environment variables or replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDHV2E_mWJvVS94jlk6cM5RUKMiR3vZTsU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "sieroninvitational.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://sieroninvitational-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "sieroninvitational",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "sieroninvitational.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "30545956495",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:30545956495:web:bb5946312bbad06128eafa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 