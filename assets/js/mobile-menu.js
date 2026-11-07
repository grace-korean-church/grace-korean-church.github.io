// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const body = document.body;

  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  body.appendChild(overlay);

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    siteNav.classList.toggle('active');
    overlay.classList.toggle('active');
    body.style.overflow = siteNav.classList.contains('active') ? 'hidden' : '';
  }

  function closeMenu() {
    menuToggle.classList.remove('active');
    siteNav.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
  }

  menuToggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  // Close menu when clicking a nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu when toggling theme inside the mobile menu
  const themeToggle = document.querySelector('.site-nav .theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', closeMenu);
  }

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && siteNav.classList.contains('active')) {
      closeMenu();
    }
  });
});

// Cross-origin map controls can receive focus without matching iframe:focus.
// Keep a visible ring around the embedded map while its document owns focus.
(function () {
  function syncFrameFocus() {
    document.querySelectorAll('iframe.frame-focused').forEach(function (frame) {
      frame.classList.remove('frame-focused');
    });
    var active = document.activeElement;
    if (active && active.tagName === 'IFRAME') active.classList.add('frame-focused');
  }
  window.addEventListener('blur', function () { setTimeout(syncFrameFocus, 0); });
  window.addEventListener('focus', syncFrameFocus);
  document.addEventListener('focusin', syncFrameFocus);
})();
