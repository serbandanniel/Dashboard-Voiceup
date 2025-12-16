import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration from the user's provided code
const firebaseConfig = {
    apiKey: "AIzaSyBHG52oKNBzAEKLhajiMFX4RzT8dAGD9Hw",
    authDomain: "voiceup-dashboard.firebaseapp.com",
    projectId: "voiceup-dashboard",
    storageBucket: "voiceup-dashboard.firebasestorage.app",
    messagingSenderId: "42928166706",
    appId: "1:42928166706:web:56cdef1a4e4e8a23e0a92b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);