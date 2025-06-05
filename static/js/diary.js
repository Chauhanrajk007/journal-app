import { auth, db } from './firebase-config.js';
import { doc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
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
  const now = new Date();

  if (!user || !content.trim()) return;

  try {
    // Create a new document with auto-generated ID
    await addDoc(collection(db, "journals"), {
      content,
      date: now.toISOString(),  // Full timestamp
      dateKey: now.toISOString().split('T')[0], // Just the date part
      uid: user.uid,
      createdAt: now.getTime() // Timestamp for sorting
    });
    
    message.textContent = "Saved ✔️";
  } catch (err) {
    message.textContent = "Failed to save ❌";
    console.error("Save failed:", err);
  }
}
