(async function() {
  const DEFAULTS = {
    colorBg: '#f7f4ef',
    colorInk: '#18181a',
    colorAccent: '#1e4d6b',
    colorSecondary: '#9dbfb8',
    colorSurface: '#ede8df',
    colorBtn: '#1e4d6b',
    colorMist: '#8a9a9a',
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'DM Sans', sans-serif",
    heroHeadline: 'Wellness, style &',
    heroHeadlineEm: 'the sea.',
    heroSub: "Body contouring, coastal living, premium products — Chelsea's world, curated with intention.",
    heroCta: 'Book a Treatment',
    heroEyebrow: 'Laguna Beach · Orange County',
    navLogoText: 'Chelsea',
    navLogoEm: 'by the Sea',
    footerTagline: "Laguna Beach's coastal wellness entrepreneur — body contouring, curated products, and the lifestyle you deserve.",
    newsletterTitle: 'Join the',
    newsletterTitleEm: 'C-BTS community',
    newsletterSub: 'Weekly drops — OOTD, wellness tips, exclusive offers, and early product access.'
  };

  function applyConfig(cfg) {
    const c = { ...DEFAULTS, ...cfg };
    const r = document.documentElement.style;

    // Colors
    r.setProperty('--color-bg', c.colorBg);
    r.setProperty('--color-ink', c.colorInk);
    r.setProperty('--color-accent', c.colorAccent);
    r.setProperty('--color-secondary', c.colorSecondary);
    r.setProperty('--color-surface', c.colorSurface);
    r.setProperty('--color-btn', c.colorBtn);
    r.setProperty('--color-mist', c.colorMist);
    r.setProperty('--color-line', c.colorAccent + '1f');
    r.setProperty('--font-display', c.fontDisplay);
    r.setProperty('--font-body', c.fontBody);

    // Text content
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    };

    set('hero-h1a', c.heroHeadline);
    set('hero-h1b', c.heroHeadlineEm);
    set('hero-sub-text', c.heroSub);
    set('hero-cta-text', c.heroCta);
    set('hero-eyebrow-text', c.heroEyebrow);
    set('nav-logo-text', c.navLogoText);
    set('nav-logo-em-text', c.navLogoEm);
    set('footer-tagline-text', c.footerTagline);
    set('newsletter-title-text', c.newsletterTitle);
    set('newsletter-title-em-text', c.newsletterTitleEm);
    set('newsletter-sub-text', c.newsletterSub);
  }

  // Try to load from Firebase, fall back to defaults
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
    const app = getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'config', 'theme'));
    if (snap.exists()) {
      applyConfig(snap.data());
    } else {
      applyConfig({});
    }
  } catch(e) {
    applyConfig({});
  }
})();
