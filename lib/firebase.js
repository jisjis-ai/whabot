import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

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
export const database = getDatabase(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;