const firebaseConfig = {
  apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
  authDomain: "journal-app-f3d32.firebaseapp.com",
  databaseURL: "https://journal-app-f3d32.firebaseio.com",
  projectId: "journal-app-f3d32",
  storageBucket: "journal-app-f3d32.appspot.com",
  messagingSenderId: "1071713060128",
  appId: "1:1071713060128:web:9d88c50599e3db0e0a4345",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function signup() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Signed up! Now login."))
    .catch(error => alert(error.message));
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("signup-box").style.display = "none";
      document.getElementById("login-box").style.display = "none";
      document.getElementById("journal-section").style.display = "block";
      loadEntry();
    })
    .catch(error => alert(error.message));
}

function saveEntry() {
  const text = document.getElementById("journal").value;
  const user = auth.currentUser;
  if (user) {
    db.ref("journals/" + user.uid).set({
      entry: text,
      timestamp: new Date().toISOString()
    });
    document.getElementById("status").innerText = "Saved!";
  }
}

function loadEntry() {
  const user = auth.currentUser;
  if (user) {
    db.ref("journals/" + user.uid).once("value").then(snapshot => {
      const data = snapshot.val();
      if (data && data.entry) {
        document.getElementById("journal").value = data.entry;
      }
    });
  }
}