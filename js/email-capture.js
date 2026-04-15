/**
 * Email capture — thin footer bar on every page.
 * Forwards to Substack subscribe with the email pre-filled.
 * Dismissible, remembered for 30 days via localStorage.
 */
(function () {
  'use strict';

  if (document.querySelector('.cw-email-capture')) return;

  var STORAGE_KEY = 'cw-email-capture-dismissed';
  var SUBSCRIBED_KEY = 'cw-email-subscribed';
  var SUBSTACK = 'https://standardderek.substack.com/subscribe';

  // Don't show again for 30 days if dismissed or subscribed
  var dismissed = localStorage.getItem(STORAGE_KEY);
  if (dismissed && Date.now() - parseInt(dismissed, 10) < 30 * 24 * 60 * 60 * 1000) return;
  if (localStorage.getItem(SUBSCRIBED_KEY)) return;

  // Skip the /d gate page (it has its own email input)
  if (/^\/d\/?$/.test(window.location.pathname)) return;

  function build() {
    var style = document.createElement('style');
    style.textContent = [
      '.cw-email-capture{',
      '  position:fixed;left:50%;bottom:24px;transform:translateX(-50%);',
      '  z-index:9996;display:flex;align-items:center;gap:10px;',
      '  background:#0a1628;border:1px solid rgba(212,168,75,0.25);',
      '  border-radius:999px;padding:10px 14px 10px 18px;',
      '  font-family:"IBM Plex Mono","Courier New",Courier,monospace;',
      '  font-size:0.8rem;color:#e0e0e0;',
      '  box-shadow:0 4px 20px rgba(0,0,0,0.35);',
      '  max-width:calc(100vw - 32px);',
      '  transition:opacity 0.3s ease, transform 0.3s ease;',
      '  opacity:0;',
      '}',
      '.cw-email-capture.visible{opacity:1;}',
      '.cw-email-capture-label{white-space:nowrap;color:#9ca3af;}',
      '.cw-email-capture input{',
      '  background:transparent;border:none;outline:none;',
      '  font-family:inherit;font-size:0.85rem;color:#f0f0f0;',
      '  padding:6px 8px;min-width:180px;border-radius:6px;',
      '}',
      '.cw-email-capture input:focus{background:rgba(255,255,255,0.04);}',
      '.cw-email-capture input::placeholder{color:#6b7280;}',
      '.cw-email-capture button{',
      '  background:none;border:1px solid rgba(212,168,75,0.35);',
      '  color:#d4a84b;font-family:inherit;font-size:0.75rem;',
      '  padding:8px 14px;border-radius:999px;cursor:pointer;',
      '  min-height:36px;transition:background 0.2s,color 0.2s;',
      '}',
      '.cw-email-capture button:hover{background:rgba(212,168,75,0.1);}',
      '.cw-email-capture-close{',
      '  background:none !important;border:none !important;',
      '  color:#6b7280 !important;font-size:1.2rem;',
      '  padding:4px 8px !important;line-height:1;min-height:32px;',
      '  margin-left:-4px;',
      '}',
      '.cw-email-capture-close:hover{color:#d4a84b !important;background:none !important;}',
      '@media (max-width:700px){',
      '  .cw-email-capture{',
      '    left:16px;right:16px;bottom:92px;transform:none;',
      '    border-radius:12px;padding:12px;flex-wrap:wrap;',
      '  }',
      '  .cw-email-capture-label{flex-basis:100%;}',
      '  .cw-email-capture input{flex:1;min-width:0;}',
      '}',
      'body.porch-panel-open .cw-email-capture{opacity:0 !important;pointer-events:none;}',
      '@media print{.cw-email-capture{display:none !important;}}'
    ].join('\n');
    document.head.appendChild(style);

    var bar = document.createElement('form');
    bar.className = 'cw-email-capture';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Subscribe to Standard Correspondence');

    var label = document.createElement('span');
    label.className = 'cw-email-capture-label';
    label.textContent = 'standard correspondence';

    var input = document.createElement('input');
    input.type = 'email';
    input.name = 'email';
    input.placeholder = 'your email';
    input.setAttribute('aria-label', 'Email address');
    input.required = true;
    input.autocomplete = 'email';

    var submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'subscribe';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'cw-email-capture-close';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '\u00d7';
    close.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (err) {}
      bar.classList.remove('visible');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 300);
    });

    bar.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (input.value || '').trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.focus();
        return;
      }
      try { localStorage.setItem(SUBSCRIBED_KEY, '1'); } catch (err) {}
      var url = SUBSTACK + '?email=' + encodeURIComponent(email);
      window.open(url, '_blank', 'noopener');
      submit.textContent = 'opening...';
      submit.disabled = true;
      setTimeout(function () {
        bar.classList.remove('visible');
        setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 300);
      }, 800);
    });

    bar.appendChild(label);
    bar.appendChild(input);
    bar.appendChild(submit);
    bar.appendChild(close);
    document.body.appendChild(bar);

    // Fade in after a short delay so it doesn't fight page load
    setTimeout(function () { bar.classList.add('visible'); }, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
