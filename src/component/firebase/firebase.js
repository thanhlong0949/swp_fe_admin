// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAx1kZhv1LRceHFUOF4b4NDQz1npe-Z1hk",
  authDomain: "koishipping-a6bd7.firebaseapp.com",
  projectId: "koishipping-a6bd7",
  storageBucket: "koishipping-a6bd7.appspot.com",
  messagingSenderId: "1012272986603",
  appId: "1:1012272986603:web:ad0cb6b45984c114c301ae",
  measurementId: "G-Z40SNL5VH8"
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
