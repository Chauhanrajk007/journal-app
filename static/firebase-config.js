// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
    authDomain: "journal-app-f3d32.firebaseapp.com",
    databaseURL: "https://journal-app-f3d32-default-rtdb.firebaseio.com",
    projectId: "journal-app-f3d32",
    storageBucket: "journal-app-f3d32.firebasestorage.app",
    messagingSenderId: "1071713060128",
    appId: "1:1071713060128:web:9d88c50599e3db0e0a4345",
    measurementId: "G-LP27JD6EJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Make Firebase services available globally
window.auth = auth;
window.database = database;
window.dbRef = ref;
window.dbSet = set;
window.dbGet = get;
window.dbPush = push;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        window.currentUser = user;
        initializeCalendar();
        loadTodayEntry();
    } else {
        document.getElementById('auth-section').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        window.currentUser = null;
    }
});
