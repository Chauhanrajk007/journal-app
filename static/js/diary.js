import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const textarea = document.getElementById("journalEntry");
const message = document.getElementById("message");
const emailDisplay = document.getElementById("email-display");
const logoutBtn = document.getElementById("logoutBtn");

let saveTimeout;

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
  saveTimeout = setTimeout(autoSave, 1000);
});

async function autoSave() {
  const user = auth.currentUser;
  const content = textarea.value;
  const dateKey = new Date().toISOString().split('T')[0];

  if (!user || !content.trim()) return;

  try {
    await setDoc(doc(db, "journals", user.uid + "_" + dateKey), {
      content,
      date: dateKey,
      uid: user.uid
    });
    message.textContent = "Saved ✔️";
  } catch (err) {
    message.textContent = "Failed to save ❌";
    console.error("Save failed:", err.message);
  }
}
