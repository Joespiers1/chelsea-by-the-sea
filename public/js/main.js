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
  const email = document.getElementById('newsletter-email').value;
  const form = document.getElementById('newsletter-form');
  const success = document.getElementById('newsletter-success');
  if (email && form && success) {
    form.style.display = 'none';
    success.style.display = 'block';
    // TODO: wire to Resend/Firebase in a later step
    console.log('Newsletter signup:', email);
  }
}

// Booking form
function handleBookingSubmit(e) {
  e.preventDefault();
  const success = document.getElementById('booking-success');
  if (success) {
    success.style.display = 'block';
    e.target.querySelector('button[type=submit]').style.display = 'none';
    // TODO: wire to Netlify Forms or Firebase in later step
  }
}

// Iframe fallback — if chelseasbodyshop.com blocks embedding, show fallback button
const bsIframe = document.getElementById('bodyshop-iframe');
const bsFallback = document.getElementById('iframe-fallback');
if (bsIframe && bsFallback) {
  // Show fallback after 8 seconds if iframe is empty (X-Frame-Options block)
  setTimeout(() => {
    try {
      const doc = bsIframe.contentDocument || bsIframe.contentWindow.document;
      if (!doc || doc.body.innerHTML === '') {
        bsIframe.style.display = 'none';
        bsFallback.style.display = 'flex';
      }
    } catch(e) {
      // Cross-origin block = site loaded but we can't read it = that's fine
      // Only show fallback if iframe height collapses to 0
      if (bsIframe.offsetHeight === 0) {
        bsIframe.style.display = 'none';
        bsFallback.style.display = 'flex';
      }
    }
  }, 8000);
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
