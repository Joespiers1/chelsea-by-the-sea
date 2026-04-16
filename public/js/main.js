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
