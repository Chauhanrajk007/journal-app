import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import html2pdf from "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

const container = document.getElementById("entriesContainer");

// Auth state listener
auth.onAuthStateChanged(async user => {
  if (!user) {
    console.error("No user logged in - redirecting");
    window.location.href = "/";
    return;
  }

  console.log("User authenticated:", user.uid);
  try {
    await loadUserEntries(user.uid);
  } catch (error) {
    showErrorState(error);
  }
});

async function loadUserEntries(userId) {
  showLoadingState();

  const q = query(
    collection(db, "journals"),
    where("uid", "==", userId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);
  console.log("Found", querySnapshot.size, "entries");

  if (querySnapshot.empty) {
    showEmptyState();
    return;
  }

  renderEntries(querySnapshot);
}

function renderEntries(querySnapshot) {
  container.innerHTML = ''; // Clear previous content

  querySnapshot.forEach(doc => {
    const data = doc.data();
    console.log("Rendering entry:", data);

    const card = createEntryCard(data);
    container.appendChild(card);
  });
}

function createEntryCard(entryData) {
  const card = document.createElement("div");
  card.className = "entry-card";
  card.innerHTML = `
    <h3>${formatDate(entryData.date)}</h3>
    <div class="entry-content">${entryData.content || ''}</div>
    <button class="download-btn">Download PDF</button>
  `;

  // Add PDF download functionality
  card.querySelector('.download-btn').addEventListener('click', () => {
    generatePDF(card, formatDate(entryData.date));
  });

  return card;
}

function formatDate(dateString) {
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch {
    return "Undated entry";
  }
}

function generatePDF(element, date) {
  const opt = {
    margin: 1,
    filename: `Journal_Entry_${date.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`,
    html2canvas: { 
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  // Clone element to avoid modifying original
  const clone = element.cloneNode(true);
  clone.querySelector('.download-btn').remove();

  // Add temporary PDF-specific styling
  const style = document.createElement('style');
  style.innerHTML = `
    .entry-card { 
      width: 100% !important;
      box-shadow: none !important;
      border: none !important;
    }
    body { 
      background: white !important; 
      color: black !important;
    }
  `;
  clone.appendChild(style);

  html2pdf().set(opt).from(clone).save();
}

// UI State Management
function showLoadingState() {
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading your journal entries...</p>
    </div>
  `;
}

function showEmptyState() {
  container.innerHTML = `
    <div class="empty-state">
      <p>No journal entries found</p>
      <button class="action-btn" onclick="window.location.href='/diary'">
        Create your first entry
      </button>
    </div>
  `;
}

function showErrorState(error) {
  console.error("Error loading entries:", error);
  container.innerHTML = `
    <div class="error-state">
      <p>Error loading entries: ${error.message}</p>
      <button class="action-btn" onclick="window.location.reload()">
        Try again
      </button>
    </div>
  `;
}
