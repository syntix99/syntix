// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJpB6W2rEmK-_9UrMziTXVdN9tnO4AC-o",
  authDomain: "syntix-b5c57.firebaseapp.com",
  projectId: "syntix-b5c57",
  storageBucket: "syntix-b5c57.firebasestorage.app",
  messagingSenderId: "316671040037",
  appId: "1:316671040037:web:cd3ff92fb706964c3dbdcc",
  measurementId: "G-CR7DTE37TG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);