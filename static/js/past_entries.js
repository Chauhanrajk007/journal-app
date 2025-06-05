import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const textarea = document.getElementById("journalEntry");
const message = document.getElementById("message");
const emailDisplay = document.getElementById("email-display");
const logoutBtn = document.getElementById("logoutBtn");
const saveBtn = document.getElementById("saveBtn");

let lastSavedContent = "";
let isEditing = false;

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

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "/";
  });
});

// Enable save when user types
textarea.addEventListener("input", () => {
  isEditing = true;
  saveBtn.disabled = false;
  message.textContent = "Unsaved changes...";

  const user = auth.currentUser;
  if (user) {
    localStorage.setItem(`draft_${user.uid}`, textarea.value);
  }
});

// Manual Save
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const content = textarea.value.trim();
  const dateKey = new Date().toISOString().split('T')[0];

  if (!user || !content || content === lastSavedContent) return;

  try {
    const docRef = doc(db, "journals", `${user.uid}_${dateKey}`);
    await setDoc(docRef, {
      content,
      date: dateKey,
      uid: user.uid,
      updatedAt: new Date().toISOString()
    });

    lastSavedContent = content;
    isEditing = false;
    saveBtn.disabled = true;
    localStorage.removeItem(`draft_${user.uid}`);
    message.textContent = "Saved ✔️";
  } catch (err) {
    console.error("Save failed:", err);
    message.textContent = "Failed to save ❌";
  }
});

// Warn before closing tab if there are unsaved changes
window.addEventListener("beforeunload", (e) => {
  if (isEditing) {
    e.preventDefault();
    e.returnValue = "";
  }
});
