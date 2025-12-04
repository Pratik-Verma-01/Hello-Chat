import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateEmail, updatePassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- AAPKA CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAZuxJWGwcLs5vjKa8OsKDUXdgj7WRyk2g",
  authDomain: "hello-chat-cwp-ltd.firebaseapp.com",
  projectId: "hello-chat-cwp-ltd",
  storageBucket: "hello-chat-cwp-ltd.firebasestorage.app",
  messagingSenderId: "607804172056",
  appId: "1:607804172056:web:9087871ac3ad36b776a06d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- FIX: SET PERSISTENCE TO LOCAL ---
setPersistence(auth, browserLocalPersistence)
  .then(() => {
     console.log("Session Persistence Enabled");
  })
  .catch((error) => {
     console.error("Persistence Error", error);
  });

window.firebaseAuth = auth;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.firebaseUpdateEmail = updateEmail;
window.firebaseUpdatePassword = updatePassword;

window.checkFirebaseAuth = (callback) => {
    onAuthStateChanged(auth, (user) => {
        if (user) callback(user);
        else callback(null);
    });
};

window.firebaseLogout = async () => {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.replace('login.html');
    } catch (error) {
        console.error("Logout Error:", error);
    }
};