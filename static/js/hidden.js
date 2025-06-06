import { auth, db } from './firebase-config.js';
import {
  collection, doc, getDocs, getDoc, query, where, orderBy, updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("hidden-entries-container");
// Modal elements
const modal = document.getElementById("unhide-modal");
const confirmBtn = document.getElementById("confirm-unhide");
const cancelBtn = document.getElementById("cancel-unhide");
const pinInput = document.getElementById("unhide-pin-input");
const pinError = document.getElementById("unhide-pin-error");

let selectedDocId = null;
let storedPin = null;

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  try {
    // Retrieve stored PIN from /users/{uid}
    const pinDoc = await getDoc(doc(db, "users", user.uid));
    storedPin = pinDoc.exists() ? pinDoc.data().pin : null;

    // Load hidden entries
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      where("hidden", "==", true),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No hidden entries found.</p>";
      return;
    }

    container.innerHTML = "";
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const date = data.date ? new Date(data.date).toLocaleString() : '';
      const card = document.createElement("div");
      card.className = "entry-card";
      card.innerHTML = `
        <div class="entry-header">
          <h3>${date}</h3>
          <button class="unhide-btn" data-id="${docSnap.id}">🔓 Unhide</button>
        </div>
        <p class="entry-content">${data.content}</p>
      `;
      container.appendChild(card);
    });

    // Unhide logic
    container.addEventListener("click", e => {
      if (e.target.classList.contains("unhide-btn")) {
        selectedDocId = e.target.dataset.id;
        pinInput.value = "";
        pinError.textContent = "";
        modal.classList.remove("hidden");
        pinInput.focus();
      }
    });

    confirmBtn.addEventListener("click", async () => {
      if (!selectedDocId) return;
      if (!storedPin) {
        pinError.textContent = "No PIN set. Please use the hide feature in your main journal page first.";
        return;
      }
      const enteredPin = pinInput.value.trim();
      if (enteredPin !== storedPin) {
        pinError.textContent = "Incorrect PIN. Please try again.";
        return;
      }
      await updateDoc(doc(db, "journals", selectedDocId), { hidden: false });
      modal.classList.add("hidden");
      document.querySelector(`[data-id="${selectedDocId}"]`).closest(".entry-card").remove();
      selectedDocId = null;
    });

    cancelBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      selectedDocId = null;
    });

    pinInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmBtn.click();
    });

  } catch (err) {
    console.error("Error loading hidden entries:", err);
    container.innerHTML = `<p>Error: ${err.message}</p>`;
  }
});
