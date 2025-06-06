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
const loadingState = document.getElementById("loading-state");

function showLoading() {
  if (loadingState) loadingState.style.display = 'block';
}
function hideLoading() {
  if (loadingState) loadingState.style.display = 'none';
}

// Error Modal
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

// Hide Entry
async function hideEntry(entryEl, docId) {
  try {
    await setDoc(doc(db, "journals", docId), { hidden: true }, { merge: true });
    entryEl.remove();
  } catch (e) {
    showError("Failed to hide entry. Try again.");
  }
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

// Share Entry (copy content to clipboard)
function shareEntry(content, date) {
  const text = `📝 Journal Entry (${date}):\n\n${content}`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Entry copied to clipboard!");
  }).catch(() => {
    showError("Failed to copy content.");
  });
}

// Dropdown Close on Outside Click
document.addEventListener("click", function (e) {
  document.querySelectorAll(".dropdown-menu").forEach(menu => {
    if (!menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });
});

// Create Entry Card
function createEntryCard(data, docId) {
  const entryEl = document.createElement("div");
  entryEl.className = "entry entry-card";

  const contentText = data.content.replace(/\n/g, "<br>");

  entryEl.innerHTML = `
    <div class="entry-header">
      <div class="entry-date">${data.date}</div>
      <div class="entry-menu">
        <button class="menu-btn">⋮</button>
        <div class="dropdown-menu" style="display: none;">
          <button class="menu-item hide-btn">🔒 Hide</button>
          <button class="menu-item download-btn">📥 Download</button>
          <button class="menu-item share-btn">🔗 Share</button>
        </div>
      </div>
    </div>
    <div class="entry-content">${contentText}</div>
  `;

  const menuBtn = entryEl.querySelector(".menu-btn");
  const dropdown = entryEl.querySelector(".dropdown-menu");

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dropdown-menu").forEach(m => m.style.display = "none");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });

  entryEl.querySelector(".hide-btn").addEventListener("click", () => {
    dropdown.style.display = "none";
    hideEntry(entryEl, docId);
  });

  entryEl.querySelector(".download-btn").addEventListener("click", () => {
    dropdown.style.display = "none";
    downloadAsPDF(entryEl, data.date);
  });

  entryEl.querySelector(".share-btn").addEventListener("click", () => {
    dropdown.style.display = "none";
    shareEntry(data.content, data.date);
  });

  return entryEl;
}

// Search Filter
window.handleSearch = function (term) {
  const entries = document.querySelectorAll(".entry");
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    entry.style.display = text.includes(term.toLowerCase()) ? "block" : "none";
  });
};

// Load entries
onAuthStateChanged(auth, async user => {
  if (!user) return (window.location.href = "/");
  showLoading();
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
      const entryEl = createEntryCard(data, docSnap.id);
      entriesContainer.appendChild(entryEl);
    });
  } catch (err) {
    console.error(err);
    showError("Failed to load journal entries.");
  } finally {
    hideLoading();
  }
});
