// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
    authDomain: "journal-app-f3d32.firebaseapp.com",
    projectId: "journal-app-f3d32",
    storageBucket: "journal-app-f3d32.firebasestorage.app",
    messagingSenderId: "1071713060128",
    appId: "1:1071713060128:web:9d88c50599e3db0e0a4345",
    measurementId: "G-LP27JD6EJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const database = getDatabase(app);

// Login function
document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    signInWithEmailAndPassword(auth, email, 'your_password_here') // Replace with actual password input
        .then((userCredential) => {
            document.getElementById('login').style.display = 'none';
            document.getElementById('app').style.display = 'block';
        })
        .catch((error) => {
            console.error(error);
        });
});

// Save journal entry
document.getElementById('saveEntryBtn').addEventListener('click', () => {
    const entryText = document.getElementById('entryText').value;
    const userId = auth.currentUser .uid; // Get current user ID
    const date = new Date().toISOString().split('T')[0]; // Get today's date

    set(ref(database, 'users/' + userId + '/journal/' + date), {
        entry: entryText
    }).then(() => {
        alert('Entry saved!');
    }).catch((error) => {
        console.error(error);
    });
});
