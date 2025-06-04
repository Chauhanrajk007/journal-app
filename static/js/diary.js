import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const textarea = document.getElementById("entry");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmail = document.getElementById("user-email");
  let autoSaveTimer;

  // Logout functionality
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "/";
    }).catch((error) => {
      alert("Logout failed: " + error.message);
    });
  });

  // Auth state change handling
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Not logged in.");
      window.location.href = "/";
    } else {
      userEmail.textContent = user.email || "👤";
    }
  });

  // Manual save functionality
  saveBtn.addEventListener("click", async () => {
    const content = textarea.value.trim();
    const dateKey = new Date().toISOString().split('T')[0];

    if (!content) {
      alert("Write something first!");
      return;
    }

    try {
      await setDoc(doc(db, "journals", auth.currentUser.uid + "_" + dateKey), {
        content,
        date: dateKey,
        uid: auth.currentUser.uid
      });
      alert("Journal entry saved!");
      textarea.value = "";
    } catch (err) {
      alert("Error saving journal: " + err.message);
    }
  });

  // Auto-save functionality
  textarea.addEventListener("input", () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveEntry, 3000); // 3 seconds of inactivity
  });

  async function saveEntry() {
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
    } catch (err) {
      console.error("Auto-save error:", err.message);
    }
  }
});
