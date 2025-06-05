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
      orderBy("createdAt", "desc")  // 🔄 use timestamp for reliable sorting
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='font-size: 20px; text-align: center;'>No entries found.</p>";
      return;
    }

    container.innerHTML = ""; // Clear "loading..." text

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();

      const card = document.createElement("div");
      card.className = "entry-card";

      const readableDate = data.date || new Date(data.createdAt).toISOString().split("T")[0];

      card.innerHTML = `
        <h2>🗓️ ${readableDate}</h2>
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

// Prevent XSS from journal content
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}
