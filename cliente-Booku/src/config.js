// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyBWHTD8IFWgsg6WgO-pwLl8PXEGjmzEpYc",
    authDomain: "lee-con-booku.firebaseapp.com",
    projectId: "lee-con-booku",
    storageBucket: "lee-con-booku.appspot.com",
    messagingSenderId: "456466964199",
    appId: "1:456466964199:web:58ff5bff157575b6324c42"
  };
  
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app