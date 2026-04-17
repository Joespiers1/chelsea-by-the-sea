/* ── NAV ── */
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('nav-mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile-menu a');
navLinks.forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});

const siteNav = document.getElementById('site-nav');
if (siteNav) {
  window.addEventListener('scroll', () => {
    siteNav.style.boxShadow = window.scrollY > 10
      ? '0 1px 12px rgba(0,0,0,0.06)'
      : 'none';
  });
}

/* ── SHOP FILTER ── */
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
  const grid = document.getElementById('shop-grid-section');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const btn = document.querySelector(`.shop-filter-btn[data-filter="${hash}"]`);
    if (btn) filterShop(btn);
  }
});

/* ── NEWSLETTER FORM ── */
async function handleNewsletterSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  const emailInput = document.getElementById('newsletter-email');
  const successEl = document.getElementById('newsletter-success');
  if (!emailInput || !btn) return;

  const originalText = btn.textContent;
  btn.textContent = 'Subscribing...';
  btn.disabled = true;

  try {
    const { submitNewsletter } = await import('/js/firebase.js');
    const result = await submitNewsletter(emailInput.value);
    if (result.success) {
      e.target.style.display = 'none';
      if (successEl) successEl.style.display = 'block';
    } else {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

/* ── WAITLIST FORM ── */
async function handleWaitlistSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const successEl = document.getElementById('waitlist-success');
  if (!btn) return;

  const originalText = btn.textContent;
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  const inputs = form.querySelectorAll('input, select, textarea');
  const data = {
    name: inputs[0]?.value,
    email: inputs[1]?.value,
    interest: inputs[2]?.value,
    goals: inputs[3]?.value
  };

  try {
    const { submitWaitlist } = await import('/js/firebase.js');
    const result = await submitWaitlist(data);
    if (result.success) {
      if (successEl) successEl.style.display = 'block';
      btn.style.display = 'none';
    } else {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

/* ── IG FEED TABS ── */
function switchFeed(name, btn) {
  document.querySelectorAll('.ig-feed-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ig-feed-tab').forEach(b => b.classList.remove('active'));
  const pane = document.getElementById('feed-' + name);
  if (pane) pane.classList.add('active');
  if (btn) btn.classList.add('active');
}

/* ── EXPOSE TO HTML onsubmit HANDLERS ── */
window.handleNewsletterSubmit = handleNewsletterSubmit;
window.handleWaitlistSubmit = handleWaitlistSubmit;
window.filterShop = filterShop;
window.switchFeed = switchFeed;
