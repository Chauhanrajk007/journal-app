const firebaseConfig = {
  apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
  authDomain: "journal-app-f3d32.firebaseapp.com",
  databaseURL: "https://journal-app-f3d32.firebaseio.com",
  projectId: "journal-app-f3d32",
  storageBucket: "journal-app-f3d32.appspot.com",
  messagingSenderId: "1071713060128",
  appId: "1:1071713060128:web:9d88c50599e3db0e0a4345"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("auth-section").classList.add("hidden");
      document.getElementById("app-section").classList.remove("hidden");
    })
    .catch(err => alert(err.message));
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Signed up! Please login."))
    .catch(err => alert(err.message));
}

function saveEntry() {
  const text = document.getElementById("journal-text").value;
  const user = auth.currentUser;
  const date = new Date().toISOString().split('T')[0];

  if (user) {
    db.ref("entries/" + user.uid + "/" + date).set({
      text: text,
      timestamp: new Date().toISOString()
    }).then(() => {
      document.getElementById("entry-status").innerText = "Saved!";
    });
  }
}

function loadEntryByDate() {
  const date = document.getElementById("calendar-date").value;
  const user = auth.currentUser;
  if (user) {
    db.ref("entries/" + user.uid + "/" + date).once("value", snapshot => {
      const data = snapshot.val();
      document.getElementById("calendar-entry").innerText = data ? data.text : "No entry found for this date.";
    });
  }
}

function showTab(tabId) {
  const tabs = ['entry', 'calendar', 'buddy'];
  tabs.forEach(id => document.getElementById(id).classList.add("hidden"));
  document.getElementById(tabId).classList.remove("hidden");
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (msg === "") return;
  
  const chatBox = document.getElementById("chat-box");
  const userDiv = document.createElement("div");
  userDiv.textContent = "You: " + msg;
  chatBox.appendChild(userDiv);

  fetch("/chat", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  })
  .then(res => res.json())
  .then(data => {
    const botDiv = document.createElement("div");
    botDiv.textContent = "Buddy: " + data.reply;
    chatBox.appendChild(botDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  input.value = "";
}
