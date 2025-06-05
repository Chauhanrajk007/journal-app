import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import html2pdf from "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

const container = document.getElementById("entriesContainer");

// Enhanced loading state
container.innerHTML = `
  <div class="loading-state">
    <div class="spinner"></div>
    <p>Loading your journal entries...</p>
  </div>
`;

auth.onAuthStateChanged(async user => {
  if (!user) {
    console.error("No user logged in - redirecting");
    window.location.href = "/";
    return;
  }

  console.log("User authenticated:", user.uid);
  
  try {
    // Updated query to match new data structure
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")  // Now sorting by timestamp
    );

    const querySnapshot = await getDocs(q);
    console.log("Found", querySnapshot.size, "entries");

    if (querySnapshot.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No journal entries found</p>
          <button onclick="window.location.href='/diary'">Create your first entry</button>
        </div>
      `;
      return;
    }

    container.innerHTML = ''; // Clear loading state

    // Group entries by date
    const entriesByDate = {};
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const dateKey = data.dateKey || formatDateKey(data.date);
      
      if (!entriesByDate[dateKey]) {
        entriesByDate[dateKey] = [];
      }
      entriesByDate[dateKey].push(data);
    });

    // Render entries grouped by date
    for (const [date, entries] of Object.entries(entriesByDate)) {
      const dateHeader = document.createElement("h2");
      dateHeader.className = "entry-date-header";
      dateHeader.textContent = formatDate(date);
      container.appendChild(dateHeader);

      entries.forEach(entry => {
        const card = createEntryCard(entry);
        container.appendChild(card);
      });
    }

  } catch (error) {
    console.error("Error loading entries:", error);
    container.innerHTML = `
      <div class="error-state">
        <p>Error loading entries</p>
        <button onclick="window.location.reload()">Try again</button>
      </div>
    `;
  }
});

function createEntryCard(entry) {
  const card = document.createElement("div");
  card.className = "entry-card";
  
  // Add time to the entry if available
  const timeString = entry.date ? formatTime(entry.date) : '';
  
  card.innerHTML = `
    <div class="entry-header">
      <span class="entry-time">${timeString}</span>
    </div>
    <div class="entry-content">${entry.content || ''}</div>
    <button class="download-btn">Download PDF</button>
  `;
  
  card.querySelector('.download-btn').addEventListener('click', () => {
    generatePDF(card, formatDate(entry.date) + (timeString ? ` ${timeString}` : ''));
  });
  
  return card;
}

// Helper functions
function formatDateKey(dateString) {
  return new Date(dateString).toISOString().split('T')[0];
}

function formatDate(dateString) {
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch {
    return "Undated entry";
  }
}

function formatTime(dateString) {
  try {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "";
  }
}

function generatePDF(element, filename) {
  const opt = {
    margin: 1,
    filename: `Journal_Entry_${filename.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`,
    html2canvas: { 
      scale: 2,
      logging: true,
      useCORS: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };
  
  const clone = element.cloneNode(true);
  clone.querySelector('.download-btn').remove();
  html2pdf().set(opt).from(clone).save();
}
