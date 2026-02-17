/**
 * Shared Nav — claudewill.io
 * Burger menu + slide-out drawer.
 * Self-contained. Drop into any page or subdomain.
 */

(function () {
  'use strict';

  // ── Nav Configuration ──────────────────────────────
  // Update this when subdomains launch.

  const NAV_CONFIG = {
    sections: [
      {
        label: 'claudewill.io',
        items: [
          { name: "CW's Porch", href: '/' },
          { name: 'About CW', href: '#about', action: 'about-modal' },
          { name: 'The Stable', href: '/stable' },
          { name: 'The Arcade', href: '/arcade' },
          { name: 'The Standard', href: '/the-cw-standard' },
          { name: 'CW Strategies', href: '/strategies' },
          { name: 'About Derek', href: '/derek' }
        ]
      }
    ]
  };

  // ── Detect Current Page ────────────────────────────

  function isActive(href) {
    var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    var checkPath = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';

    // Subdomain check
    if (href.startsWith('http')) {
      return window.location.origin === new URL(href).origin;
    }

    return path === checkPath;
  }

  // ── Build DOM ──────────────────────────────────────

  function createBurger() {
    var btn = document.createElement('button');
    btn.className = 'cw-nav-burger';
    btn.setAttribute('aria-label', 'Open navigation');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    return btn;
  }

  function createDrawer() {
    var drawer = document.createElement('nav');
    drawer.className = 'cw-nav-drawer';
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'Site navigation');

    NAV_CONFIG.sections.forEach(function (section) {
      var label = document.createElement('div');
      label.className = 'cw-nav-section';
      label.textContent = section.label;
      drawer.appendChild(label);

      section.items.forEach(function (item) {
        // Skip "About CW" on pages that don't have the modal
        if (item.action === 'about-modal' && !document.getElementById('about-modal')) {
          return;
        }

        var a = document.createElement('a');
        a.className = 'cw-nav-link';
        a.textContent = item.name;

        if (item.action === 'about-modal') {
          a.href = '#';
          a.addEventListener('click', function (e) {
            e.preventDefault();
            closeDrawer();
            var modal = document.getElementById('about-modal');
            if (modal) {
              modal.hidden = false;
              var modalClose = document.getElementById('modal-close');
              if (modalClose) modalClose.focus();
            }
          });
        } else if (item.live === false) {
          a.classList.add('coming-soon');
          a.removeAttribute('href');
        } else {
          a.href = item.href;
        }

        if (isActive(item.href)) {
          a.classList.add('active');
        }

        drawer.appendChild(a);
      });
    });

    return drawer;
  }

  function createBackdrop() {
    var backdrop = document.createElement('div');
    backdrop.className = 'cw-nav-backdrop';
    return backdrop;
  }

  // ── State ──────────────────────────────────────────

  var burger, drawer, backdrop;

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close navigation');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflow = '';
  }

  function toggleDrawer() {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  // ── Init ───────────────────────────────────────────

  function init() {
    burger = createBurger();
    drawer = createDrawer();
    backdrop = createBackdrop();

    // Append all to body (burger is fixed-position)
    document.body.appendChild(burger);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    // Events
    burger.addEventListener('click', toggleDrawer);
    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
        burger.focus();
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
