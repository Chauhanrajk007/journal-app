// static/js/calendar.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const datePicker = document.getElementById('datePicker');
const entryDisplay = document.getElementById('entryDisplay');

let entries = [];

window.addEventListener("DOMContentLoaded", async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login to view your diaries.");
    window.location.href = "/";
    return;
  }

  const q = query(collection(db, "journals"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    entries.push({
      id: docSnap.id,
      date: data.date,
      content: data.content
    });
  });

  entries.sort((a, b) => new Date(a.date) - new Date(b.date)); // oldest first

  entries.forEach(entry => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.date;
    datePicker.appendChild(option);
  });
});

datePicker.addEventListener("change", () => {
  const entryId = datePicker.value;
  const entry = entries.find(e => e.id === entryId);
  entryDisplay.value = entry ? entry.content : "No entry found for this date.";
});
