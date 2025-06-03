// Firebase config (already replaced with your credentials)
const firebaseConfig = {
  apiKey: "AIzaSyCCuEkfBDAAoXZhZoc3XWLTpyytZ7K-mco",
  authDomain: "journal-app-f3d32.firebaseapp.com",
  databaseURL: "https://journal-app-f3d32-default-rtdb.firebaseio.com/",
  projectId: "journal-app-f3d32",
  storageBucket: "journal-app-f3d32.appspot.com",
  messagingSenderId: "140692634604",
  appId: "1:140692634604:web:bfd27df9e62c5cf190da94"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM elements
const loginForm = document.getElementById("login-form");
const mainApp = document.getElementById("main-app");
const journalEntry = document.getElementById("journal-entry");
const saveEntryBtn = document.getElementById("save-entry");
const calendarDate = document.getElementById("calendar-date");
const calendarEntry = document.getElementById("calendar-entry");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const chatbox = document.getElementById("chatbox");

let currentUser = null;

// Listen for login form submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
    onLoginSuccess();
  } catch (error) {
    // If login fails, try to sign up
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      currentUser = userCredential.user;
      onLoginSuccess();
    } catch (signupError) {
      alert("Login/Signup failed: " + signupError.message);
    }
  }
});

function onLoginSuccess() {
  loginForm.style.display = "none";
  mainApp.style.display = "block";
  chatbox.innerHTML = <div class="ai-message">Buddy: How's your mood today?</div>;
}

// Save journal entry
saveEntryBtn.addEventListener("click", () => {
  if (!currentUser) return;
  const text = journalEntry.value.trim();
  const today = new Date().toISOString().split("T")[0];
  if (text === "") return;

  const ref = database.ref(users/${currentUser.uid}/entries/${today});
  ref.set(text)
    .then(() => {
      alert("Entry saved!");
      journalEntry.value = "";
    })
    .catch((err) => alert("Save failed: " + err.message));
});

// Load entry from calendar date
calendarDate.addEventListener("change", () => {
  if (!currentUser) return;
  const selectedDate = calendarDate.value;
  const ref = database.ref(users/${currentUser.uid}/entries/${selectedDate});
  ref.once("value")
    .then((snapshot) => {
      const text = snapshot.val();
      calendarEntry.innerHTML = text ? <p>${text}</p> : "<p>No entry for this date.</p>";
    })
    .catch((err) => alert("Load failed: " + err.message));
});

// Chatbot
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message === "") return;
  appendMessage("You", message, "user-message");
  messageInput.value = "";

  // Simulated AI response
  setTimeout(() => {
    const reply = generateAIResponse(message);
    appendMessage("Buddy", reply, "ai-message");
  }, 600);
});

function appendMessage(sender, message, className) {
  const msgDiv = document.createElement("div");
  msgDiv.className = className;
  msgDiv.textContent = ${sender}: ${message};
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function generateAIResponse(userMessage) {
  // You can enhance this with real OpenAI API later
  const responses = [
    "That's interesting!",
    "Tell me more about that.",
    "Why do you feel that way?",
    "Sounds exciting!",
    "I understand."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
