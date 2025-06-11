// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Adicionado: setPersistence e browserLocalPersistence
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYqBKmX18YHkZJ8_fO7ScLhs5YjxCV5K4",
  authDomain: "prj-financeiro.firebaseapp.com",
  projectId: "prj-financeiro",
  storageBucket: "prj-financeiro.firebasestorage.app",
  messagingSenderId: "154916115014",
  appId: "1:154916115014:web:ead9ec9e0fceafca67b047",
  measurementId: "G-MK4MEVY67B" // Mantido o measurementId que você já tinha
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Configurar a persistência do Firebase Auth ---
// Isso deve ser feito ANTES de qualquer tentativa de login ou verificação de estado de autenticação.
// Define que a sessão do usuário deve persistir no armazenamento local do navegador.
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistência do Firebase Auth configurada para LOCAL.");
    // Agora que a persistência está definida, a lógica de login ou verificação
    // de estado de autenticação (como no seu onAuthStateChanged) vai funcionar como esperado.
  })
  .catch((error) => {
    // Caso ocorra um erro ao configurar a persistência, você pode tratá-lo aqui.
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Erro ao configurar a persistência do Firebase Auth:", errorCode, errorMessage);
  });

export { auth, db };
