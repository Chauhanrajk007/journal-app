import { auth, db } from './firebase-config.js';
import {
  collection, doc, getDocs, getDoc, query, where, orderBy, updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const container = document.getElementById("hidden-entries-container");
const modal = document.getElementById("unhide-modal");
const confirmBtn = document.getElementById("confirm-unhide");
const cancelBtn = document.getElementById("cancel-unhide");

let selectedDocId = null;

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  try {
    const codeDoc = await getDoc(doc(db, "users", user.uid));
    let storedCode = codeDoc.exists() ? codeDoc.data().code : null;

    // Ask for code if not passed in query
    let typedCode = new URLSearchParams(window.location.search).get("code");
    if (!typedCode) {
      typedCode = prompt("Enter your secret code to view hidden entries:");
    }

    if (!storedCode) {
      if (typedCode) {
        await updateDoc(doc(db, "users", user.uid), { code: typedCode });
        storedCode = typedCode;
      } else {
        alert("No code set. Please reload and enter a code.");
        return;
      }
    }

    if (typedCode !== storedCode) {
      alert("Wrong code. Redirecting...");
      window.location.href = "/";
      return;
    }

    // Load hidden entries
    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      where("hidden", "==", true),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>No hidden entries found.</p>";
      return;
    }

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const date = new Date(data.date).toLocaleString();

      const card = document.createElement("div");
      card.className = "entry-card";

      card.innerHTML = `
        <div class="entry-header">
          <h3>${date}</h3>
          <button class="unhide-btn" data-id="${docSnap.id}">🔓 Unlock</button>
        </div>
        <p class="entry-content">${data.content}</p>
      `;

      container.appendChild(card);
    });

    // Add unhide button logic
    container.addEventListener("click", e => {
      if (e.target.classList.contains("unhide-btn")) {
        selectedDocId = e.target.dataset.id;
        modal.classList.remove("hidden");
      }
    });

    confirmBtn.addEventListener("click", async () => {
      if (!selectedDocId) return;
      await updateDoc(doc(db, "journals", selectedDocId), { hidden: false });
      modal.classList.add("hidden");
      document.querySelector(`[data-id="${selectedDocId}"]`).closest(".entry-card").remove();
      selectedDocId = null;
    });

    cancelBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      selectedDocId = null;
    });

  } catch (err) {
    console.error("Error loading hidden entries:", err);
    container.innerHTML = `<p>Error: ${err.message}</p>`;
  }
});
