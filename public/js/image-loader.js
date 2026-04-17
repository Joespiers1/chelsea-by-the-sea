// /public/js/image-loader.js
// Loads saved images from Firestore config/images and applies to data-image-zone elements
(async function () {
  try {
    const { initializeApp, getApps } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
    );
    const { getFirestore, getDoc, doc } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );
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
    const snap = await getDoc(doc(db, 'config', 'images'));
    if (!snap.exists()) return;
    const data = snap.data();

    document.querySelectorAll('[data-image-zone]').forEach((el) => {
      const zone = el.dataset.imageZone;
      const entry = data[zone];
      if (!entry || !entry.url) return;
      if (el.tagName === 'IMG') {
        el.src = entry.url;
        el.style.display = 'block';
        // Hide sibling placeholder
        const ph = el.parentElement?.querySelector('.img-placeholder, .card-img-placeholder');
        if (ph) ph.style.display = 'none';
      } else {
        el.style.backgroundImage = `url('${entry.url}')`;
      }
    });
  } catch (err) {
    console.warn('image-loader failed:', err);
  }
})();
