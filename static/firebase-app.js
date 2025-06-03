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

let isSignUp = false;

function toggleForm() {
  isSignUp = !isSignUp;
  const title = document.getElementById("form-title");
  const button = document.getElementById("auth-button");
  const toggle = document.getElementById("toggle-link");

  if (isSignUp) {
    title.innerText = "Sign Up";
    button.innerText = "Create Account";
    button.setAttribute("onclick", "signup()");
    toggle.innerHTML = 'Already have an account? <span onclick="toggleForm()">Sign In</span>';
  } else {
    title.innerText = "Sign In";
    button.innerText = "Sign In";
    button.setAttribute("onclick", "login()");
    toggle.innerHTML = 'Don’t have an account? <span onclick="toggleForm()">Sign Up</span>';
  }
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signed up! Now login.");
      toggleForm(); // switch to login view
    })
    .catch(error => alert(error.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("auth-box").style.display = "none";
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