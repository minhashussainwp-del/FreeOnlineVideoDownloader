// Firebase client initialization.
// These web config values are publishable and safe to keep in the codebase.
// Enable the services you use (Authentication, Firestore, Storage) in the
// Firebase console, otherwise calls will error at runtime.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyARZ39jE_3XmrR-pAwYzUAl0J_3K8X2ZHc",
  authDomain: "online-video-downloader-aeaf2.firebaseapp.com",
  projectId: "online-video-downloader-aeaf2",
  storageBucket: "online-video-downloader-aeaf2.firebasestorage.app",
  messagingSenderId: "113957373471",
  appId: "1:113957373471:web:a233633d218fd15ac4b72a",
};

// Avoid re-initializing on hot reloads / SSR re-imports.
export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);
