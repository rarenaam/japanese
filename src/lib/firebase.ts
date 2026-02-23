import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Hier halen we de geheime sleutels op uit je .env bestand
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// <--- HIER PLAATS JE DE CONSOLE.LOG REGEL
console.log("Firebase Config:", firebaseConfig);

// Initialiseer de Firebase App
const app = initializeApp(firebaseConfig);

// Exporteer de database (Firestore) en Auth voor gebruik in je andere bestanden
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
