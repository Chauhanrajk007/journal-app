// diary.js
import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const textarea = document.getElementById("journalEntry");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Not logged in.");
      window.location.href = "/";
    } else {
      saveBtn.addEventListener("click", async () => {
        const content = textarea.value.trim();
        const dateKey = new Date().toISOString().split('T')[0];

        if (!content) {
          alert("Write something first!");
          return;
        }

        try {
          await setDoc(doc(db, "journals", user.uid + "_" + dateKey), {
            content,
            date: dateKey,
            uid: user.uid
          });
          alert("Journal entry saved!");
          textarea.value = "";
        } catch (err) {
          alert("Error saving journal: " + err.message);
        }
      });
    }
  });
});
