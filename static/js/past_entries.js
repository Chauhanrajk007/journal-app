// --- past_entries.js ---
import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, setDoc, doc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// DOM Elements
const entriesContainer = document.getElementById("entries-container");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeModalBtn = document.getElementById("close-modal");

// Error Modal
function showError(message) {
  errorMessage.textContent = message;
  errorModal.classList.remove("hidden");
}
closeModalBtn?.addEventListener("click", () => errorModal.classList.add("hidden"));

// Show hide confirm popup near button
function confirmHide(entryEl, docId, btnEl) {
  // Remove old popup
  document.querySelectorAll(".hide-popup").forEach(el => el.remove());

  const popup = document.createElement("div");
  popup.className = "hide-popup";
  popup.innerHTML = `
    <div class="popup-card">
      <p>Hide this entry?</p>
      <div class="popup-actions">
        <button class="cancel-btn">Cancel</button>
        <button class="confirm-btn">Hide</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Position near eye button
  const rect = btnEl.getBoundingClientRect();
  popup.style.top = `${window.scrollY + rect.bottom + 8}px`;
  popup.style.left = `${rect.left}px`;

  popup.querySelector(".cancel-btn").onclick = () => popup.remove();
  popup.querySelector(".confirm-btn").onclick = async () => {
    try {
      await setDoc(doc(db, "journals", docId), { hidden: true }, { merge: true });
      entryEl.remove();
    } catch (e) {
      showError("Failed to hide entry. Try again.");
    } finally {
      popup.remove();
    }
  };
}

// PDF Download
function downloadAsPDF(entryEl, date) {
  html2pdf().from(entryEl).set({
    margin: 0.5,
    filename: `Journal_${date}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }).save();
}

// Search Filter
window.handleSearch = function (term) {
  const entries = document.querySelectorAll(".entry");
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    entry.style.display = text.includes(term.toLowerCase()) ? "block" : "none";
  });
};

// Load entries from Firestore
onAuthStateChanged(auth, async user => {
  if (!user) return (window.location.href = "/");

  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    entriesContainer.innerHTML = "";

    if (snapshot.empty) {
      entriesContainer.innerHTML = "<p>No journal entries found.</p>";
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.hidden) return;

      const entryEl = document.createElement("div");
      entryEl.className = "entry entry-card";

      entryEl.innerHTML = `
        <div class="entry-header">
          <div class="entry-date">${data.date}</div>
          <button class="hide-entry-btn" title="Hide Entry"></button>
        </div>
        <div class="entry-content">${data.content.replace(/\n/g, "<br>")}</div>
        <button class="download-btn">📥 Download</button>
      `;

      entryEl.querySelector(".hide-entry-btn").addEventListener("click", (e) => {
        confirmHide(entryEl, docSnap.id, e.currentTarget);
      });

      entryEl.querySelector(".download-btn").addEventListener("click", () => {
        downloadAsPDF(entryEl, data.date);
      });

      entriesContainer.appendChild(entryEl);
    });
  } catch (err) {
    console.error(err);
    showError("Failed to load journal entries.");
  }
});
