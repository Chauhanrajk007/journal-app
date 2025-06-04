// auth.js
import { auth } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      auth.signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = "entry.html")
        .catch(err => alert(err.message));
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
      const confirm = document.getElementById("signupConfirm").value;

      if (password !== confirm) {
        alert("Passwords do not match!");
        return;
      }

      auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert("Signup successful! You can now log in."))
        .catch(err => alert(err.message));
    });
  }
});
