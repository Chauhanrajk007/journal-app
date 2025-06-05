import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("entries-container");
const allEntries = [];

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
      const formattedDate = new Date(data.date).toLocaleDateString();

      const entryObj = {
        date: formattedDate,
        content: data.content
      };

      allEntries.push(entryObj);
      renderEntry(entryObj);
    });

  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<p>Error loading entries: ${error.message}</p>`;
  }
});

function renderEntry(entry) {
  const card = document.createElement("div");
  card.className = "entry-card";

  const dateElem = document.createElement("h3");
  dateElem.className = "entry-date";
  dateElem.textContent = entry.date;

  const contentElem = document.createElement("p");
  contentElem.className = "entry-content";
  contentElem.textContent = entry.content;

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "download-btn";
  downloadBtn.textContent = "Download PDF";

  downloadBtn.addEventListener("click", () => {
    const printable = document.createElement("div");
    printable.className = "entry-card";
    printable.innerHTML = `
      <h3 class="entry-date">${entry.date}</h3>
      <p class="entry-content">${entry.content}</p>
    `;

    const opt = {
      margin: 0,
      filename: `Journal_${entry.date}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().from(printable).set(opt).save();
  });

  card.appendChild(dateElem);
  card.appendChild(contentElem);
  card.appendChild(downloadBtn);
  container.appendChild(card);
}

// 🔍 Live search + secret phrase unlock
window.handleSearch = function (query) {
  const lowerQuery = query.trim().toLowerCase();
  const noResults = document.getElementById("no-results");

  if (!lowerQuery) {
    noResults.classList.add("hidden");
    container.innerHTML = "";
    allEntries.forEach(renderEntry);
    return;
  }

  const secret = localStorage.getItem("secretKey");
  if (secret && lowerQuery === secret.toLowerCase()) {
    window.location.href = "/hidden-journal.html";
    return;
  }

  const filtered = allEntries.filter(entry =>
    entry.content.toLowerCase().includes(lowerQuery) ||
    entry.date.toLowerCase().includes(lowerQuery)
  );

  container.innerHTML = "";

  if (filtered.length === 0) {
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");
  filtered.forEach(renderEntry);
};
