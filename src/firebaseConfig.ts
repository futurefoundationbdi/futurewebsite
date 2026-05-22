// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
