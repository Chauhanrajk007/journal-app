// --- journal.js (Main Logic for All Features: Set Secret Code, Hide Entries, Redirect, Download) ---

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

// Prompt for secret code
async function promptForSecretCode(uid) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full animate-fade-in">
      <h2 class="text-lg font-semibold mb-4">Set your secret code</h2>
      <input type="text" id="secretCodeInput" class="w-full border px-3 py-2 rounded-md mb-4" placeholder="Enter secret code">
      <button id="saveCodeBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Save</button>
    </div>
  `;
  document.body.appendChild(modal);

  return new Promise(resolve => {
    document.getElementById("saveCodeBtn").addEventListener("click", async () => {
      const value = document.getElementById("secretCodeInput").value.trim();
      if (value) {
        const settingsRef = doc(db, "users", uid, "settings", "secretCode");
        await setDoc(settingsRef, { value });
        secretCode = value;
        modal.remove();
        resolve();
      }
    });
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

// Handle search
window.handleSearch = function (term) {
  if (term === secretCode && secretCode) {
    window.location.href = "/hidden";
    return;
  }

  const entries = document.querySelectorAll(".entry");
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    entry.style.display = text.includes(term.toLowerCase()) ? "block" : "none";
  });
};

// Download entry as PDF
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

  const settingsRef = doc(db, "users", user.uid, "settings", "secretCode");
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    secretCode = settingsSnap.data().value;
  } else {
    await promptForSecretCode(user.uid);
  }

  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      where("hidden", "==", false),
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
