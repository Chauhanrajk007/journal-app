import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmail = document.getElementById("user-email");
  const journal = document.querySelector(".journal");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Not logged in.");
      window.location.href = "/";
    } else {
      userEmail.textContent = user.email || "👤";
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "/");
  });

  // Watch all textareas for input
  function handleInput(event) {
    autoSave(event.target);
    handlePageOverflow(event.target);
  }

  function bindInputToPage(page) {
    page.addEventListener("input", handleInput);
    page.addEventListener("focus", () => {
      journal.classList.add("open-book");
    }, { once: true });
  }

  // Bind first page
  const firstPage = document.getElementById("entry");
  bindInputToPage(firstPage);

  async function autoSave(textarea) {
    const content = textarea.value.trim();
    const dateKey = new Date().toISOString().split('T')[0];

    if (!auth.currentUser || !content) return;

    try {
      await setDoc(doc(db, "journals", auth.currentUser.uid + "_" + dateKey), {
        content,
        date: dateKey,
        uid: auth.currentUser.uid
      });
      journal.classList.add("close-book");
      setTimeout(() => journal.classList.remove("close-book"), 800);
    } catch (err) {
      console.error("Auto-save error:", err.message);
    }
  }

  function handlePageOverflow(textarea) {
    const padding = 40;
    const hasOverflowed = textarea.scrollHeight > textarea.clientHeight + padding;
    const isLast = journal.lastElementChild === textarea;

    if (hasOverflowed && isLast) {
      const newPage = document.createElement("textarea");
      newPage.placeholder = "Next Page...";
      newPage.className = "extra-page";
      newPage.style.animation = "flip-page 0.7s ease-in-out";
      journal.appendChild(newPage);
      bindInputToPage(newPage);
      newPage.focus();
    }
  }
});
