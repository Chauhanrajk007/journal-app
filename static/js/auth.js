import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  // Error box helper
  function showError(message) {
    const box = document.getElementById("auth-error");
    const text = document.getElementById("error-text");
    if (!box || !text) return;

    text.textContent = message;
    box.classList.remove("hidden");
    box.classList.add("show");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (box.classList.contains("show")) {
        box.classList.remove("show");
        box.classList.add("hidden");
      }
    }, 5000);
  }

  // UI Navigation
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

  // Login handler
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        text: 'You have logged in successfully.',
        showConfirmButton: false,
        timer: 2000
      }).then(() => {
        window.location.href = "/diary";
      });
    } catch (err) {
      showError("Login failed: " + err.message);
    }
  });

  // Signup handler
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {
      showError("Passwords do not match!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'You’ve joined the journal guild 📖✨',
        showConfirmButton: false,
        timer: 2000
      }).then(() => {
        window.location.href = "/diary";
      });
    } catch (err) {
      showError("Signup failed: " + err.message);
    }
  });
});
