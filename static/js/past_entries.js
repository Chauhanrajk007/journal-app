import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("entries-container");

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  console.log("Current user UID:", user.uid);
  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      orderBy("date", "desc") // Assumes 'date' is stored as Firestore Timestamp
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

      // Format Firestore Timestamp to string
      const formattedDate = new Date(data.date).toLocaleDateString();

      card.innerHTML = `
        <h3 class="entry-date">${formattedDate}</h3>
        <p class="entry-content">${data.content}</p>
        <button class="download-btn">Download PDF</button>
      `;

      card.querySelector(".download-btn").addEventListener("click", () => {
        const contentToPrint = document.createElement("div");
        contentToPrint.innerHTML = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #5a4331;">${formattedDate}</h2>
            <p style="font-size: 14pt; line-height: 1.6;">${data.content}</p>
          </div>
        `;

        const opt = {
          margin: 1,
          filename: `Journal_${formattedDate}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        window.html2pdf().from(contentToPrint).set(opt).save();
      });

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<p>Error loading entries: ${error.message}</p>`;
  }
});
