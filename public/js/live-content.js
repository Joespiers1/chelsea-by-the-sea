// /public/js/live-content.js
// Reads config/images and config/text from Firestore, applies to data-image-zone and data-text-zone elements.

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCR0IAighT6BtycEJa9VaRbZNYcZQuIYAw",
  authDomain: "chelsea-by-the-sea.firebaseapp.com",
  projectId: "chelsea-by-the-sea",
  storageBucket: "chelsea-by-the-sea.firebasestorage.app",
  messagingSenderId: "976355830273",
  appId: "1:976355830273:web:fd5a6ef43ca9c6a124ee00"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchAndApply() {
  try {
    const [imagesSnap, textSnap] = await Promise.all([
      getDoc(doc(db, 'config', 'images')),
      getDoc(doc(db, 'config', 'text'))
    ]);

    const images = imagesSnap.exists() ? imagesSnap.data() : {};
    const text = textSnap.exists() ? textSnap.data() : {};

    // Apply images
    document.querySelectorAll('[data-image-zone]').forEach((el) => {
      const zone = el.dataset.imageZone;
      const entry = images[zone];
      if (!entry || !entry.url) return;
      const target = el.dataset.imageTarget;

      if (el.tagName === 'IMG') {
        el.src = entry.url;
        el.style.display = 'block';
        const ph = el.parentElement?.querySelector('.img-placeholder, .card-img-placeholder');
        if (ph) ph.style.display = 'none';
      } else if (target === 'background') {
        el.style.backgroundImage = "url('" + entry.url + "')";
      } else {
        // Container with data-image-zone — find child <img> or create one
        let img = el.querySelector('img');
        if (img) {
          img.src = entry.url;
          img.style.display = 'block';
        } else {
          img = document.createElement('img');
          img.src = entry.url;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          el.insertBefore(img, el.firstChild);
        }
        const ph = el.querySelector('.img-placeholder, .card-img-placeholder');
        if (ph) ph.style.display = 'none';
      }
    });

    // Apply text
    document.querySelectorAll('[data-text-zone]').forEach((el) => {
      const zone = el.dataset.textZone;
      if (text[zone] !== undefined && text[zone] !== null) {
        el.textContent = text[zone];
      }
    });

    window.dispatchEvent(new Event('live-content-applied'));
  } catch (err) {
    console.warn('[live-content] Failed to load:', err);
  }
}

window.ChelseaLiveContent = { refresh: fetchAndApply };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchAndApply);
} else {
  fetchAndApply();
}
