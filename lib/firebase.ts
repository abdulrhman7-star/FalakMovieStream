// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  projectId: "climbing-inscriber-9lcf1",
  apiKey: "AIzaSyDttlSQPSsl8qUcDaMmFJpcaboG-2tWBfk",
  authDomain: "climbing-inscriber-9lcf1.firebaseapp.com",
  storageBucket: "climbing-inscriber-9lcf1.firebasestorage.app",
  messagingSenderId: "1026442940834",
  appId: "1:1026442940834:web:985e388428322b9c50a2fb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
