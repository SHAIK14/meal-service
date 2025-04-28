// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfhvS2DTJMNPLeJ8sKgo8t940gwfiXJHQ",
  authDomain: "meal-service-fbc3b.firebaseapp.com",
  projectId: "meal-service-fbc3b",
  storageBucket: "meal-service-fbc3b.appspot.com",
  messagingSenderId: "278458278223",
  appId: "1:278458278223:web:c6deb255094bd2b5bd653a",
  measurementId: "G-HTK1NNQ2JS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

export { storage };
