// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxaQc_AXq0mmZy2ROx5qOMCgScqUBc6YA",
  authDomain: "vybr-48be1.firebaseapp.com",
  databaseURL: "https://vybr-48be1-default-rtdb.firebaseio.com",
  projectId: "vybr-48be1",
  storageBucket: "vybr-48be1.firebasestorage.app",
  messagingSenderId: "392011369212",
  appId: "1:392011369212:web:9c266634a6ce0a30f92579",
  measurementId: "G-10Q9QBKQX1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);