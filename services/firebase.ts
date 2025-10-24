import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  User,
  // FIX: Import `createUserWithEmailAndPassword` to allow new admin account creation.
  createUserWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBybr54q7CGz3SvRQ0LMFPq6bST4uQmiZ0",
  authDomain: "hi-drawpix.firebaseapp.com",
  projectId: "hi-drawpix",
  storageBucket: "hi-drawpix.firebasestorage.app",
  messagingSenderId: "1028714121791",
  appId: "1:1028714121791:web:dce4707a92bb9982fcc68a",
  measurementId: "G-8K4BREDZJ1"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Export auth functions and types
export {
  auth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  // FIX: Export `createUserWithEmailAndPassword` so it can be used in the sign-up component.
  createUserWithEmailAndPassword,
};
export type { User };