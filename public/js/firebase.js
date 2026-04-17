import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCR0IAighT6BtycEJa9VaRbZNYcZQuIYAw",
  authDomain: "chelsea-by-the-sea.firebaseapp.com",
  projectId: "chelsea-by-the-sea",
  storageBucket: "chelsea-by-the-sea.firebasestorage.app",
  messagingSenderId: "976355830273",
  appId: "1:976355830273:web:fd5a6ef43ca9c6a124ee00",
  measurementId: "G-D28E4C8E9Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export async function submitNewsletter(email) {
  if (!email || !email.includes('@')) return { success: false, error: 'Invalid email' };
  try {
    await addDoc(collection(db, 'newsletter'), {
      email: email.toLowerCase().trim(),
      source: window.location.pathname,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function submitWaitlist(data) {
  try {
    await addDoc(collection(db, 'waitlist'), {
      name: data.name?.trim(),
      email: data.email?.toLowerCase().trim(),
      interest: data.interest,
      goals: data.goals?.trim(),
      source: window.location.pathname,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function submitBooking(data) {
  try {
    await addDoc(collection(db, 'bookings'), {
      name: data.name?.trim(),
      email: data.email?.toLowerCase().trim(),
      phone: data.phone?.trim(),
      service: data.service,
      message: data.message?.trim(),
      status: 'new',
      source: window.location.pathname,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function adminLogin(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function adminLogout() {
  await signOut(auth);
}

export async function fetchCollection(name) {
  try {
    const q = query(collection(db, name), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function saveSiteConfig(config) {
  try {
    const { setDoc, doc } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );
    await setDoc(doc(db, 'config', 'theme'), {
      ...config,
      updatedAt: (await import(
        "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
      )).serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.error('saveSiteConfig error:', err);
    return { success: false, error: err.message };
  }
}

export async function loadSiteConfig() {
  try {
    const { getDoc, doc } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );
    const snap = await getDoc(doc(db, 'config', 'theme'));
    if (snap.exists()) return snap.data();
    return null;
  } catch (err) {
    console.error('loadSiteConfig error:', err);
    return null;
  }
}

export { db, auth, analytics };
