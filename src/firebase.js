import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChy5RiNRMOXNcNQjmN0Q1ImFU-RnZx_JA",
  authDomain: "ffstockupdate.firebaseapp.com",
  projectId: "ffstockupdate",
  storageBucket: "ffstockupdate.firebasestorage.app",
  messagingSenderId: "721580347970",
  appId: "1:721580347970:web:0b832da0c2a8d1371b13db",
  measurementId: "G-6XDSD083KZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally for browser safety
export let analytics;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(() => {});

export default app;
