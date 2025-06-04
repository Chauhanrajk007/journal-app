import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.getElementById("saveEntry").addEventListener("click", async () => {
  const entry = document.getElementById("journalEntry").value;
  const user = auth.currentUser;

  if (!user) {
    alert("Not logged in!");
    return;
  }

  const dateKey = new Date().toISOString().split('T')[0]; // e.g., "2025-06-04"

  try {
    await setDoc(doc(db, "journals", user.uid + "_" + dateKey), {
      content: entry,
      date: dateKey,
      uid: user.uid
    });
    alert("Journal entry saved!");
  } catch (err) {
    alert("Failed to save: " + err.message);
  }
});
