import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("entriesContainer");

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
      container.innerHTML = "<p style='font-size: 20px; text-align: center;'>No entries found.</p>";
      return;
    }

    container.innerHTML = ""; // Clear loading text

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();

      const card = document.createElement("div");
      card.className = "entry-card";

      card.innerHTML = `
        <h2>🗓️ ${data.date}</h2>
        <div class="entry-content">${escapeHTML(data.content)}</div>
        <hr />
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching entries:", error);
    container.innerHTML = "<p style='color: red;'>Failed to load entries.</p>";
  }
});

// Optional: prevent XSS if you're using raw HTML
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}
