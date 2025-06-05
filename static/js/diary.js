import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const textarea = document.getElementById("journalEntry");
const message = document.getElementById("message");
const emailDisplay = document.getElementById("email-display");
const logoutBtn = document.getElementById("logoutBtn");

let saveTimeout;
let lastSavedContent = "";

onAuthStateChanged(auth, user => {
  if (user) {
    emailDisplay.textContent = user.email || "Unknown user";
  } else {
    window.location.href = "/";
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "/";
  });
});

textarea.addEventListener("input", () => {
  clearTimeout(saveTimeout);
  message.textContent = "Saving...";
  saveTimeout = setTimeout(autoSave, 800); // Delay reduced to minimize spam
});

async function autoSave() {
  const user = auth.currentUser;
  const content = textarea.value.trim();
  const dateKey = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

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
    message.textContent = "Saved ✔️";
  } catch (err) {
    console.error("Save failed:", err);
    message.textContent = "Failed to save ❌";
  }
}
