/**
 * Porch Widget — the * is the porch light. It's always on.
 * Adds a floating gold * link to the homepage on every non-homepage page.
 */
(function () {
  'use strict';

  // Don't show on the homepage — you're already on the porch
  var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (path === '/' || path === '/index') return;

  var link = document.createElement('a');
  link.href = '/';
  link.className = 'porch-widget';
  link.setAttribute('aria-label', 'Go to the porch — talk to CW');
  link.setAttribute('title', 'the porch');
  link.textContent = '*';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(link);
    });
  } else {
    document.body.appendChild(link);
  }
})();
