// Responsabilidade: Centralizar toda a configuração e inicialização do Firebase.

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setLogLevel } from "firebase/firestore";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// --- ATENÇÃO: PASSO 1 DE PUBLICAÇÃO ---
// Cole aqui o objeto de configuração do seu projeto Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyAK_nE3ivcSgTCggs8y74jVenrlraBxHX4",
  authDomain: "lp-tools-5c922.firebaseapp.com",
  projectId: "lp-tools-5c922",
  storageBucket: "lp-tools-5c922.appspot.com", // corrigido para o domínio correto
  messagingSenderId: "761574806352",
  appId: "1:761574806352:web:ed1d66477f101d8c6c5255"
};

// Inicializa os serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
setLogLevel('debug');

// Exporta as instâncias e funções para serem usadas em outras partes da aplicação
export { 
    db, 
    auth, 
    googleProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
};
