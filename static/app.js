// Firebase config 
const firebaseConfig = { apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng", authDomain: "journal-app-f3d32.firebaseapp.com", databaseURL: "https://journal-app-f3d32-default-rtdb.firebaseio.com/", projectId: "journal-app-f3d32", storageBucket: "journal-app-f3d32.appspot.com", messagingSenderId: "1071713060128", appId: "1:1071713060128:web:9d88c50599e3db0e0a4345" };

firebase.initializeApp(firebaseConfig); const auth = firebase.auth(); const db = firebase.database();

let currentUser = null;

function toggleAuth() { document.getElementById('email').value = ''; document.getElementById('password').value = ''; }

function login() { const email = document.getElementById('email').value; const password = document.getElementById('password').value; auth.signInWithEmailAndPassword(email, password) .then(user => { currentUser = user.user; showApp(); }) .catch(e => alert(e.message)); }

function signup() { const email = document.getElementById('email').value; const password = document.getElementById('password').value; auth.createUserWithEmailAndPassword(email, password) .then(user => { alert("Signed up! Please log in."); }) .catch(e => alert(e.message)); }

function logout() { auth.signOut().then(() => { currentUser = null; location.reload(); }); }

function showApp() { document.getElementById('auth').style.display = 'none'; document.getElementById('tabs').style.display = 'block'; switchTab('entry'); }

function switchTab(tabName) { document.querySelectorAll('.section').forEach(div => div.classList.remove('active')); document.getElementById(tabName).classList.add('active'); }

function saveEntry() { const text = document.getElementById('journalEntry').value; const date = new Date().toISOString().split("T")[0]; if (currentUser) { db.ref(journals/${currentUser.uid}/${date}).set({ entry: text, timestamp: new Date().toISOString() }).then(() => { document.getElementById('saveStatus').innerText = "Entry saved!"; }); } }

function loadEntryByDate() { const date = document.getElementById('datePicker').value; if (currentUser && date) { db.ref(journals/${currentUser.uid}/${date}).once('value') .then(snapshot => { const data = snapshot.val(); document.getElementById('entryResult').innerText = data ? data.entry : "No entry found for this date."; }); } }

function sendToBuddy() { const msg = document.getElementById('chatInput').value; if (!msg) return;

const chatBox = document.getElementById('chatBox'); const userMsg = document.createElement('div'); userMsg.innerText = "You: " + msg; chatBox.appendChild(userMsg);

fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Authorization": "Bearer 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", "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: msg }] }) }) .then(res => res.json()) .then(data => { const aiReply = data.choices[0].message.content; const botMsg = document.createElement('div'); botMsg.innerText = "Buddy: " + aiReply; chatBox.appendChild(botMsg); chatBox.scrollTop = chatBox.scrollHeight; });

document.getElementById('chatInput').value = ''; }

auth.onAuthStateChanged(user => { if (user) { currentUser = user; showApp(); } });
