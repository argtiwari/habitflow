// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Login ke liye
import { getFirestore } from "firebase/firestore"; // Database ke liye

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDhEd7AAsUsDxuRMhCEfwmKxD-UcE9HsM",
  authDomain: "habitquest-rpg.firebaseapp.com",
  projectId: "habitquest-rpg",
  storageBucket: "habitquest-rpg.firebasestorage.app",
  messagingSenderId: "291285430692",
  appId: "1:291285430692:web:5bb6be2643ad905bc0d131"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services Export karein taaki App.jsx use kar sake
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);