const firebaseConfig = {
  apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
  authDomain: "journal-app-f3d32.firebaseapp.com",
  databaseURL: "https://journal-app-f3d32-default-rtdb.firebaseio.com/",
  projectId: "journal-app-f3d32",
  storageBucket: "journal-app-f3d32.appspot.com",
  messagingSenderId: "1071713060128",
  appId: "1:1071713060128:web:9d88c50599e3db0e0a4345"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Show tab
function switchTab(tab) {
  document.getElementById('entry-tab').style.display = tab === 'entry' ? 'block' : 'none';
  document.getElementById('calendar-tab').style.display = tab === 'calendar' ? 'block' : 'none';
  document.getElementById('chatbot-tab').style.display = tab === 'chatbot' ? 'block' : 'none';
}

function login() {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password).then(() => {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";
    addChatMessage("Buddy", "Hey there! How's your mood today?");
  }).catch(e => alert(e.message));
}

function signup() {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.createUserWithEmailAndPassword(email, password).then(() => {
    alert("Sign up successful. You can now sign in.");
  }).catch(e => alert(e.message));
}

function saveEntry() {
  const user = auth.currentUser;
  const text = document.getElementById("journal").value;
  const date = new Date().toISOString().split("T")[0];

  if (user) {
    db.ref("journals/" + user.uid + "/" + date).set({
      entry: text,
      timestamp: new Date().toISOString()
    }).then(() => {
      document.getElementById("entry-status").innerText = "Entry saved!";
    });
  }
}

function loadEntryByDate() {
  const user = auth.currentUser;
  const date = document.getElementById("entry-date").value;

  if (user && date) {
    db.ref("journals/" + user.uid + "/" + date).once("value").then(snapshot => {
      const data = snapshot.val();
      document.getElementById("calendar-entry").innerText = data ? data.entry : "No entry on this date.";
    });
  }
}

function sendToChatbot() {
  const input = document.getElementById("user-input").value;
  if (!input) return;

  addChatMessage("You", input);
  document.getElementById("user-input").value = "";

  fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input })
  })
    .then(res => res.json())
    .then(data => {
      addChatMessage("Buddy", data.reply);
    });
}

function addChatMessage(sender, message) {
  const box = document.getElementById("chatbox");
  const msg = document.createElement("p");
  msg.innerHTML = <strong>${sender}:</strong> ${message};
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}
