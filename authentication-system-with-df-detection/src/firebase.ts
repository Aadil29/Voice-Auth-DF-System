// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBEctrK3fc2BNUY_Na8x3Y45tgHOcDL5bY",
  authDomain: "voice-authentication-sys-5403b.firebaseapp.com",
  projectId: "voice-authentication-sys-5403b",
  storageBucket: "voice-authentication-sys-5403b.firebasestorage.app",
  messagingSenderId: "938963172644",
  appId: "1:938963172644:web:5401ccdaaed919238087b1",
  measurementId: "G-3WRH3EXQDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);





