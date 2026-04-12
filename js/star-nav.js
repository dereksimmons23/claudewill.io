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

  // Four cardinal directions. The asterisk itself is the porch/center.
  var ITEMS = [
    {
      label: 'north',
      href: '/being-claude',
      description: 'the library — essays and the book'
    },
    {
      label: 'east',
      href: '/lightning/bug',
      description: 'the studio — the film, the making'
    },
    {
      label: 'south',
      href: '/kitchen',
      description: 'the kitchen — live operations'
    },
    {
      label: 'west',
      href: '/derek',
      description: 'derek — writer, filmmaker, builder'
    }
  ];

  // Cardinal positions: [tx, ty] in px from viewport center.
  // Each word is centered on its position via CSS translateX(-50%).
  var isMobile = window.innerWidth < 600;
  var POSITIONS = isMobile ? [
    [  0, -110],   // north
    [120,    0],   // east
    [  0,  110],   // south
    [-120,   0]    // west
  ] : [
    [  0, -160],   // north
    [200,    0],   // east
    [  0,  160],   // south
    [-200,   0]    // west
  ];

  // ── State ──────────────────────────────────────

  var overlay;
  var isOpen = false;
  var lastFocused;

  // Ambient mode: compass starts open, no backdrop, no scroll lock.
  // Activated by data-snav-open on <body> (homepage only).
  var ambientMode = document.body.hasAttribute('data-snav-open');

  // ── Build DOM ──────────────────────────────────

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'snav';
    overlay.setAttribute('aria-hidden', 'true');

    // Backdrop: only in overlay mode (closes on outside click)
    if (!ambientMode) {
      var backdrop = document.createElement('div');
      backdrop.className = 'snav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.addEventListener('click', close);
      overlay.appendChild(backdrop);
    }

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

    updateTriggerState(true);

    // Overlay mode only: lock scroll, hide porch widget, focus first item
    if (!ambientMode) {
      document.body.style.overflow = 'hidden';
      var widget = document.querySelector('.porch-widget');
      if (widget) widget.style.display = 'none';
      var first = overlay.querySelector('.snav-link');
      if (first) setTimeout(function () { first.focus(); }, 60);
    }
  }

  function close() {
    if (!isOpen) return;
    overlay.setAttribute('aria-hidden', 'true');
    isOpen = false;

    updateTriggerState(false);

    // Overlay mode only: restore scroll, porch widget, focus
    if (!ambientMode) {
      document.body.style.overflow = '';
      var widget = document.querySelector('.porch-widget');
      if (widget) widget.style.display = '';
      if (lastFocused) lastFocused.focus();
    }
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

    if (ambientMode) {
      // Start open, no entrance animation
      overlay.setAttribute('aria-hidden', 'false');
      isOpen = true;
      updateTriggerState(true);

      // Freeze transitions for first paint so items just appear
      var items = overlay.querySelectorAll('.snav-item');
      for (var i = 0; i < items.length; i++) {
        items[i].style.transition = 'none';
      }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          for (var i = 0; i < items.length; i++) {
            items[i].style.transition = '';
          }
        });
      });
    } else {
      updateTriggerState(false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
