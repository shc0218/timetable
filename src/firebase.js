// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWLdy5twKyuW1IHcryWWKaaBv1Ju8faT4",
  authDomain: "timetab-78dae.firebaseapp.com",
  databaseURL: "https://timetab-78dae-default-rtdb.firebaseio.com",
  projectId: "timetab-78dae",
  storageBucket: "timetab-78dae.firebasestorage.app",
  messagingSenderId: "216613351965",
  appId: "1:216613351965:web:1380eb3b0047c3bedf4cf4"
  
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);;
export const db = getDatabase(app);
export const auth = getAuth(app);
