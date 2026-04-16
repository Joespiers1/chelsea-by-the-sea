/* NAV */

// Mobile menu toggle
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('nav-mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// Active link highlight — adds .active class to current page link
const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile-menu a');
navLinks.forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});

// Sticky nav shadow on scroll
const siteNav = document.getElementById('site-nav');
if (siteNav) {
  window.addEventListener('scroll', () => {
    siteNav.style.boxShadow = window.scrollY > 10
      ? '0 1px 12px rgba(0,0,0,0.06)'
      : 'none';
  });
}

// Newsletter form
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const emailInput = form.querySelector('input[type="email"]');
  const email = emailInput ? emailInput.value : '';
  const success = form.parentElement.querySelector('.newsletter-success');
  if (email) {
    form.style.display = 'none';
    if (success) success.style.display = 'block';
    // Save to Firestore
    if (typeof db !== 'undefined') {
      db.collection('newsletter').add({
        email: email,
        source: window.location.pathname,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => console.log('Newsletter saved to Firestore'))
        .catch(err => console.error('Newsletter Firestore error:', err));
    }
    // Save to Google Sheet
    fetch('https://script.google.com/macros/s/AKfycbzBSQmh_v1JYcYXbuxXT2tfeCLOKPtZBKna8ZgLVkdKxl9-NQSsjzCilyaNasZ_cU91/exec', {
      method: 'POST',
      body: JSON.stringify({ email: email, source: window.location.pathname }),
    }).then(() => console.log('Newsletter saved to Google Sheet'))
      .catch(err => console.error('Newsletter Sheet error:', err));
  }
}

// Shop category filter
function filterShop(btn) {
  const filter = btn.getAttribute('data-filter');
  document.querySelectorAll('.shop-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.shop-product-card').forEach(card => {
    if (filter === 'all' || card.getAttribute('data-category') === filter) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
  // Scroll to grid
  const grid = document.getElementById('shop-grid-section');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Deep-link filter from URL hash — e.g. /shop.html#blue auto-filters to Blue
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#','');
  if (hash) {
    const btn = document.querySelector(`.shop-filter-btn[data-filter="${hash}"]`);
    if (btn) filterShop(btn);
  }
});

// Waitlist form
function handleWaitlistSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const success = document.getElementById('waitlist-success');
  const inputs = form.querySelectorAll('.form-input');
  const data = {
    name: inputs[0] ? inputs[0].value : '',
    email: inputs[1] ? inputs[1].value : '',
    interest: inputs[2] ? inputs[2].value : '',
    goals: inputs[3] ? inputs[3].value : '',
    createdAt: typeof firebase !== 'undefined' ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
  };
  if (success) {
    success.style.display = 'block';
    form.querySelector('button[type=submit]').style.display = 'none';
  }
  // Save to Firestore
  if (typeof db !== 'undefined') {
    db.collection('waitlist').add(data)
      .then(() => console.log('Waitlist saved'))
      .catch(err => console.error('Waitlist save error:', err));
  }
}
