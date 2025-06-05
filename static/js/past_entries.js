import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

const container = document.getElementById("entries-container");

auth.onAuthStateChanged(async user => {
  if (!user) return window.location.href = "/";
  
  // Debug UID
  console.log("Current user UID:", user.uid);
  
  try {
    // Normalize UID by trimming
    const normalizedUid = user.uid.trim();
    
    const q = query(
      collection(db, "journals"),
      where("uid", "==", normalizedUid),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    console.log("Matching documents:", 
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    if (snapshot.empty) {
      container.innerHTML = `<p>No entries found for user ${normalizedUid}</p>`;
      return;
    }
function showError(message) {
  const modal = document.getElementById("error-modal");
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  modal.classList.remove("hidden");
  
  document.getElementById("close-modal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}
    // Render entries
    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.innerHTML = `
        <h3>${data.date}</h3>
        <p>${data.content}</p>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Full error:", error);
    container.innerHTML = `
      <p>Error loading data</p>
      <small>${error.message}</small>
    `;
  }
});
