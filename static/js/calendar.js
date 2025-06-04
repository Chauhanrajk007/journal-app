import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// References
const datePicker = document.getElementById("datePicker");
const entryDisplay = document.getElementById("entryDisplay");
const flipbook = document.querySelector(".flipbook");

// Load user's journal dates
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please log in to view past entries.");
    window.location.href = "/"; // redirect if not logged in
    return;
  }

  const journalRef = collection(db, "journals");
  const q = query(journalRef, where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);

  const dates = [];
  querySnapshot.forEach(doc => {
    dates.push(doc.data().date);
  });

  // Sort descending
  dates.sort((a, b) => new Date(b) - new Date(a));

  // Populate dropdown
  dates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    datePicker.appendChild(option);
  });
});

// Show entry with flip animation
datePicker.addEventListener("change", async () => {
  const selectedDate = datePicker.value;
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "journals", `${user.uid}_${selectedDate}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    entryDisplay.value = docSnap.data().content;

    // Trigger flip animation
    flipbook.classList.remove("flipped"); // reset
    void flipbook.offsetWidth; // force reflow
    flipbook.classList.add("flipped");
  } else {
    entryDisplay.value = "No entry found for this date.";
  }
});
