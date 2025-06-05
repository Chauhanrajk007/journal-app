const hiddenEntries = JSON.parse(localStorage.getItem("entries") || "[]")
  .filter(entry => entry.hidden);

const container = document.getElementById("entries-container");
const modal = document.getElementById("unhide-modal");
let entryToUnhide = null;

function renderHiddenEntries() {
  container.innerHTML = "";

  if (hiddenEntries.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>No hidden entries.</p>";
    return;
  }

  hiddenEntries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card";

    const header = document.createElement("div");
    header.className = "entry-header";

    const date = document.createElement("h3");
    date.className = "entry-date";
    date.textContent = new Date(entry.date).toDateString();

    const unhideBtn = document.createElement("button");
    unhideBtn.className = "unhide-btn";
    unhideBtn.innerHTML = "🙈";
    unhideBtn.onclick = () => {
      entryToUnhide = entry;
      modal.classList.remove("hidden");
    };

    header.appendChild(date);
    header.appendChild(unhideBtn);

    const content = document.createElement("p");
    content.className = "entry-content";
    content.textContent = entry.content;

    card.appendChild(header);
    card.appendChild(content);
    container.appendChild(card);
  });
}

document.getElementById("confirm-unhide").onclick = () => {
  if (!entryToUnhide) return;
  const allEntries = JSON.parse(localStorage.getItem("entries") || "[]");
  const updated = allEntries.map(e =>
    e.id === entryToUnhide.id ? { ...e, hidden: false } : e
  );
  localStorage.setItem("entries", JSON.stringify(updated));
  location.reload();
};

document.getElementById("cancel-unhide").onclick = () => {
  modal.classList.add("hidden");
  entryToUnhide = null;
};

renderHiddenEntries();
