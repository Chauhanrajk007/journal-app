import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { PageFlip } from "https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js";

document.addEventListener("DOMContentLoaded", () => {
  const diaryBookEl = document.getElementById("diaryBook");
  const userEmailEl = document.getElementById("user-email");
  const logoutBtn = document.getElementById("logoutBtn");
  const closeBookBtn = document.getElementById("closeBookBtn");

  let pageFlip;

  // 1) Initialize PageFlip on our container
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

  // 2) Firebase Auth check: show email tooltip on hover
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Not logged in.");
      window.location.href = "/";
    } else {
      // Put actual email into title so hovering shows the Gmail
      userEmailEl.textContent = user.email ? "👤" : "👤";
      userEmailEl.title = user.email || "";
    }
  });

  // 3) Logout logic
  logoutBtn.addEventListener("click", () => {
    // Close the book, then sign out and redirect
    pageFlip.getBook().classList.add("close-book");
    setTimeout(() => {
      signOut(auth).then(() => window.location.href = "/");
    }, 800);
  });

  // 4) Add the three “seed” pages: front cover, one blank page, back cover
  const seedPages = [
    // FRONT COVER
    `<div class="page page-cover page-cover-top" data-density="hard">
       <div class="page-content center-text">
         <h2>📔 My Journal</h2>
         <p>Touch or click to begin writing...</p>
       </div>
     </div>`,

    // INITIAL BLANK PAGE (user writes here)
    `<div class="page">
       <div class="page-content">
         <textarea placeholder="Start writing your story..."></textarea>
       </div>
     </div>`,

    // BACK COVER
    `<div class="page page-cover page-cover-bottom" data-density="hard">
       <div class="page-content center-text">
         <h2>📕 The End</h2>
       </div>
     </div>`
  ];

  pageFlip.loadFromHTML(seedPages);

  // 5) Bind events on the initial textarea
  bindTextareas();

  // 6) Auto-open the book (opening animation)
  setTimeout(() => {
    diaryBookEl.classList.add("open-book");
  }, 200);

  // 7) Close book on clicking “Close Journal”
  closeBookBtn.addEventListener("click", () => {
    diaryBookEl.classList.add("close-book");
    setTimeout(() => {
      window.location.href = "/timeline";  // Or any other page
    }, 800);
  });
  
  // 8) Helper: Attach event handlers to all textareas
  function bindTextareas() {
    // Query all current <textarea> elements inside pages
    const textareas = diaryBookEl.querySelectorAll("textarea");
    textareas.forEach(textarea => {
      textarea.addEventListener("focus", () => {
        textarea.classList.add("zoomed");
      });
      textarea.addEventListener("blur", () => {
        textarea.classList.remove("zoomed");
      });
      textarea.addEventListener("input", async () => {
        // Auto-save
        await autoSave(textarea);

        // If the user has typed enough that the textarea overflows, insert a new page
        if (textarea.scrollHeight > textarea.clientHeight + 40) {
          addNewPage("Continue writing...");
        }
      });
    });
  }

  // 9) Auto-Save Function: saves the union of all textareas (or just last page)
  async function autoSave(textarea) {
    const content = textarea.value.trim();
    const dateKey = new Date().toISOString().split("T")[0];

    if (!auth.currentUser || !content) return;

    try {
      // Save under document ID = uid + "_" + date
      await setDoc(doc(db, "journals", auth.currentUser.uid + "_" + dateKey), {
        content, date: dateKey, uid: auth.currentUser.uid
      });
      // Show a pulse animation on the flipbook
      diaryBookEl.classList.add("pulse-save");
      setTimeout(() => diaryBookEl.classList.remove("pulse-save"), 500);
    } catch (err) {
      console.error("Auto-save error:", err);
    }
  }

  // 10) Add a new page just before the back cover
  function addNewPage(placeholder = "") {
    // Build new page HTML
    const newPageHTML = `
      <div class="page">
        <div class="page-content">
          <textarea placeholder="${placeholder}"></textarea>
        </div>
      </div>`;

    // Insert it before the last (back cover) page
    const pages = diaryBookEl.querySelectorAll(".page");
    const backCoverIndex = pages.length - 1;  // last index
    pageFlip.loadFromHTML([newPageHTML], "insertBefore", backCoverIndex);

    // Re-bind events (so the new textarea is recognized)
    setTimeout(bindTextareas, 200);
  }
});
