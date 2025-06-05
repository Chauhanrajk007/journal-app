import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("hidden-entries-container");

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  try {
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      where("hidden", "==", true),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No secret entries found.</p>";
      return;
    }

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const date = new Date(data.date).toLocaleString();

      const card = document.createElement("div");
      card.className = "entry-card";

      card.innerHTML = `
        <div class="entry-header"><h3>${date}</h3></div>
        <p class="entry-content">${data.content}</p>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = `<p>Error loading secret entries: ${err.message}</p>`;
  }
});
