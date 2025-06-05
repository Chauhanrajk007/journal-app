import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import html2pdf from "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

const container = document.getElementById("entriesContainer");

auth.onAuthStateChanged(async user => {
  if (!user) {
    console.log("User not logged in. Redirecting...");
    window.location.href = "/";
    return;
  }

  console.log("User logged in:", user.uid);
  container.innerHTML = "<p style='text-align: center;'>Loading entries...</p>";

  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    console.log("Entries found:", querySnapshot.size);

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='font-size: 24px; text-align: center;'>No entries found.</p>";
      return;
    }

    // Clear container once before adding all cards
    container.innerHTML = "";

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      console.log("Loaded entry:", data);

      const card = document.createElement("div");
      card.className = "entry-card";
      
      // Better structure for PDF generation
      card.innerHTML = `
        <div class="card-content">
          <h3>${formatDate(data.date)}</h3>
          <div class="entry-content">${data.content}</div>
        </div>
        <button class="download-btn">Download PDF</button>
      `;

      card.querySelector(".download-btn").addEventListener("click", () => {
        const opt = {
          margin: 0.5,
          filename: `Journal_Entry_${data.date}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            logging: true,
            useCORS: true
          },
          jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait' 
          }
        };
        
        // Clone the card to avoid modifying the original
        const cardClone = card.cloneNode(true);
        cardClone.querySelector('.download-btn').remove();
        html2pdf().set(opt).from(cardClone).save();
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading entries:", error);
    container.innerHTML = `<p style='color: red; text-align: center;'>Error loading entries: ${error.message}</p>`;
  }
});

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'No date';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
