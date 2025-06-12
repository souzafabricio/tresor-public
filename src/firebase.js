// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYqBKmX18YHkZJ8_fO7ScLhs5YjxCV5K4",
  authDomain: "prj-financeiro.firebaseapp.com",
  projectId: "prj-financeiro",
  storageBucket: "prj-financeiro.firebasestorage.app",
  messagingSenderId: "154916115014",
  appId: "1:154916115014:web:ead9ec9e0fceafca67b047",
  measurementId: "G-MK4MEVY67B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setPersistence(auth, browserLocalPersistence);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistência do Firebase Auth configurada para LOCAL.");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Erro ao configurar a persistência do Firebase Auth:", errorCode, errorMessage);
  });

export { auth, db };
