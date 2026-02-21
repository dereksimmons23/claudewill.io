/**
 * Command Palette — claudewill*
 * Terminal-style navigation overlay.
 * Self-contained. Drop into any page.
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
          { name: 'assessment', href: '/derek/assessment' },
          { name: 'research', href: '/derek/research' },
          { name: 'library', href: '/library' },
          { name: 'portfolio', href: '/derek/portfolio' }
        ]
      },
      {
        label: 'the workshop',
        href: '/workshop',
        items: [
          { name: 'bob', href: 'https://bob.claudewill.io' },
          { name: 'coach d', href: 'https://coach.claudewill.io' },
          { name: 'arcade', href: '/arcade' }
        ]
      },
      {
        label: 'the standard',
        href: '/story#the-cw-standard',
        items: []
      }
    ]
  };

  // ── Detect Current Page ────────────────────────────

  function isActive(href) {
    var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    var checkPath = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';

    if (href.indexOf('http') === 0) {
      try {
        return window.location.origin === new URL(href).origin;
      } catch (e) {
        return false;
      }
    }

    // Handle hash links (e.g. /story#the-cw-standard)
    var checkBase = checkPath.split('#')[0];
    return path === checkBase || path === checkPath;
  }

  // ── DOM Helpers ────────────────────────────────────

  function createStar() {
    var span = document.createElement('span');
    span.className = 'cw-palette-arrow';
    span.textContent = '*';
    return span;
  }

  function createArrow() {
    var span = document.createElement('span');
    span.className = 'cw-palette-arrow';
    span.textContent = '>';
    return span;
  }

  // ── Build Palette Overlay ──────────────────────────

  function createOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'cw-palette';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Site navigation');
    overlay.setAttribute('aria-modal', 'true');

    var inner = document.createElement('div');
    inner.className = 'cw-palette-inner';

    // Close button
    var close = document.createElement('button');
    close.className = 'cw-palette-close';
    close.setAttribute('aria-label', 'Close navigation');
    close.textContent = '\u00d7';
    inner.appendChild(close);

    // Nav
    var nav = document.createElement('nav');
    nav.className = 'cw-palette-nav';

    for (var i = 0; i < NAV_CONFIG.sections.length; i++) {
      var section = NAV_CONFIG.sections[i];

      var a = document.createElement('a');
      a.className = 'cw-palette-section';
      a.href = section.href;
      a.appendChild(createStar());
      a.appendChild(document.createTextNode(' ' + section.label));
      if (isActive(section.href)) a.classList.add('active');
      nav.appendChild(a);

      for (var j = 0; j < section.items.length; j++) {
        var item = section.items[j];
        var sub = document.createElement('a');
        sub.className = 'cw-palette-item';
        sub.href = item.href;

        if (item.href.indexOf('http') === 0) {
          sub.target = '_blank';
          sub.rel = 'noopener';
        }

        sub.appendChild(createArrow());
        sub.appendChild(document.createTextNode(' ' + item.name));
        if (isActive(item.href)) sub.classList.add('active');
        nav.appendChild(sub);
      }
    }

    inner.appendChild(nav);

    // Site index
    var indexLink = document.createElement('a');
    indexLink.className = 'cw-palette-index';
    indexLink.href = '/map';
    indexLink.textContent = 'site index';
    if (isActive('/map')) indexLink.classList.add('active');
    inner.appendChild(indexLink);

    overlay.appendChild(inner);
    return overlay;
  }

  function createFloatingTrigger() {
    var btn = document.createElement('button');
    btn.className = 'cw-palette-trigger';
    btn.setAttribute('aria-label', 'Open navigation');

    var star = document.createElement('span');
    star.className = 'cw-palette-trigger-star';
    star.textContent = '*';

    var label = document.createElement('span');
    label.className = 'cw-palette-trigger-label';
    label.textContent = ' menu';

    btn.appendChild(star);
    btn.appendChild(label);
    return btn;
  }

  // ── State ──────────────────────────────────────────

  var overlay;
  var floatingTrigger;
  var lastFocused;

  function closePageDropdown() {
    var dropdown = document.querySelector('.page-dropdown');
    var toggle = document.querySelector('.page-dropdown-toggle');
    if (dropdown) dropdown.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function openPalette() {
    lastFocused = document.activeElement;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Close page dropdown if open
    closePageDropdown();

    // Focus close button
    var close = overlay.querySelector('.cw-palette-close');
    if (close) close.focus();

    // Hide porch widget if present
    var widget = document.querySelector('.porch-widget');
    if (widget) widget.style.display = 'none';
  }

  function closePalette() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';

    // Show porch widget again
    var widget = document.querySelector('.porch-widget');
    if (widget) widget.style.display = '';

    // Return focus
    if (lastFocused) lastFocused.focus();
  }

  // ── Init ───────────────────────────────────────────

  function init() {
    overlay = createOverlay();
    document.body.appendChild(overlay);

    // Wire close button
    var closeBtn = overlay.querySelector('.cw-palette-close');
    if (closeBtn) closeBtn.addEventListener('click', closePalette);

    // Check for page-level palette triggers (sticky header pages)
    var headerTriggers = document.querySelectorAll('.palette-trigger');

    if (headerTriggers.length === 0) {
      // No header triggers — inject floating * button
      floatingTrigger = createFloatingTrigger();
      floatingTrigger.addEventListener('click', openPalette);
      document.body.appendChild(floatingTrigger);
    } else {
      // Wire existing header triggers
      for (var i = 0; i < headerTriggers.length; i++) {
        headerTriggers[i].addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openPalette();
        });
      }
    }

    // Backdrop click closes
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePalette();
    });

    // ── Page Dropdown (section nav in sticky headers) ──
    var dropdownToggle = document.querySelector('.page-dropdown-toggle');
    var dropdown = document.querySelector('.page-dropdown');

    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('open');
        if (isOpen) {
          closePageDropdown();
        } else {
          dropdown.classList.add('open');
          dropdownToggle.setAttribute('aria-expanded', 'true');
        }
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!dropdownToggle.contains(e.target) && !dropdown.contains(e.target)) {
          closePageDropdown();
        }
      });

      // Dropdown links close dropdown on click
      var dropdownLinks = dropdown.querySelectorAll('a');
      for (var k = 0; k < dropdownLinks.length; k++) {
        dropdownLinks[k].addEventListener('click', function () {
          closePageDropdown();
        });
      }

      // Close on scroll
      window.addEventListener('scroll', function () {
        if (dropdown.classList.contains('open')) {
          closePageDropdown();
        }
      });
    }

    // Escape closes palette or dropdown
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (overlay.classList.contains('open')) {
          closePalette();
        } else if (dropdown && dropdown.classList.contains('open')) {
          closePageDropdown();
          if (dropdownToggle) dropdownToggle.focus();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
