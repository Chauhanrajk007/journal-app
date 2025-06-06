// --- past_entries.js ---
import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, setDoc, doc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const entriesContainer = document.getElementById("entries-container");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeModalBtn = document.getElementById("close-modal");
const loadingState = document.getElementById("loading-state");
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-search");

function showLoading() {
  if (loadingState) loadingState.style.display = 'block';
}
function hideLoading() {
  if (loadingState) loadingState.style.display = 'none';
}
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
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    handleSearch("");
    searchInput.classList.remove("highlighted");
  });
}

// Dropdown logic
function toggleDropdown(dropdown) {
  document.querySelectorAll(".dropdown-options").forEach(el => el !== dropdown && (el.style.display = "none"));
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}

// Hide logic
function confirmHide(entryEl, docId) {
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
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  }).save();
}

// Share Link
function shareEntry(content, date) {
  const text = `📓 Journal Entry - ${date}\n\n${content}`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied entry to clipboard!");
  }).catch(() => {
    showError("Copy failed. Try again.");
  });
}

// Search Logic
window.handleSearch = function (term) {
  const entries = document.querySelectorAll(".entry");
  let found = false;
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    if (text.includes(term.toLowerCase())) {
      entry.style.display = "block";
      found = true;
    } else {
      entry.style.display = "none";
    }
  });
  if (term.length > 0) {
    searchInput.classList.add("highlighted");
  } else {
    searchInput.classList.remove("highlighted");
  }
  if (!found && term.trim()) {
    entriesContainer.innerHTML += `<p>No matching entries found for: <strong>${term}</strong></p>`;
  }
};

// Load Entries
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

      const entryEl = document.createElement("div");
      entryEl.className = "entry entry-card";

      entryEl.innerHTML = `
        <div class="entry-header">
          <div class="entry-date">${data.date}</div>
          <div class="options-menu">
            <button class="menu-btn">⋮</button>
            <div class="dropdown-options">
              <button class="download-btn">📥 Download</button>
              <button class="share-btn">🔗 Share</button>
              <button class="hide-entry-btn">🙈 Hide</button>
            </div>
          </div>
        </div>
        <div class="entry-content">${data.content.replace(/\n/g, "<br>")}</div>
      `;

      const dropdown = entryEl.querySelector(".dropdown-options");
      const menuBtn = entryEl.querySelector(".menu-btn");
      menuBtn.addEventListener("click", () => toggleDropdown(dropdown));

      entryEl.querySelector(".download-btn").addEventListener("click", () => {
        downloadAsPDF(entryEl, data.date);
      });

      entryEl.querySelector(".share-btn").addEventListener("click", () => {
        shareEntry(data.content, data.date);
      });

      entryEl.querySelector(".hide-entry-btn").addEventListener("click", () => {
        confirmHide(entryEl, docSnap.id);
      });

      entriesContainer.appendChild(entryEl);
    });
  } catch (err) {
    console.error(err);
    showError("Failed to load journal entries.");
  } finally {
    hideLoading();
  }
});
