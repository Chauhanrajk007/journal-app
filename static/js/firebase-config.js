import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
  authDomain: "journal-app-f3d32.firebaseapp.com",
  projectId: "journal-app-f3d32",
  storageBucket: "journal-app-f3d32.firebasestorage.app",
  messagingSenderId: "1071713060128",
  appId: "1:1071713060128:web:9d88c50599e3db0e0a4345",
  measurementId: "G-LP27JD6EJK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};
