/**
 * Star Nav — Radial Orbital Menu
 * claudewill.io
 *
 * The asterisk is the only nav. Five satellites orbit out on click.
 * Fully accessible: ARIA menu pattern, keyboard nav, 44px targets,
 * reduced-motion support, screen-reader labels throughout.
 *
 * Intercepts .palette-trigger clicks before shared-nav.js fires.
 * Drop onto any page. No dependencies.
 */

(function () {
  'use strict';

  // ── Configuration ─────────────────────────────

  var ITEMS = [
    {
      label: 'porch',
      href: null,
      action: 'porch',
      description: 'talk to cw'
    },
    {
      label: 'library',
      href: '/being-claude',
      description: 'essays from inside the machine'
    },
    {
      label: 'studio',
      href: '/lightning/bug',
      description: 'the film, the making'
    },
    {
      label: 'kitchen',
      href: '/kitchen',
      description: 'live operations'
    },
    {
      label: 'derek',
      href: '/derek',
      description: 'writer, filmmaker, builder'
    }
  ];

  // Arc positions: [tx, ty] in px from viewport center.
  // Symmetric sunrise arc — fans left-to-right below the asterisk.
  // Each pill is centered on its arc position via CSS translateX(-50%).
  // Desktop: wider arc. Mobile: tighter arc to stay in viewport.
  var isMobile = window.innerWidth < 600;
  var POSITIONS = isMobile ? [
    [-110,  20],   // far left
    [ -68, 100],   // left and below
    [   0, 130],   // straight down
    [  68, 100],   // right and below
    [ 110,  20]    // far right
  ] : [
    [-195,  30],   // far left
    [-115, 140],   // left arc
    [   0, 175],   // straight down
    [ 115, 140],   // right arc
    [ 195,  30]    // far right
  ];

  // ── State ──────────────────────────────────────

  var overlay;
  var isOpen = false;
  var lastFocused;

  // ── Build DOM ──────────────────────────────────

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'snav';
    overlay.setAttribute('aria-hidden', 'true');

    // Invisible backdrop — closes on outside click
    var backdrop = document.createElement('div');
    backdrop.className = 'snav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', close);
    overlay.appendChild(backdrop);

    // Menu
    var menu = document.createElement('ul');
    menu.className = 'snav-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Site navigation');

    ITEMS.forEach(function (item, i) {
      var li = document.createElement('li');
      li.className = 'snav-item';
      li.setAttribute('role', 'none');
      li.style.setProperty('--tx', POSITIONS[i][0] + 'px');
      li.style.setProperty('--ty', POSITIONS[i][1] + 'px');
      // Stagger delays set via CSS nth-child, but also as data for JS
      li.dataset.index = i;

      var el;
      if (item.action === 'porch') {
        el = document.createElement('button');
        el.type = 'button';
        el.addEventListener('click', function () {
          close();
          var widget = document.querySelector('.porch-widget');
          if (widget) {
            setTimeout(function () { widget.click(); }, 80);
          }
        });
      } else {
        el = document.createElement('a');
        el.href = item.href;
      }

      el.className = 'snav-link';
      el.setAttribute('role', 'menuitem');
      // Full accessible label includes description
      el.setAttribute('aria-label', item.label + ' — ' + item.description);
      el.textContent = item.label;

      li.appendChild(el);
      menu.appendChild(li);
    });

    // Keyboard navigation within menu (WAI-ARIA menu pattern)
    menu.addEventListener('keydown', handleMenuKey);

    overlay.appendChild(menu);
    document.body.appendChild(overlay);
  }

  function handleMenuKey(e) {
    var links = Array.from(overlay.querySelectorAll('.snav-link'));
    var idx = links.indexOf(document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        links[(idx + 1) % links.length].focus();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        links[(idx - 1 + links.length) % links.length].focus();
        break;

      case 'Home':
        e.preventDefault();
        links[0].focus();
        break;

      case 'End':
        e.preventDefault();
        links[links.length - 1].focus();
        break;

      case 'Tab':
        // Tab exits the menu (ARIA menu role convention)
        close();
        break;
    }
  }

  // ── Open / Close ───────────────────────────────

  function open() {
    if (isOpen) return;
    lastFocused = document.activeElement;
    overlay.setAttribute('aria-hidden', 'false');
    isOpen = true;

    // Update trigger aria state
    updateTriggerState(true);

    // Hide porch widget while nav is open
    var widget = document.querySelector('.porch-widget');
    if (widget) widget.style.display = 'none';

    // Focus first item after animation starts
    var first = overlay.querySelector('.snav-link');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function close() {
    if (!isOpen) return;
    overlay.setAttribute('aria-hidden', 'true');
    isOpen = false;

    updateTriggerState(false);

    // Restore porch widget
    var widget = document.querySelector('.porch-widget');
    if (widget) widget.style.display = '';

    // Return focus to the trigger that opened it
    if (lastFocused) lastFocused.focus();
  }

  function toggle() {
    if (isOpen) close(); else open();
  }

  function updateTriggerState(opened) {
    var triggers = document.querySelectorAll('.palette-trigger');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].setAttribute('aria-expanded', opened ? 'true' : 'false');
      triggers[i].setAttribute('aria-haspopup', 'menu');
    }
  }

  // ── Wire triggers ─────────────────────────────

  function wireTriggers() {
    // Use capture phase so we intercept before shared-nav.js fires openPalette()
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.palette-trigger');
      if (!trigger) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      toggle();
    }, true);
  }

  // ── Global keyboard ───────────────────────────

  function wireKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        close();
      }
    });
  }

  // ── Init ──────────────────────────────────────

  function init() {
    build();
    wireTriggers();
    wireKeyboard();

    // Set initial aria state on triggers
    updateTriggerState(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
