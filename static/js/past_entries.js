import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("entries-container");

// Secret phrase modals
const setSecretModal = document.getElementById("setSecretModal");
const secretInput = document.getElementById("secretInput");
const saveSecretBtn = document.getElementById("saveSecretBtn");

const confirmHideModal = document.getElementById("confirmHideModal");
const confirmHideYes = document.getElementById("confirmHideYes");
const confirmHideNo = document.getElementById("confirmHideNo");

const searchInput = document.getElementById("searchBar");

let allEntries = []; // store for search
let selectedCardToHide = null;

// SECRET LOGIC
saveSecretBtn.addEventListener("click", () => {
  const phrase = secretInput.value.trim();
  if (phrase.length >= 3) {
    localStorage.setItem("journalSecret", phrase);
    setSecretModal.classList.add("hidden");
    alert("Secret saved. You can now hide entries.");
  } else {
    alert("Please enter at least 3 characters.");
  }
});

confirmHideYes.addEventListener("click", () => {
  if (selectedCardToHide) {
    selectedCardToHide.style.display = "none";
    selectedCardToHide = null;
  }
  confirmHideModal.classList.add("hidden");
});

confirmHideNo.addEventListener("click", () => {
  confirmHideModal.classList.add("hidden");
});

function showSetSecretPopup() {
  setSecretModal.classList.remove("hidden");
}

function showConfirmHidePopup(card) {
  selectedCardToHide = card;
  confirmHideModal.classList.remove("hidden");
}

// HIDE BUTTON
function addHideButtonToCard(card) {
  const hideBtn = document.createElement("button");
  hideBtn.className = "hide-entry-btn";
  hideBtn.textContent = "👁️";

  hideBtn.addEventListener("click", () => {
    const existingSecret = localStorage.getItem("journalSecret");
    if (!existingSecret) {
      showSetSecretPopup();
    } else {
      showConfirmHidePopup(card);
    }
  });

  card.appendChild(hideBtn);
}

// SEARCH
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  container.innerHTML = '';

  const filtered = allEntries.filter(entry =>
    entry.content.toLowerCase().includes(query) ||
    entry.dateStr.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>No matching entries found.</p>";
  } else {
    filtered.forEach(({ data, dateStr }) => {
      const card = createEntryCard(data, dateStr);
      container.appendChild(card);
    });
  }
});

// CREATE CARD
function createEntryCard(data, dateStr) {
  const card = document.createElement("div");
  card.className = "entry-card";

  const dateElem = document.createElement("h3");
  dateElem.className = "entry-date";
  dateElem.textContent = dateStr;

  const contentElem = document.createElement("p");
  contentElem.className = "entry-content";
  contentElem.textContent = data.content;

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "download-btn";
  downloadBtn.textContent = "Download PDF";

  downloadBtn.addEventListener("click", () => {
    const printable = document.createElement("div");
    printable.className = "entry-card";
    printable.innerHTML = `
      <h3 class="entry-date">${dateStr}</h3>
      <p class="entry-content">${data.content}</p>
    `;

    printable.style.background = card.style.background;

    const opt = {
      margin: 0,
      filename: `Journal_${dateStr.replace(/\//g, "-")}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    // Hide UI elements before printing
    document.querySelectorAll(".hide-entry-btn, .download-btn, #searchBar, #back-button, #page-title")
      .forEach(el => el.style.display = "none");

    window.html2pdf().from(printable).set(opt).save().then(() => {
      // Restore UI
      document.querySelectorAll(".hide-entry-btn, .download-btn, #searchBar, #back-button, #page-title")
        .forEach(el => el.style.display = "");
    });
  });

  card.appendChild(dateElem);
  card.appendChild(contentElem);
  card.appendChild(downloadBtn);
  addHideButtonToCard(card);

  return card;
}

// FIREBASE LOAD
auth.onAuthStateChanged(async user => {
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

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No entries found</p>";
      return;
    }

    container.innerHTML = '';
    allEntries = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const dateObj = new Date(data.date);
      const dateStr = dateObj.toLocaleDateString();

      const card = createEntryCard(data, dateStr);
      container.appendChild(card);

      allEntries.push({ data, dateStr });
    });

  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<p>Error loading entries: ${error.message}</p>`;
  }
});
