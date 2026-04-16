import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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
const analytics = getAnalytics(app);

// ── Newsletter signup ──────────────────────────────────────
export async function submitNewsletter(email) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email' };
  }
  try {
    await addDoc(collection(db, 'newsletter'), {
      email: email.toLowerCase().trim(),
      source: window.location.pathname,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.error('Newsletter error:', err);
    return { success: false, error: err.message };
  }
}

// ── Coaching waitlist ──────────────────────────────────────
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
    console.error('Waitlist error:', err);
    return { success: false, error: err.message };
  }
}

// ── Body shop booking request ──────────────────────────────
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
    console.error('Booking error:', err);
    return { success: false, error: err.message };
  }
}

export { db, analytics };
