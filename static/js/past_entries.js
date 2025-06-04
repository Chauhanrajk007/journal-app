import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.getElementById("loadEntriesBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to view your past entries.");
    return;
  }

  const dropdown = document.getElementById("entryDropdown");
  dropdown.innerHTML = `<option value="">Select a date</option>`; // Clear old options

  const q = query(collection(db, "journals"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  const entries = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    entries[data.date] = data.content;
    const option = document.createElement("option");
    option.value = data.date;
    option.textContent = data.date;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", () => {
    const selected = dropdown.value;
    document.getElementById("entryContent").textContent = entries[selected] || "No entry found.";
  });
});
