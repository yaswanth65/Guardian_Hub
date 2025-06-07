
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA3WAhKXv0KHv2YeT9Mw3DwSUrxFeN6MGs",
  authDomain: "women-safety-db143.firebaseapp.com",
  projectId: "women-safety-db143",
  storageBucket: "women-safety-db143.firebasestorage.app",
  messagingSenderId: "946838699235",
  appId: "1:946838699235:web:114cd216a32f839c4319d6",
  measurementId: "G-S3HZ7NYQSQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
