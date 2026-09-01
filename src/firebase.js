import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4JXYuW74KkbvNIY3035wlc1WczOSlW7Q",
  authDomain: "shortsinshort-3a6d2.firebaseapp.com",
  projectId: "shortsinshort-3a6d2",
  storageBucket: "shortsinshort-3a6d2.firebasestorage.app",
  messagingSenderId: "1087270378006",
  appId: "1:1087270378006:web:0d10e875914138fe283337",
  measurementId: "G-SF1F411896"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Login Error:", error);
    throw error;
  }
};

export const logoutUser = () => signOut(auth);
