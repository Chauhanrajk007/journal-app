const firebaseConfig = {
  apiKey: "AIzaSyDZQL7yNiw9CWhnyY2_HtB-JXZctToD_ng",
  authDomain: "journal-app-f3d32.firebaseapp.com",
  databaseURL: "https://journal-app-f3d32.firebaseio.com",  // 🔧 add the databaseURL
  projectId: "journal-app-f3d32",
  storageBucket: "journal-app-f3d32.appspot.com",           // 🔧 fix domain here
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