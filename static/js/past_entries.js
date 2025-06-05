// enhanced_past_entries.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const entriesContainer = document.getElementById("entries-container");
const loadingState = document.getElementById("loading-state");
const errorModal = document.getElementById("error-modal");
const errorMessage = document.getElementById("error-message");
const closeModalBtn = document.getElementById("close-modal");

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

window.handleSearch = function (searchTerm) {
  const entries = document.querySelectorAll(".entry");
  entries.forEach(entry => {
    const text = entry.textContent.toLowerCase();
    entry.style.display = text.includes(searchTerm.toLowerCase()) ? "block" : "none";
  });
};

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      where("hidden", "!=", true),
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
      const entryId = `entry-${docSnap.id}`;
      const entryEl = document.createElement("div");
      entryEl.className = "entry entry-card";

      entryEl.innerHTML = `
        <div class="entry-header">
          <div class="entry-date">${data.date}</div>
          <div class="entry-actions">
            <button class="hide-entry-btn" title="Hide Entry"></button>
            <button class="download-btn" onclick="downloadEntry('${entryId}', '${data.date}')">Download PDF</button>
          </div>
        </div>
        <div class="entry-content" id="${entryId}">
          ${data.content.replace(/\n/g, "<br>")}
        </div>
        <small>Last updated: ${new Date(data.updatedAt).toLocaleString()}</small>
      `;

      const hideBtn = entryEl.querySelector(".hide-entry-btn");
      hideBtn.addEventListener("click", async () => {
        try {
          await updateDoc(doc(db, "journals", docSnap.id), {
            hidden: true
          });
          entryEl.remove();
        } catch (err) {
          console.error("Failed to hide entry:", err);
          showError("Failed to hide entry. Please try again.");
        }
      });

      entriesContainer.appendChild(entryEl);
    });
  } catch (err) {
    console.error("Error loading entries:", err);
    showError("Failed to load journal entries. Please try again.");
  }
});

window.downloadEntry = function (entryId, entryDate) {
  const element = document.getElementById(entryId);
  const opt = {
    margin: 0.5,
    filename: `Journal-${entryDate.replace(/[/\\:*?\"<>|]/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};
