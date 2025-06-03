const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("journal-section").style.display = "block";
    })
    .catch(error => alert(error.message));
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Signed up successfully"))
    .catch(error => alert(error.message));
}

function saveEntry() {
  const text = document.getElementById("journal").value;
  const user = auth.currentUser;
  if (user) {
    db.ref("journals/" + user.uid).push({
      entry: text,
      timestamp: new Date().toISOString()
    });
    document.getElementById("status").innerText = "Saved!";
  }
}