/**
 * Shared Nav — claudewill*
 * Burger menu + slide-out drawer.
 * Self-contained. Drop into any page or subdomain.
 */

(function () {
  'use strict';

  // ── Nav Configuration ──────────────────────────────

  var NAV_CONFIG = {
    sections: [
      {
        label: 'the story',
        href: '/story',
        items: []
      },
      {
        label: 'derek',
        href: '/derek',
        items: [
          { name: 'work with derek', href: '/derek/assessment' },
          { name: 'research', href: '/derek/research' }
        ]
      },
      {
        label: 'our studio',
        href: '/studio',
        items: [
          { name: 'bob', href: 'https://bob.claudewill.io' },
          { name: 'coach d', href: 'https://coach.claudewill.io' },
          { name: 'arcade', href: '/arcade' }
        ]
      },
      {
        label: 'standard',
        href: '/story#the-cw-standard',
        items: []
      }
    ]
  };

  // ── Detect Current Page ────────────────────────────

  function isActive(href) {
    var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    var checkPath = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';

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
    var s1 = document.createElement('span');
    var s2 = document.createElement('span');
    var s3 = document.createElement('span');
    btn.appendChild(s1);
    btn.appendChild(s2);
    btn.appendChild(s3);
    return btn;
  }

  function createDrawer() {
    var drawer = document.createElement('nav');
    drawer.className = 'cw-nav-drawer';
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'Site navigation');

    // Wordmark
    var wordmark = document.createElement('a');
    wordmark.className = 'cw-nav-wordmark';
    wordmark.href = '/';
    wordmark.textContent = 'claudewill*';
    drawer.appendChild(wordmark);

    NAV_CONFIG.sections.forEach(function (section) {
      // Section label (clickable)
      var label = document.createElement('a');
      label.className = 'cw-nav-section';
      label.href = section.href;
      label.textContent = section.label;
      if (isActive(section.href)) {
        label.classList.add('active');
      }
      drawer.appendChild(label);

      section.items.forEach(function (item) {
        var a = document.createElement('a');
        a.className = 'cw-nav-link';
        a.textContent = item.name;
        a.href = item.href;

        if (isActive(item.href)) {
          a.classList.add('active');
        }

        drawer.appendChild(a);
      });
    });

    // Site index link at bottom
    var indexLink = document.createElement('a');
    indexLink.className = 'cw-nav-map';
    indexLink.href = '/map';
    indexLink.textContent = 'site index';
    if (isActive('/map')) {
      indexLink.classList.add('active');
    }
    drawer.appendChild(indexLink);

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

    document.body.appendChild(burger);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    burger.addEventListener('click', toggleDrawer);
    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
        burger.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
