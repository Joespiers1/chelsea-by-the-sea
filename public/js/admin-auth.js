// /public/js/admin-auth.js
// Shared admin-detection module. Fires 'admin-auth-ready' event on window.
// Admin check: any authenticated Firebase user (matches admin.html pattern).

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCR0IAighT6BtycEJa9VaRbZNYcZQuIYAw",
  authDomain: "chelsea-by-the-sea.firebaseapp.com",
  projectId: "chelsea-by-the-sea",
  storageBucket: "chelsea-by-the-sea.firebasestorage.app",
  messagingSenderId: "976355830273",
  appId: "1:976355830273:web:fd5a6ef43ca9c6a124ee00"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

let _resolvedUser = undefined; // undefined = pending, null = not logged in, User = logged in

const _ready = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    _resolvedUser = user || null;
    const isAdmin = !!user;
    window.dispatchEvent(new CustomEvent('admin-auth-ready', {
      detail: { isAdmin, user }
    }));
    resolve({ isAdmin, user });
  });
});

window.ChelseaAdmin = {
  async isAdmin() {
    const result = await _ready;
    return result.isAdmin;
  },
  async getUser() {
    const result = await _ready;
    return result.user;
  }
};
