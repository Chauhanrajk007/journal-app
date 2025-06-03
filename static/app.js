const db = {}; // Use Firebase or localStorage in real use
const entriesList = document.getElementById("entriesList");
const calendarEl = document.getElementById("calendar");
const chatBox = document.getElementById("chatBox");

// Save Journal Entry
function saveEntry() {
  const entry = document.getElementById("entry").value;
  if (!entry.trim()) return alert("Entry cannot be empty");

  const today = new Date().toISOString().split("T")[0];

  // Save to localStorage for now
  localStorage.setItem(today, entry);
  loadEntries();
  alert("Entry saved!");

  document.getElementById("entry").value = "";
}

// Load Entries to Sidebar
function loadEntries() {
  entriesList.innerHTML = "";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const entry = localStorage.getItem(key);

    const li = document.createElement("li");
    li.innerText = ${key} - ${entry.slice(0, 15)}...;
    li.onclick = () => {
      document.getElementById("entry").value = entry;
    };
    entriesList.appendChild(li);
  }
}

// Calendar Setup
document.addEventListener("DOMContentLoaded", function () {
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    dateClick: function (info) {
      const entry = localStorage.getItem(info.dateStr);
      if (entry) {
        alert(Journal on ${info.dateStr}:\n\n${entry});
      } else {
        alert("No entry found on this date.");
      }
    }
  });
  calendar.render();
  loadEntries();
});

// Basic AI Chatbot
function handleChat(e) {
  if (e.key === "Enter") {
    const input = e.target.value;
    const reply = simpleAI(input);
    chatBox.innerHTML += <p><b>You:</b> ${input}</p>;
    chatBox.innerHTML += <p><b>AI:</b> ${reply}</p>;
    chatBox.scrollTop = chatBox.scrollHeight;
    e.target.value = "";
  }
}

function simpleAI(message) {
  const lower = message.toLowerCase();
  if (lower.includes("hello")) return "Hi there! How are you feeling today?";
  if (lower.includes("sad")) return "It's okay to feel sad. Want to talk about it?";
  if (lower.includes("happy")) return "That's great! What made you happy?";
  return "Tell me more about it.";
}