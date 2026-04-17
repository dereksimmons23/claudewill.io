/**
 * Email capture — thin footer pill + inline modal with Substack embed iframe.
 * No redirect; user subscribes without leaving claudewill.io.
 * Dismissible, remembered for 30 days via localStorage.
 */
(function () {
  'use strict';

  if (document.querySelector('.cw-email-capture')) return;

  var STORAGE_KEY = 'cw-email-capture-dismissed';
  var SUBSCRIBED_KEY = 'cw-email-subscribed';
  var EMBED_URL = 'https://derek4thecws.substack.com/embed';

  var dismissed = localStorage.getItem(STORAGE_KEY);
  if (dismissed && Date.now() - parseInt(dismissed, 10) < 30 * 24 * 60 * 60 * 1000) return;
  if (localStorage.getItem(SUBSCRIBED_KEY)) return;

  if (/^\/d\/?$/.test(window.location.pathname)) return;

  function build() {
    var style = document.createElement('style');
    style.textContent = [
      '.cw-email-capture{',
      '  position:fixed;left:50%;bottom:24px;transform:translateX(-50%);',
      '  z-index:9996;display:flex;align-items:center;gap:12px;',
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
      '    border-radius:12px;padding:12px;justify-content:space-between;',
      '  }',
      '}',
      'body.porch-panel-open .cw-email-capture{opacity:0 !important;pointer-events:none;}',
      '@media print{.cw-email-capture{display:none !important;}}',
      '.cw-subscribe-modal{',
      '  position:fixed;inset:0;z-index:10001;',
      '  background:rgba(10,22,40,0.72);backdrop-filter:blur(4px);',
      '  display:flex;align-items:center;justify-content:center;',
      '  padding:24px;opacity:0;transition:opacity 0.2s ease;',
      '  pointer-events:none;',
      '}',
      '.cw-subscribe-modal.visible{opacity:1;pointer-events:auto;}',
      '.cw-subscribe-panel{',
      '  background:#0a1628;border:1px solid rgba(212,168,75,0.25);',
      '  border-radius:14px;padding:28px 24px 20px;',
      '  max-width:440px;width:100%;',
      '  box-shadow:0 20px 60px rgba(0,0,0,0.6);',
      '  font-family:"IBM Plex Mono","Courier New",Courier,monospace;',
      '  color:#e0e0e0;position:relative;',
      '}',
      '.cw-subscribe-panel-close{',
      '  position:absolute;top:10px;right:14px;',
      '  background:none;border:none;color:#6b7280;',
      '  font-size:1.5rem;line-height:1;cursor:pointer;',
      '  padding:4px 8px;',
      '}',
      '.cw-subscribe-panel-close:hover{color:#d4a84b;}',
      '.cw-subscribe-panel h3{',
      '  margin:0 0 6px;font-size:1rem;color:#d4a84b;font-weight:500;',
      '}',
      '.cw-subscribe-panel p{',
      '  margin:0 0 16px;font-size:0.8rem;color:#9ca3af;line-height:1.5;',
      '}',
      '.cw-subscribe-panel iframe{',
      '  width:100%;border:none;border-radius:8px;',
      '  background:#fff;',
      '  height:120px;display:block;',
      '}',
      '.cw-subscribe-panel-footnote{',
      '  margin-top:12px !important;font-size:0.7rem !important;',
      '  color:#6b7280 !important;text-align:center;',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'cw-email-capture';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Subscribe to Standard Correspondence');

    var label = document.createElement('span');
    label.className = 'cw-email-capture-label';
    label.textContent = 'standard correspondence';

    var subscribe = document.createElement('button');
    subscribe.type = 'button';
    subscribe.textContent = 'subscribe';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'cw-email-capture-close';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '\u00d7';
    close.addEventListener('click', function () {
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (err) {}
      bar.classList.remove('visible');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 300);
    });

    subscribe.addEventListener('click', openModal);

    bar.appendChild(label);
    bar.appendChild(subscribe);
    bar.appendChild(close);
    document.body.appendChild(bar);

    setTimeout(function () { bar.classList.add('visible'); }, 1200);
  }

  function openModal() {
    var existing = document.querySelector('.cw-subscribe-modal');
    if (existing) {
      existing.classList.add('visible');
      return;
    }

    var modal = document.createElement('div');
    modal.className = 'cw-subscribe-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Subscribe to Standard Correspondence');

    var panel = document.createElement('div');
    panel.className = 'cw-subscribe-panel';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cw-subscribe-panel-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00d7';

    var title = document.createElement('h3');
    title.textContent = 'standard correspondence';

    var desc = document.createElement('p');
    desc.textContent = 'A letter from the sky. New writing, links home.';

    var iframe = document.createElement('iframe');
    iframe.src = EMBED_URL;
    iframe.setAttribute('title', 'Subscribe to Standard Correspondence');
    iframe.setAttribute('loading', 'lazy');

    var foot = document.createElement('p');
    foot.className = 'cw-subscribe-panel-footnote';
    foot.textContent = 'You will receive a confirmation email to finish subscribing.';

    panel.appendChild(closeBtn);
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(iframe);
    panel.appendChild(foot);
    modal.appendChild(panel);
    document.body.appendChild(modal);

    requestAnimationFrame(function () { modal.classList.add('visible'); });

    function close() {
      try { localStorage.setItem(SUBSCRIBED_KEY, '1'); } catch (err) {}
      modal.classList.remove('visible');
      setTimeout(function () {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 200);
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', onKey);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
