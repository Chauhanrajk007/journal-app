import { auth, db } from './firebase-config.js';
import {
  collection, addDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const textarea = document.getElementById("journalEntry");
const message = document.getElementById("message");
const emailDisplay = document.getElementById("email-display");
const logoutBtn = document.getElementById("logoutBtn");
const saveBtn = document.getElementById("saveBtn");

let lastSavedContent = "";
let isEditing = false;

// Monitor auth state
onAuthStateChanged(auth, user => {
  if (user) {
    emailDisplay.textContent = user.email || "Unknown user";

    // Restore draft if exists
    const draft = localStorage.getItem(`draft_${user.uid}`);
    if (draft) {
      textarea.value = draft;
      saveBtn.disabled = false;
      isEditing = true;
      message.textContent = "Unsaved draft restored ✏️";
    }
  } else {
    window.location.href = "/";
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "/";
  });
});

// Enable Save button on input
textarea.addEventListener("input", () => {
  isEditing = true;
  saveBtn.disabled = false;
  message.textContent = "Unsaved changes...";
  const user = auth.currentUser;
  if (user) {
    localStorage.setItem(`draft_${user.uid}`, textarea.value);
  }
});

// Save new journal entry
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const content = textarea.value.trim();

  if (!user || !content || content === lastSavedContent) return;

  try {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];

    await addDoc(collection(db, "journals"), {
      content,
      date: dateKey,
      uid: user.uid,
      updatedAt: now.toISOString(),
      hidden: false
    });

    lastSavedContent = content;
    isEditing = false;
    saveBtn.disabled = true;
    textarea.value = ""; // Clear input
    localStorage.removeItem(`draft_${user.uid}`);
    message.textContent = "Saved ✔️";
  } catch (err) {
    console.error("Save failed:", err);
    message.textContent = "Failed to save ❌";
  }
});

// Warn before unload if editing
window.addEventListener("beforeunload", (e) => {
  if (isEditing) {
    e.preventDefault();
    e.returnValue = "";
  }
});
