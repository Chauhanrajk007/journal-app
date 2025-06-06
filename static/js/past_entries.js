import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, setDoc, doc, query, where, orderBy, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// DOM elements
const entriesContainer = document.getElementById("entries-container");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeModalBtn = document.getElementById("close-modal");
const loadingState = document.getElementById("loading-state");
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-search");
const searchToggle = document.getElementById("search-toggle");
// Hide Popup Elements
let hidePopup = document.getElementById('hidePopup');
let hidePopupOverlay = document.querySelector('.hide-popup-overlay');
if (!hidePopup) {
  hidePopup = document.createElement('div');
  hidePopup.className = "hide-popup";
  hidePopup.id = "hidePopup";
  hidePopup.innerHTML = `
    <div class="popup-title">Are you sure you want to hide this entry?</div>
    <div class="popup-btns">
      <button class="popup-btn" id="confirmHideBtn">Hide</button>
      <button class="popup-btn" id="cancelHideBtn">Cancel</button>
    </div>
  `;
  document.body.appendChild(hidePopup);
}
if (!hidePopupOverlay) {
  hidePopupOverlay = document.createElement('div');
  hidePopupOverlay.className = "hide-popup-overlay";
  document.body.appendChild(hidePopupOverlay);
}
const confirmHideBtn = hidePopup.querySelector("#confirmHideBtn");
const cancelHideBtn = hidePopup.querySelector("#cancelHideBtn");

let entryToHide = null;
let docIdToHide = null;

// PIN Modal (for first time)
let pinModal = document.getElementById('pin-modal');
if (!pinModal) {
  pinModal = document.createElement('div');
  pinModal.id = "pin-modal";
  pinModal.className = "modal hidden";
  pinModal.innerHTML = `
    <div class="modal-content">
      <h2 id="pin-modal-title">Create a PIN to access hidden entries</h2>
      <input type="text" id="pin-input" minlength="1" placeholder="PIN (letters, symbols, emoji)">
      <div id="pin-error" class="modal-error"></div>
      <button id="set-pin-btn" class="modal-btn confirm">Set PIN</button>
    </div>
  `;
  document.body.appendChild(pinModal);
}
const pinInput = pinModal.querySelector("#pin-input");
const setPinBtn = pinModal.querySelector("#set-pin-btn");
const pinError = pinModal.querySelector("#pin-error");
const pinModalTitle = pinModal.querySelector("#pin-modal-title");

// Loading and error
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

// PIN logic
let currentUser = null;
let userPin = null;

// Show modal to set PIN (for first time)
function showPinModal(onSet) {
  pinModalTitle.textContent = "Create a PIN to access hidden entries";
  pinInput.value = '';
  pinInput.type = 'text';
  pinError.textContent = '';
  pinModal.classList.remove("hidden");
  pinInput.focus();
  setPinBtn.textContent = "Set PIN";
  setPinBtn.onclick = async () => {
    const newPin = pinInput.value.trim();
    if (!newPin || newPin.length < 1) {
      pinError.textContent = "PIN cannot be empty.";
      return;
    }
    await setDoc(doc(db, "users", currentUser.uid), { pin: newPin }, { merge: true });
    userPin = newPin;
    pinModal.classList.add("hidden");
    onSet();
  };
  pinInput.onkeydown = (e) => {
    if (e.key === 'Enter') setPinBtn.click();
  };
}

// Show modal to enter PIN (for subsequent "Hide" actions)
function showEnterPinModal(onSuccess) {
  pinModalTitle.textContent = "Enter your PIN to hide this entry";
  pinInput.value = '';
  pinInput.type = 'text';
  pinError.textContent = '';
  pinModal.classList.remove("hidden");
  pinInput.focus();
  setPinBtn.textContent = "Submit";
  setPinBtn.onclick = () => {
    const enteredPin = pinInput.value.trim();
    if (enteredPin !== userPin) {
      pinError.textContent = "Incorrect PIN. Please try again.";
      return;
    }
    pinModal.classList.add("hidden");
    onSuccess();
  };
  pinInput.onkeydown = (e) => {
    if (e.key === 'Enter') setPinBtn.click();
  };
}

// Hide logic
async function handleHideEntry(entryEl, docId) {
  entryToHide = entryEl;
  docIdToHide = docId;
  // Show confirmation popup (centered)
  hidePopup.classList.add("active");
  hidePopupOverlay.style.display = "block";
}

