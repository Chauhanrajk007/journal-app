import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import { PageFlip } from 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js';

const flipBook = document.getElementById("diaryBook");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("user-email");

let pageFlip;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Not logged in.");
    window.location.href = "/";
  } else {
    userEmail.textContent = user.email || "👤";
  }
});

logoutBtn.addEventListener("click", () => {
  closeBook().then(() => signOut(auth).then(() => window.location.href = "/"));
});

document.addEventListener("DOMContentLoaded", async () => {
  pageFlip = new PageFlip(flipBook, {
    width: 500,
    height: 700,
    size: "stretch",
    minWidth: 315,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1500,
    showCover: true,
    mobileScrollSupport: true,
    swipeDistance: 30,
  });

  pageFlip.loadFromHTML(document.querySelectorAll(".page"));

  addNewPage(); // Inject first editable page

  openBook(); // Animation
});

function addNewPage() {
  const wrapper = document.createElement("div");
  wrapper.className = "page";
  wrapper.innerHTML = `
    <div class="page-content">
      <textarea placeholder="Start writing your story..."></textarea>
    </div>
  `;

  flipBook.insertBefore(wrapper, flipBook.children[flipBook.children.length - 1]);
  pageFlip.loadFromHTML(document.querySelectorAll(".page"));

  const textarea = wrapper.querySelector("textarea");
  bindTextareaEvents(textarea);
}

function bindTextareaEvents(textarea) {
  textarea.addEventListener("focus", () => {
    textarea.classList.add("zoomed");
  });

  textarea.addEventListener("blur", () => {
    textarea.classList.remove("zoomed");
  });

  textarea.addEventListener("input", async () => {
    const content = textarea.value.trim();
    const dateKey = new Date().toISOString().split('T')[0];

    if (!auth.currentUser || !content) return;

    try {
      await setDoc(doc(db, "journals", auth.currentUser.uid + "_" + dateKey), {
        content,
        date: dateKey,
        uid: auth.currentUser.uid
      });

      if (textarea.scrollHeight > textarea.clientHeight + 40) {
        addNewPage();
      }

    } catch (err) {
      console.error("Auto-save error:", err.message);
    }
  });
}

function openBook() {
  flipBook.classList.add("open-book");
}

function closeBook() {
  return new Promise((resolve) => {
    flipBook.classList.add("close-book");
    setTimeout(() => {
      flipBook.classList.remove("close-book");
      resolve();
    }, 800);
  });
}
