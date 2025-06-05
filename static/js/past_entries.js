import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Remove the html2pdf import from here
// Add the script tag to your HTML instead as shown above

const container = document.getElementById("entries-container");

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
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "entry-card";
      card.innerHTML = `
        <h3>${data.date}</h3>
        <p>${data.content}</p>
        <button class="download-btn">Download PDF</button>
      `;

      card.querySelector(".download-btn").addEventListener("click", () => {
        const opt = {
          margin: 1,
          filename: `Journal_${data.date}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Use window.html2pdf instead
        window.html2pdf().from(card).set(opt).save();
      });

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<p>Error loading entries: ${error.message}</p>`;
  }
});
