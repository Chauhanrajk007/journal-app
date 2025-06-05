import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// DOM elements
const entriesContainer = document.getElementById("entries-container");
const loadingState = document.getElementById("loading-state");
const searchBar = document.getElementById("searchBar");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeModalBtn = document.getElementById("close-modal");

// Error modal
function showError(message) {
  if (errorModal && errorMessage) {
    errorMessage.textContent = message;
    errorModal.classList.remove("hidden");
  } else {
    alert(message); // Fallback
  }
}

// Close modal button
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    errorModal.classList.add("hidden");
  });
}

// Handle search
window.handleSearch = function (searchTerm) {
  const entries = document.querySelectorAll(".entry");
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    entry.style.display = text.includes(searchTerm.toLowerCase()) ? "block" : "none";
  });
};

// Load past entries
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
    entriesContainer.innerHTML = ""; // Clear loading

    if (querySnapshot.empty) {
      entriesContainer.innerHTML = "<p>No journal entries found.</p>";
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const entryEl = document.createElement("div");
      entryEl.className = "entry entry-card";

      entryEl.innerHTML = `
        <div class="entry-header">
          <div class="entry-date">${data.date}</div>
          <button class="hide-entry-btn" title="Hide Entry"></button>
        </div>
        <div class="entry-content">${data.content.replace(/\n/g, "<br>")}</div>
        <small>Last updated: ${new Date(data.updatedAt).toLocaleString()}</small>
      `;

      // Add toggle feature
      const hideBtn = entryEl.querySelector(".hide-entry-btn");
      const contentEl = entryEl.querySelector(".entry-content");

      hideBtn.addEventListener("click", () => {
        const isHidden = contentEl.style.display === "none";
        contentEl.style.display = isHidden ? "block" : "none";
      });

      entriesContainer.appendChild(entryEl);
    });
  } catch (err) {
    console.error("Error loading entries:", err);
    showError("Failed to load journal entries. Please try again.");
  }
});
