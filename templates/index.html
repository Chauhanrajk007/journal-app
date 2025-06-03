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

// 🟩 Listen for Auth State Changes
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("journal-section").style.display = "block";
    loadEntries(user.uid);
  } else {
    // Not signed in
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("journal-section").style.display = "none";
  }
});

// 🟦 Login User
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
}

// 🟨 Sign Up New User
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Signed up successfully"))
    .catch(error => alert(error.message));
}

// 🟩 Save Journal Entry
function saveEntry() {
  const text = document.getElementById("journal").value;
  const user = auth.currentUser;
  if (user) {
    db.ref("journals/" + user.uid).push({
      entry: text,
      timestamp: new Date().toISOString()
    });
    document.getElementById("journal").value = "";  // Clear box
    document.getElementById("status").innerText = "Saved!";
    loadEntries(user.uid);  // Refresh list
  }
}

// 🟦 Load All Entries
function loadEntries(uid) {
  const entriesDiv = document.getElementById("entries");
  entriesDiv.innerHTML = "";  // Clear previous entries

  db.ref("journals/" + uid).once("value", snapshot => {
    snapshot.forEach(child => {
      const data = child.val();
      const entryElement = document.createElement("div");
      entryElement.innerHTML = <p><strong>${new Date(data.timestamp).toLocaleString()}</strong><br>${data.entry}</p><hr>;
      entriesDiv.prepend(entryElement);  // Newest first
    });
  });
}