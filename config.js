// Syntix — Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJpB6W2rEmK-_9UrMziTXVdN9tnO4AC-o",
  authDomain: "syntix-b5c57.firebaseapp.com",
  projectId: "syntix-b5c57",
  storageBucket: "syntix-b5c57.firebasestorage.app",
  messagingSenderId: "316671040037",
  appId: "1:316671040037:web:cd3ff92fb706964c3dbdcc",
  measurementId: "G-CR7DTE37TG"
};

// Export config for other scripts if using ES modules
if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
}