// Confirm/Cancel hide
confirmHideBtn.onclick = async () => {
  // PIN check before hiding
  const userDocRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userDocRef);
  userPin = userSnap.exists() ? userSnap.data().pin : null;

  function doHide() {
    updateDoc(doc(db, "journals", docIdToHide), { hidden: true }).then(() => {
      if (entryToHide) entryToHide.remove();
      hidePopup.classList.remove("active");
      hidePopupOverlay.style.display = "none";
      window.location.href = "/hidden";
    });
  }

  if (!userPin) {
    showPinModal(doHide);
  } else {
    doHide();
  }
};

cancelHideBtn.onclick = () => {
  hidePopup.classList.remove("active");
  hidePopupOverlay.style.display = "none";
  entryToHide = null;
  docIdToHide = null;
};
hidePopupOverlay.onclick = cancelHideBtn.onclick;

// PDF Download
function downloadAsPDF(entryEl, date) {
  // Get the content and date
  const content = entryEl.querySelector('.entry-content')?.innerHTML || '';
  const prettyDate = entryEl.querySelector('.entry-date')?.textContent || date;

  // Create a styled template similar to your entry card
  const pdfTemplate = `
    <div style="
      font-family: 'Caveat', cursive, sans-serif;
      background: #f5efe0;
      color: #4e3b2c;
      border: 2px solid #d4c4aa;
      border-radius: 18px;
      max-width: 520px;
      margin: 30px auto;
      box-shadow: 0 2px 10px rgba(100,80,50,0.11);
      padding: 32px 28px 24px 28px;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
        <div style="font-size: 1.4rem; font-weight: bold;">${prettyDate}</div>
        <div style="font-size:2rem;">📓</div>
      </div>
      <div style="font-size: 1.22rem; line-height: 1.8; white-space: pre-line;">
        ${content}
      </div>
    </div>
  `;

  // Create a hidden container to render
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = pdfTemplate;
  document.body.appendChild(tempDiv);

  html2pdf()
    .from(tempDiv)
    .set({
      margin: 0.5,
      filename: `Journal_${prettyDate}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    })
    .save()
    .then(() => {
      document.body.removeChild(tempDiv);
    });
}


// Toast notification for copy-to-clipboard
function showToast(message = "Copied to clipboard!") {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

// Share Link
function shareEntry(content, date) {
  const text = `Journal Entry - ${date}\n\n${content}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  }).catch(() => {
    showError("Copy failed. Try again.");
  });
}

// Search Logic (with highlight)
window.handleSearch = function (term) {
    // Redirect to /hidden if secret code is entered
  if (userPin && term.trim() === userPin) {
    window.location.href = "/hidden";
    return;
  }
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
  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);
  userPin = userSnap.exists() ? userSnap.data().pin : null;
  showLoading();
  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      where("hidden", "==", false),
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
            <button class="menu-btn" aria-label="Show options">⋮</button>
            <div class="dropdown-options">
              <button class="journal-btn download-btn">Download</button>
              <button class="journal-btn share-btn">Share</button>
              <button class="journal-btn hide-btn">Hide</button>
            </div>
          </div>
        </div>
        <div class="entry-content">${data.content.replace(/\n/g, "<br>")}</div>
      `;

      // Dropdown menu logic
      const dropdown = entryEl.querySelector(".dropdown-options");
      const menuBtn = entryEl.querySelector(".menu-btn");
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdown(dropdown);
      });
      document.addEventListener("click", function(event) {
        if (!menuBtn.contains(event.target) && !dropdown.contains(event.target)) {
          dropdown.style.display = "none";
        }
      });

      entryEl.querySelector(".download-btn").addEventListener("click", () => {
        downloadAsPDF(entryEl, data.date);
      });

      entryEl.querySelector(".share-btn").addEventListener("click", () => {
        shareEntry(data.content, data.date);
      });

      entryEl.querySelector(".hide-btn").addEventListener("click", () => {
        handleHideEntry(entryEl, docSnap.id);
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

// Live search
if (searchInput) {
  searchInput.addEventListener("input", function() {
    handleSearch(this.value);
  });
}
// Collapsible search bar toggle logic
if (searchToggle && searchInput) {
  searchToggle.addEventListener("click", () => {
    searchInput.classList.toggle("expanded");
    searchInput.classList.toggle("collapsed");
    if (searchInput.classList.contains("expanded")) {
      setTimeout(() => searchInput.focus(), 150); // Smooth focus after animation
    } else {
      searchInput.value = "";
      handleSearch("");
      searchInput.blur();
    }
  });
}
