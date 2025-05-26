import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA9PjMYclNgYo61nIgoIxLAdEw_fbYDB30",
  authDomain: "linkedin-629fa.firebaseapp.com",
  projectId: "linkedin-629fa",
  storageBucket: "linkedin-629fa.firebasestorage.app",
  messagingSenderId: "908824045553",
  appId: "1:908824045553:web:004a470d10119c46ae8650",
  measurementId: "G-2K54M0MEHB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
