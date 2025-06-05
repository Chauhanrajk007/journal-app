// --- past_entries.js ---
import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, getDoc, setDoc, doc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// DOM Elements
const entriesContainer = document.getElementById("entries-container");
const searchBar = document.getElementById("searchBar");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeModalBtn = document.getElementById("close-modal");
let secretCode = "";

// Show Error
function showError(message) {
  if (errorModal && errorMessage) {
    errorMessage.textContent = message;
    errorModal.classList.remove("hidden");
  } else {
    alert(message);
  }
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    errorModal.classList.add("hidden");
  });
}

// Confirm hide popup
function confirmHide(entryEl, docId) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  overlay.innerHTML = `
    <div class="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full animate-fade-in">
      <h2 class="text-lg font-semibold mb-4">Are you sure you want to hide this entry?</h2>
      <div class="flex justify-end gap-4">
        <button id="cancelHideBtn" class="bg-gray-400 px-4 py-2 rounded-md">Cancel</button>
        <button id="confirmHideBtn" class="bg-red-600 text-white px-4 py-2 rounded-md">Hide</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("cancelHideBtn").onclick = () => overlay.remove();
  document.getElementById("confirmHideBtn").onclick = async () => {
    const entryRef = doc(db, "journals", docId);
    await setDoc(entryRef, { hidden: true }, { merge: true });
    entryEl.remove();
    overlay.remove();
  };
}

// Search functionality
window.handleSearch = function (term) {
  const entries = document.querySelectorAll(".entry");
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    entry.style.display = text.includes(term.toLowerCase()) ? "block" : "none";
  });
};

// Download as PDF
function downloadAsPDF(content, date) {
  const element = document.createElement("a");
  const blob = new Blob([content], { type: 'application/pdf' });
  element.href = URL.createObjectURL(blob);
  element.download = `Journal_${date}.pdf`;
  element.click();
}

// Load entries
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    entriesContainer.innerHTML = "";

    if (querySnapshot.empty) {
      entriesContainer.innerHTML = "<p>No journal entries found.</p>";
      return;
    }

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.hidden) return;

      const entryEl = document.createElement("div");
      entryEl.className = "entry entry-card";

      entryEl.innerHTML = `
        <div class="entry-header flex justify-between items-center">
          <div class="entry-date">${data.date}</div>
          <div class="space-x-2">
            <button class="hide-entry-btn" title="Hide Entry">🔒</button>
            <button class="download-entry-btn" title="Download PDF">📥</button>
          </div>
        </div>
        <div class="entry-content">${data.content.replace(/\n/g, "<br>")}</div>
        <small>Last updated: ${new Date(data.updatedAt).toLocaleString()}</small>
      `;

      entryEl.querySelector(".hide-entry-btn").addEventListener("click", () => {
        confirmHide(entryEl, docSnap.id);
      });

      entryEl.querySelector(".download-entry-btn").addEventListener("click", () => {
        downloadAsPDF(data.content, data.date);
      });

      entriesContainer.appendChild(entryEl);
    });
  } catch (err) {
    console.error("Error loading entries:", err);
    showError("Failed to load journal entries. Please try again.");
  }
});
