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
