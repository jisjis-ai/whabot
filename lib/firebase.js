import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCxCW_JbUn1Dgok5oNr-jaHh9IRlHahkU4",
  authDomain: "marketing-whatsapp-pro.firebaseapp.com",
  databaseURL: "https://marketing-whatsapp-pro-default-rtdb.firebaseio.com",
  projectId: "marketing-whatsapp-pro",
  storageBucket: "marketing-whatsapp-pro.appspot.com",
  messagingSenderId: "524955368008",
  appId: "1:524955368008:web:93949efdb17a978e0b767d",
  measurementId: "G-KQMB4M1VRH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;