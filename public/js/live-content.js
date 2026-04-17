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
    const [imagesSnap, textSnap, navSnap] = await Promise.all([
      getDoc(doc(db, 'config', 'images')),
      getDoc(doc(db, 'config', 'text')),
      getDoc(doc(db, 'config', 'nav'))
    ]);

    const images = imagesSnap.exists() ? imagesSnap.data() : {};
    const text = textSnap.exists() ? textSnap.data() : {};
    const nav = navSnap.exists() ? navSnap.data() : null;

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

    // Apply nav config
    if (nav) applyNav(nav);

    window.dispatchEvent(new Event('live-content-applied'));
  } catch (err) {
    console.warn('[live-content] Failed to load:', err);
  }
}

function applyNav(nav) {
  // Logo
  if (nav.logo) {
    const logoText = document.getElementById('nav-logo-text');
    const logoEm = document.getElementById('nav-logo-em-text');
    if (logoText && nav.logo.main) logoText.textContent = nav.logo.main;
    if (logoEm && nav.logo.italic) logoEm.textContent = nav.logo.italic;
  }

  // Desktop nav links
  if (nav.links) {
    const navLinksEl = document.querySelector('.nav-links');
    const mobileMenu = document.getElementById('nav-mobile-menu');
    if (navLinksEl) {
      const visibleLinks = nav.links.filter(l => l.visible !== false);
      navLinksEl.innerHTML = visibleLinks.map(l =>
        '<a href="' + l.url + '">' + l.label + '</a>'
      ).join('');
    }
    if (mobileMenu) {
      const visibleLinks = nav.links.filter(l => l.visible !== false);
      // Rebuild mobile menu: links + ig + book btn
      let mobileHtml = visibleLinks.map(l =>
        '<a href="' + l.url + '">' + l.label + '</a>'
      ).join('');
      // Mobile IG
      if (nav.igPills && nav.igPills.length) {
        mobileHtml += '<div class="mobile-ig">';
        nav.igPills.forEach(p => {
          mobileHtml += '<a href="' + p.url + '" target="_blank">' + p.handle + '</a>';
        });
        mobileHtml += '</div>';
      }
      // Mobile book button
      if (nav.book) {
        const target = nav.book.newTab ? ' target="_blank"' : '';
        mobileHtml += '<a href="' + nav.book.url + '" class="nav-book-btn mobile-book"' + target + '>' + (nav.book.mobileText || nav.book.text || 'Book') + '</a>';
      }
      mobileMenu.innerHTML = mobileHtml;
    }
  }

  // Book button
  if (nav.book) {
    const bookBtns = document.querySelectorAll('.nav-book-btn:not(.mobile-book)');
    bookBtns.forEach(btn => {
      btn.textContent = nav.book.text || 'Book';
      btn.href = nav.book.url || '#';
      if (nav.book.newTab) btn.setAttribute('target', '_blank');
      else btn.removeAttribute('target');
    });
  }

  // IG Pills
  if (nav.igPills) {
    const pillsContainer = document.querySelector('.nav-ig-pills');
    if (pillsContainer) {
      pillsContainer.innerHTML = nav.igPills.map(p =>
        '<a href="' + p.url + '" target="_blank" class="ig-pill">' +
        '<span class="ig-dot" style="background:' + (p.color || '#9dbfb8') + '"></span>' + p.handle +
        '</a>'
      ).join('');
    }
  }
}

window.ChelseaLiveContent = { refresh: fetchAndApply };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchAndApply);
} else {
  fetchAndApply();
}
