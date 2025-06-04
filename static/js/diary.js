import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("entry");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmail = document.getElementById("user-email");
  const journal = document.querySelector(".journal");
  let pageCount = 1;

  // Display user email
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Not logged in.");
      window.location.href = "/";
    } else {
      userEmail.textContent = user.email || "👤";
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "/");
  });

  // Animate book opening on first focus
  textarea.addEventListener("focus", () => {
    journal.classList.add("open-book");
  }, { once: true });

  // Auto-save after every word
  textarea.addEventListener("input", () => {
    autoSave();
    handlePageOverflow();
  });

  async function autoSave() {
    const content = textarea.value.trim();
    const dateKey = new Date().toISOString().split('T')[0];

    if (!auth.currentUser || !content) return;

    try {
      await setDoc(doc(db, "journals", auth.currentUser.uid + "_" + dateKey), {
        content,
        date: dateKey,
        uid: auth.currentUser.uid
      });
      console.log("Auto-saved!");
      journal.classList.add("close-book");
      setTimeout(() => journal.classList.remove("close-book"), 1000);
    } catch (err) {
      console.error("Auto-save error:", err.message);
    }
  }

  function handlePageOverflow() {
    if (textarea.scrollHeight > textarea.clientHeight + 40) {
      const newPage = document.createElement("textarea");
      newPage.placeholder = "Next Page...";
      newPage.className = "extra-page";
      newPage.style.animation = "flip-page 0.7s ease-in-out";
      journal.appendChild(newPage);
      newPage.focus();

      newPage.addEventListener("input", autoSave);
    }
  }
});
