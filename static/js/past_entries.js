import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, setDoc, doc, query, where, orderBy, getDoc, addDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const entriesContainer = document.getElementById("entries-container");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeModalBtn = document.getElementById("close-modal");
const loadingState = document.getElementById("loading-state");
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-search");

// --- PIN Modal DOM ---
let pinModal = document.getElementById('pin-modal');
if (!pinModal) {
  pinModal = document.createElement('div');
  pinModal.id = "pin-modal";
  pinModal.className = "modal hidden";
  pinModal.innerHTML = `
    <div class="modal-content">
      <h2 id="pin-modal-title">Enter Security PIN</h2>
      <input type="password" id="pin-input" maxlength="6" placeholder="Enter 4-6 digit PIN">
      <button id="set-pin-btn">Submit</button>
      <p id="pin-error" style="color:#ff2f55; display:none; margin-top:1em"></p>
    </div>
  `;
  document.body.appendChild(pinModal);
}
const pinInput = pinModal.querySelector("#pin-input");
const setPinBtn = pinModal.querySelector("#set-pin-btn");
const pinError = pinModal.querySelector("#pin-error");
const pinModalTitle = pinModal.querySelector("#pin-modal-title");

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
    clearBtn.style.display = "none";
    const existingNoMatch = document.querySelector(".no-match-message");
    if (existingNoMatch) existingNoMatch.remove();
  });
}

// Dropdown logic
function toggleDropdown(dropdown) {
  document.querySelectorAll(".dropdown-options").forEach(el => el !== dropdown && (el.style.display = "none"));
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}

// --- Hide logic updated ---
let currentUser = null;
let currentEntryToHide = null;
let currentEntryEl = null;
let currentEntryDocId = null;
let userPin = null;

// Check and set PIN if not set
async function ensureUserPin() {
  if (!currentUser) return false;
  const userDocRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userDocRef);
  if (!userSnap.exists() || !userSnap.data().pin) {
    // Prompt to set PIN
    pinModalTitle.textContent = "Set Security PIN";
    setPinBtn.textContent = "Set PIN";
    pinInput.value = "";
    pinError.style.display = "none";
    pinModal.classList.remove("hidden");
    return new Promise(resolve => {
      setPinBtn.onclick = async () => {
        const pin = pinInput.value.trim();
        if (!/^\d{4,6}$/.test(pin)) {
          pinError.textContent = "PIN must be 4-6 digits.";
          pinError.style.display = "block";
          return;
        }
        await setDoc(userDocRef, { pin }, { merge: true });
        userPin = pin;
        pinModal.classList.add("hidden");
        resolve(true);
      };
    });
  } else {
    userPin = userSnap.data().pin;
    return true;
  }
}

function promptPinAndHide(entryEl, docId, entryData) {
  pinModalTitle.textContent = "Enter Security PIN";
  setPinBtn.textContent = "Submit";
  pinInput.value = "";
  pinError.style.display = "none";
  pinModal.classList.remove("hidden");
  setPinBtn.onclick = async () => {
    const enteredPin = pinInput.value.trim();
    if (enteredPin === userPin) {
      pinModal.classList.add("hidden");
      await sendEntryToHidden(entryEl, docId, entryData);
      window.location.href = "hidden.html";
    } else {
      pinError.textContent = "Incorrect PIN. Try again.";
      pinError.style.display = "block";
    }
  };
}

async function sendEntryToHidden(entryEl, docId, entryData) {
  // Save to users/{uid}/hidden_journals
  try {
    const hiddenRef = collection(db, "users", currentUser.uid, "hidden_journals");
    await addDoc(hiddenRef, entryData); // Copy data
    await deleteDoc(doc(db, "journals", docId)); // Remove from journals
    entryEl.remove();
  } catch (e) {
    showError("Failed to hide entry. Try again.");
  }
}

function confirmHide(entryEl, docId, entryData) {
  // First ensure PIN exists
  ensureUserPin().then(() => {
    // Then prompt for PIN and on success move entry
    promptPinAndHide(entryEl, docId, entryData);
  });
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

// Search Logic (with highlight)
window.handleSearch = function (term) {
  const entries = document.querySelectorAll(".entry");
  const existingNoMatch = document.querySelector(".no-match-message");
  if (existingNoMatch) existingNoMatch.remove();

  let found = false;
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    if (text.includes(term.toLowerCase())) {
      entry.style.display = "block";
      // Highlight
      const contentDiv = entry.querySelector('.entry-content');
      if (contentDiv && term) {
        const regex = new RegExp(`(${term})`, 'gi');
        contentDiv.innerHTML = contentDiv.textContent.replace(regex, '<mark>$1</mark>');
      }
      found = true;
    } else {
      entry.style.display = "none";
    }
  });

  if (term.length > 0) {
    searchInput.classList.add("highlighted");
    clearBtn.style.display = "inline-block";
  } else {
    searchInput.classList.remove("highlighted");
    clearBtn.style.display = "none";
  }

  if (!found && term.trim()) {
    const noMatch = document.createElement("p");
    noMatch.className = "no-match-message";
    noMatch.innerHTML = `No matching entries found for: <strong>${term}</strong>`;
    entriesContainer.appendChild(noMatch);
  }
};

// Load Entries
onAuthStateChanged(auth, async user => {
  if (!user) return (window.location.href = "/");
  currentUser = user;
  await ensureUserPin();
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
        confirmHide(entryEl, docSnap.id, {...data, originalId: docSnap.id});
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
