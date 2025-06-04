import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { PageFlip } from 'https://cdn.jsdelivr.net/npm/page-flip@2.0.6/dist/js/page-flip.browser.min.js';

document.addEventListener("DOMContentLoaded", () => {
  const diaryBook = document.getElementById("diaryBook");
  const userEmail = document.getElementById("user-email");
  const logoutBtn = document.getElementById("logoutBtn");

  const pageFlip = new PageFlip(diaryBook, {
    width: 550,
    height: 700,
    size: "stretch",
    minWidth: 315,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1350,
    maxShadowOpacity: 0.5,
    showCover: true,
    mobileScrollSupport: false
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Not logged in.");
      window.location.href = "/";
    } else {
      userEmail.textContent = user.email || "👤";
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "/");
  });

  const today = new Date().toISOString().split('T')[0];

  const createPage = (placeholder = "Start writing here...") => {
    const textarea = document.createElement("textarea");
    textarea.placeholder = placeholder;
    textarea.addEventListener("input", () => {
      saveContent(textarea.value);
      checkOverflow(textarea);
    });
    return `<div class="page"><div class="page-content">${textarea.outerHTML}</div></div>`;
  };

  const saveContent = async (text) => {
    if (!auth.currentUser || !text.trim()) return;
    try {
      const content = text.trim();
      await setDoc(doc(db, "journals", auth.currentUser.uid + "_" + today), {
        content,
        date: today,
        uid: auth.currentUser.uid
      });
      // Only visual pulse on save (no close)
diaryBook.classList.add("pulse-save");
setTimeout(() => diaryBook.classList.remove("pulse-save"), 500);

    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  };

  const checkOverflow = (textarea) => {
    if (textarea.scrollHeight > textarea.clientHeight + 30) {
      const newPageHTML = createPage("Continued...");
      const wrapper = document.createElement("div");
      wrapper.innerHTML = newPageHTML;
      pageFlip.loadFromHTML([wrapper.firstChild], "append");
    }
  };

  const initialPages = [
    `<div class="page page-cover page-cover-top" data-density="hard">
       <div class="page-content center-text"><h2>📔 My Journal</h2><p>Click to begin writing...</p></div>
     </div>`,
    createPage(),
    `<div class="page page-cover page-cover-bottom" data-density="hard">
       <div class="page-content center-text"><h2>📕 The End</h2></div>
     </div>`
  ];

  pageFlip.loadFromHTML(initialPages);

  document.getElementById("prevPage").addEventListener("click", () => {
    diaryBook.style.transform = "scale(0.95)";
    setTimeout(() => {
      pageFlip.flipPrev();
      diaryBook.style.transform = "scale(1)";
    }, 300);
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    diaryBook.style.transform = "scale(0.95)";
    setTimeout(() => {
      pageFlip.flipNext();
      diaryBook.style.transform = "scale(1)";
    }, 300);
  });

  document.getElementById("closeBookBtn").addEventListener("click", () => {
    diaryBook.classList.add("close-animation");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  });
});
