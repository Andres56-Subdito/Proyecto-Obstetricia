// =====================================================================
// CONFIGURACIÓN DE FIREBASE
// =====================================================================
// Aquí se inicia la conexión con Firebase (Authentication + Firestore).
// Las claves NO se escriben en este archivo: se leen del archivo ".env.local"
// (copia ".env.example" como ".env.local" y pega tus valores de la consola de Firebase:
//  Configuración del proyecto > General > Tus apps > Configuración del SDK).
// =====================================================================
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Si faltan las claves, App.jsx muestra una pantalla de ayuda en vez de romperse.
export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null; // Inicio de sesión (correo + contraseña)
export const db = app ? getFirestore(app) : null; // Base de datos Cloud Firestore
