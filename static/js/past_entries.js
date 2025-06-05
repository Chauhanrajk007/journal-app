import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// PDF generation
import html2pdf from "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

const container = document.getElementById("entriesContainer");

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  const q = query(
    collection(db, "journals"),
    where("uid", "==", user.uid),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    container.innerHTML = "<p style='font-size: 24px; text-align: center;'>No entries found.</p>";
    return;
  }

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "entry-card";

    card.innerHTML = `
      <h3>🗓️ ${data.date}</h3>
      <p>${data.content}</p>
      <button class="download-btn">Download PDF</button>
    `;

    card.querySelector(".download-btn").addEventListener("click", () => {
      const opt = {
        margin: 0.5,
        filename: `Journal_${data.date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(card).save();
    });

    container.appendChild(card);
  });
});
