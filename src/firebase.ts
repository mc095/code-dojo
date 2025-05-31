import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHv6Ry8eYJW-A-owwrfa8MvOte9Q3SQsA",
  authDomain: "dsa-tracker-9cc8d.firebaseapp.com",
  projectId: "dsa-tracker-9cc8d",
  storageBucket: "dsa-tracker-9cc8d.appspot.com",
  messagingSenderId: "998480286838",
  appId: "1:998480286838:web:22d689acdfbdbd9f167b57"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, provider, db }; 