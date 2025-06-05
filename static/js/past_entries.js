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
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No entries found</p>";
      return;
    }

    container.innerHTML = ''; // Clear any placeholders

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "entry-card";

      // Format timestamp correctly
      const formattedDate = data.date.toDate().toLocaleDateString();

      // Create inner content
      const dateElem = document.createElement("h3");
      dateElem.className = "entry-date";
      dateElem.textContent = formattedDate;

      const contentElem = document.createElement("p");
      contentElem.className = "entry-content";
      contentElem.textContent = data.content;

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "download-btn";
      downloadBtn.textContent = "Download PDF";

      downloadBtn.addEventListener("click", () => {
        // Clone a clean version of the content for export
        const printable = document.createElement("div");
        printable.className = "entry-card";
        printable.style.background = card.style.background; // for ruled effect
        printable.innerHTML = `
          <h3 class="entry-date">${formattedDate}</h3>
          <p class="entry-content">${data.content}</p>
        `;

        const opt = {
          margin: 0,
          filename: `Journal_${formattedDate}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };

        window.html2pdf().from(printable).set(opt).save();
      });

      card.appendChild(dateElem);
      card.appendChild(contentElem);
      card.appendChild(downloadBtn);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<p>Error loading entries: ${error.message}</p>`;
  }
});
