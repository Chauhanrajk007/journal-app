import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginError = document.getElementById("login-error");
  const signupError = document.getElementById("signup-error");

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

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = ''; // Clear any previous error
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/diary";
    } catch (err) {
      loginError.textContent = formatAuthError(err.message);
    }
  });

  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    signupError.textContent = ''; // Clear previous error
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {
      signupError.textContent = "Passwords do not match!";
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "/diary";
    } catch (err) {
      signupError.textContent = formatAuthError(err.message);
    }
  });

  function formatAuthError(message) {
    if (message.includes("auth/invalid-email")) return "Invalid email address.";
    if (message.includes("auth/user-not-found")) return "No account found with this email.";
    if (message.includes("auth/wrong-password")) return "Incorrect password.";
    if (message.includes("auth/email-already-in-use")) return "Email is already in use.";
    if (message.includes("auth/weak-password")) return "Password should be at least 6 characters.";
    if (message.includes("auth/too-many-requests")) return "Too many login attempts. Try again later.";
    return "Something went wrong. Please try again.";
  }
});
