// Update your past_entries.js with this more robust version
import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import html2pdf from "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

const container = document.getElementById("entriesContainer");

// Enhanced loading message
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
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      orderBy("date", "desc")
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

    querySnapshot.forEach(doc => {
      const data = doc.data();
      console.log("Entry data:", data);
      
      const card = document.createElement("div");
      card.className = "entry-card";
      card.innerHTML = `
        <h3>${formatDate(data.date)}</h3>
        <div class="entry-content">${data.content || ''}</div>
        <button class="download-btn">Download PDF</button>
      `;
      
      // Add event listener for PDF download
      card.querySelector('.download-btn').addEventListener('click', () => {
        generatePDF(card, formatDate(data.date));
      });
      
      container.appendChild(card);
    });

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
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Clone element to avoid modifying original
  const clone = element.cloneNode(true);
  clone.querySelector('.download-btn').remove();
  
  html2pdf().from(clone).set(opt).save();
}
