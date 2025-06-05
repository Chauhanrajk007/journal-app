import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { PageFlip } from "https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js";

document.addEventListener("DOMContentLoaded", () => {
  const diaryBookEl = document.getElementById("diaryBook");
  const userEmailEl = document.getElementById("user-email");
  const logoutBtn = document.getElementById("logoutBtn");
  const closeBookBtn = document.getElementById("closeBookBtn");

  let pageFlip;

  // 1) Initialize PageFlip on the #diaryBook container
  pageFlip = new PageFlip(diaryBookEl, {
    width: 500,
    height: 700,
    size: "stretch",
    minWidth: 315,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1500,
    showCover: true,
    mobileScrollSupport: true,
    swipeDistance: 30
  });

  // 2) Firebase Auth: show Gmail on hover, block if not logged in
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Not logged in.");
      window.location.href = "/";
    } else {
      userEmailEl.title = user.email || "";
    }
  });

  // 3) Logout logic: close book, then sign out and redirect
  logoutBtn.addEventListener("click", () => {
    diaryBookEl.classList.add("close-book");
    setTimeout(() => {
      signOut(auth).then(() => window.location.href = "/");
    }, 800);
  });

  // 4) Prepare “seed” pages:
  //    a) Front cover
  //    b) One blank page with <textarea id="entry">
  //    c) Back cover
  const seedHTML = [
    `<div class="page page-cover page-cover-top" data-density="hard">
       <div class="page-content center-text">
         <h2>📔 My Journal</h2>
         <p>Tap or click to begin writing…</p>
       </div>
     </div>`,

    `<div class="page">
       <div class="page-content">
         <textarea id="entry" placeholder="Start writing your story…"></textarea>
       </div>
     </div>`,

    `<div class="page page-cover page-cover-bottom" data-density="hard">
       <div class="page-content center-text">
         <h2>📕 The End</h2>
       </div>
     </div>`
  ];

  pageFlip.loadFromHTML(seedHTML);

  // 5) Bind events to the initial textarea
  bindTextareas();

  // 6) “Open” the book after a slight delay (show opening animation)
  setTimeout(() => {
    diaryBookEl.classList.add("open-book");
  }, 200);

  // 7) “Close Journal” button: trigger close animation and go to /timeline
  closeBookBtn.addEventListener("click", () => {
    diaryBookEl.classList.add("close-book");
    setTimeout(() => {
      window.location.href = "/timeline";
    }, 800);
  });

  // 8) Helper: attach handlers to all <textarea> inside pages
  function bindTextareas() {
    const textareas = diaryBookEl.querySelectorAll("textarea");
    textareas.forEach(textarea => {
      textarea.addEventListener("focus", () => {
        textarea.classList.add("zoomed");
      });
      textarea.addEventListener("blur", () => {
        textarea.classList.remove("zoomed");
      });
      textarea.addEventListener("input", async () => {
        await autoSave(textarea);
        if (textarea.scrollHeight > textarea.clientHeight + 40) {
          addNewPage("Continue writing…");
        }
      });
    });
  }

  // 9) Auto-save function: saves the content of that textarea to Firestore
  async function autoSave(textarea) {
    const content = textarea.value.trim();
    const dateKey = new Date().toISOString().split("T")[0];
    if (!auth.currentUser || !content) return;

    try {
      await setDoc(doc(db, "journals", auth.currentUser.uid + "_" + dateKey), {
        content,
        date: dateKey,
        uid: auth.currentUser.uid
      });

      // Show a quick “pulse” to confirm save
      diaryBookEl.classList.add("pulse-save");
      setTimeout(() => diaryBookEl.classList.remove("pulse-save"), 500);
    } catch (err) {
      console.error("Auto-save error:", err.message);
    }
  }

  // 10) Add a new page just before the last (back cover)
  function addNewPage(placeholder = "") {
    const newPageHTML = `
      <div class="page">
        <div class="page-content">
          <textarea placeholder="${placeholder}"></textarea>
        </div>
      </div>`;
    const pages = diaryBookEl.querySelectorAll(".page");
    const backIndex = pages.length - 1; // index of back cover
    pageFlip.loadFromHTML([newPageHTML], "insertBefore", backIndex);

    // Wait a moment, then bind events to the newly added textarea
    setTimeout(bindTextareas, 200);
  }
});
