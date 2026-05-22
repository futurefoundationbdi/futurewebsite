// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // <-- AJOUTÉ

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQjj-rk-GW0jgGb27gdaKhDxhty5Uv9po",
  authDomain: "futuregeneration-web.firebaseapp.com",
  projectId: "futuregeneration-web",
  storageBucket: "futuregeneration-web.firebasestorage.app",
  messagingSenderId: "177846664890",
  appId: "1:177846664890:web:89db1fab2430d6080ecc83",
  measurementId: "G-72BGSLDZFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app); // <-- INDISPENSABLE POUR LIBRARY.TSX
