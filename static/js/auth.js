// auth.js
import { auth } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  // Show/hide sections
  window.showLogin = () => {
    document.getElementById("welcome-section").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
  };

  window.showSignup = () => {
    document.getElementById("welcome-section").classList.add("hidden");
    document.getElementById("signup-section").classList.remove("hidden");
  };

  window.backToWelcome = () => {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("signup-section").classList.add("hidden");
    document.getElementById("welcome-section").classList.remove("hidden");
  };

  // Signup form
  const signupForm = document.getElementById("signupForm");
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      window.location.href = "/diary"; // make sure this route exists in Flask
    } catch (error) {
      alert("Signup Error: " + error.message);
    }
  });

  // Login form
  const loginForm = document.getElementById("loginForm");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      window.location.href = "/diary"; // redirect to diary.html
    } catch (error) {
      alert("Login Error: " + error.message);
    }
  });
});
