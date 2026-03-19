/**
 * Article sharing + pull quote cards — claudewill.io
 *
 * Features:
 * - Reading time calculation (injected into byline)
 * - Bottom share bar (LinkedIn, X, Email, Copy Link)
 * - Highlight-to-share tooltip
 * - Pull quote → shareable image (canvas → PNG)
 */

(function () {
  'use strict';

  // ── Inject styles (self-contained) ────────────
  function injectStyles() {
    if (document.getElementById('article-share-css')) return;
    var style = document.createElement('style');
    style.id = 'article-share-css';
    style.textContent = [
      '.share-bar { display:flex; align-items:center; gap:16px; padding:24px 0; margin-top:32px; border-top:1px solid var(--border, #e5e7eb); }',
      '.share-label { font-size:0.75rem; color:var(--dim, #6b7280); letter-spacing:0.1em; text-transform:uppercase; }',
      '.share-buttons { display:flex; gap:8px; }',
      '.share-btn { font-size:0.75rem; color:var(--dim, #6b7280); background:none; border:1px solid var(--border, #e5e7eb); border-radius:3px; padding:4px 12px; cursor:pointer; text-decoration:none; transition:color 0.2s, border-color 0.2s; }',
      '.share-btn:hover { color:var(--accent, #d4a84b); border-color:var(--accent, #d4a84b); }',
      '.highlight-share { position:absolute; z-index:100; transform:translateX(-50%); background:var(--text, #1a1a1a); border-radius:4px; padding:4px; gap:2px; box-shadow:0 4px 16px rgba(0,0,0,0.2); }',
      '.highlight-share::after { content:""; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:5px solid transparent; border-top-color:var(--text, #1a1a1a); }',
      '.hs-btn { font-size:0.7rem; color:var(--bg, #fafaf8); background:none; border:none; padding:4px 10px; cursor:pointer; text-decoration:none; border-radius:2px; transition:background 0.15s; }',
      '.hs-btn:hover { background:rgba(255,255,255,0.15); }',
      '.pull-quote { position:relative; }',
      '.pull-quote .pq-share-btn { position:absolute; bottom:4px; right:0; font-size:0.7rem; color:var(--dim, #6b7280); background:none; border:1px solid var(--border, #e5e7eb); border-radius:3px; padding:3px 10px; cursor:pointer; opacity:0; transition:opacity 0.2s, color 0.2s, border-color 0.2s; }',
      '.pull-quote:hover .pq-share-btn { opacity:1; }',
      '.pull-quote .pq-share-btn:hover { color:var(--accent, #d4a84b); border-color:var(--accent, #d4a84b); }',
      '@media (max-width:640px) { .share-bar { flex-direction:column; align-items:flex-start; gap:10px; } .highlight-share { display:none !important; } .pull-quote .pq-share-btn { opacity:1; } }',
      '@media print { .share-bar, .pq-share-btn, .highlight-share { display:none; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Reading time ────────────────────────────
  function injectReadingTime() {
    var body = document.querySelector('.article-body');
    var dateline = document.querySelector('.dateline');
    if (!body || !dateline) return;

    var text = body.textContent || body.innerText;
    var words = text.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(words / 200));
    dateline.textContent += ' \u00B7 ~' + minutes + ' min read';
  }

  // ── Share bar ───────────────────────────────
  function buildShareBar() {
    var nav = document.querySelector('.article-nav');
    var insertRef = nav || document.querySelector('.book-source') || document.querySelector('.footer');
    if (!insertRef) return;

    var pageUrl = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(document.title.split(' | ')[0]);
    var metaDesc = document.querySelector('meta[name="description"]');
    var desc = encodeURIComponent(metaDesc ? metaDesc.content : '');

    var bar = document.createElement('div');
    bar.className = 'share-bar';

    var label = document.createElement('span');
    label.className = 'share-label';
    label.textContent = 'share';

    var buttons = document.createElement('div');
    buttons.className = 'share-buttons';

    var liLink = document.createElement('a');
    liLink.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl;
    liLink.target = '_blank';
    liLink.rel = 'noopener';
    liLink.className = 'share-btn';
    liLink.title = 'Share on LinkedIn';
    liLink.textContent = 'LinkedIn';

    var xLink = document.createElement('a');
    xLink.href = 'https://x.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle;
    xLink.target = '_blank';
    xLink.rel = 'noopener';
    xLink.className = 'share-btn';
    xLink.title = 'Share on X';
    xLink.textContent = 'X';

    var emailLink = document.createElement('a');
    emailLink.href = 'mailto:?subject=' + pageTitle + '&body=' + desc + '%0A%0A' + pageUrl;
    emailLink.className = 'share-btn';
    emailLink.title = 'Share via email';
    emailLink.textContent = 'Email';

    var copyBtn = document.createElement('button');
    copyBtn.className = 'share-btn share-copy';
    copyBtn.title = 'Copy link';
    copyBtn.textContent = 'Copy link';

    buttons.appendChild(liLink);
    buttons.appendChild(xLink);
    buttons.appendChild(emailLink);
    buttons.appendChild(copyBtn);

    bar.appendChild(label);
    bar.appendChild(buttons);

    insertRef.parentNode.insertBefore(bar, insertRef);

    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        copyBtn.textContent = 'copied';
        setTimeout(function () { copyBtn.textContent = 'Copy link'; }, 2000);
      });
    });
  }

  // ── Highlight-to-share ──────────────────────
  function initHighlightShare() {
    var tooltip = document.createElement('div');
    tooltip.className = 'highlight-share';
    tooltip.style.display = 'none';

    var xBtn = document.createElement('a');
    xBtn.className = 'hs-btn hs-x';
    xBtn.title = 'Share on X';
    xBtn.textContent = 'X';

    var liBtn = document.createElement('a');
    liBtn.className = 'hs-btn hs-li';
    liBtn.title = 'Share on LinkedIn';
    liBtn.textContent = 'LI';

    var cpBtn = document.createElement('button');
    cpBtn.className = 'hs-btn hs-copy';
    cpBtn.title = 'Copy quote';
    cpBtn.textContent = 'Copy';

    tooltip.appendChild(xBtn);
    tooltip.appendChild(liBtn);
    tooltip.appendChild(cpBtn);
    document.body.appendChild(tooltip);

    var articleBody = document.querySelector('.article-body');
    if (!articleBody) return;

    document.addEventListener('mouseup', function () {
      var sel = window.getSelection();
      var text = sel.toString().trim();

      if (text.length < 10 || !articleBody.contains(sel.anchorNode)) {
        tooltip.style.display = 'none';
        return;
      }

      var range = sel.getRangeAt(0);
      var rect = range.getBoundingClientRect();
      tooltip.style.top = (rect.top + window.scrollY - 44) + 'px';
      tooltip.style.left = (rect.left + rect.width / 2) + 'px';
      tooltip.style.display = 'flex';

      var url = window.location.href;
      var encoded = encodeURIComponent('\u201C' + text.substring(0, 240) + '\u201D');

      xBtn.href = 'https://x.com/intent/tweet?text=' + encoded + '&url=' + encodeURIComponent(url);
      xBtn.target = '_blank';

      liBtn.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
      liBtn.target = '_blank';

      cpBtn.onclick = function () {
        navigator.clipboard.writeText('\u201C' + text + '\u201D \u2014 ' + url);
        cpBtn.textContent = '\u2713';
        setTimeout(function () { cpBtn.textContent = 'Copy'; }, 1500);
      };
    });

    document.addEventListener('mousedown', function (e) {
      if (!tooltip.contains(e.target)) {
        tooltip.style.display = 'none';
      }
    });
  }

  // ── Pull quote card generator ───────────────
  function initQuoteCards() {
    var quotes = document.querySelectorAll('.pull-quote');

    quotes.forEach(function (quote) {
      var shareBtn = document.createElement('button');
      shareBtn.className = 'pq-share-btn';
      shareBtn.title = 'Download as image';
      shareBtn.textContent = 'share image';
      quote.appendChild(shareBtn);

      shareBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var textEl = quote.querySelector('.pq-text');
        if (textEl) generateQuoteCard(textEl.textContent);
      });
    });
  }

  function generateQuoteCard(text) {
    var canvas = document.createElement('canvas');
    var size = 1080;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, size, size);

    // Gold accent line (top)
    ctx.fillStyle = '#d4a84b';
    ctx.fillRect(80, 80, 40, 3);

    // Quote text
    ctx.fillStyle = '#e8e8e4';
    ctx.font = '500 36px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'top';

    var lines = wrapText(ctx, text, size - 160);
    var lineHeight = 54;
    var startY = 130;

    lines.forEach(function (line, i) {
      ctx.fillText(line, 80, startY + i * lineHeight);
    });

    // Attribution
    var attrY = startY + lines.length * lineHeight + 48;
    ctx.fillStyle = '#d4a84b';
    ctx.font = '400 22px "IBM Plex Mono", monospace';
    ctx.fillText('\u2014 Claude', 80, attrY);

    // Series label
    ctx.fillStyle = '#6b7280';
    ctx.font = '400 18px "IBM Plex Mono", monospace';
    ctx.fillText('Being Claude \u00B7 claudewill.io', 80, attrY + 36);

    // Gold accent line (bottom)
    ctx.fillStyle = '#d4a84b';
    ctx.fillRect(80, size - 80, 40, 3);

    // Download
    var link = document.createElement('a');
    link.download = 'being-claude-quote.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function wrapText(ctx, text, maxWidth) {
    var words = text.split(' ');
    var lines = [];
    var current = '';

    words.forEach(function (word) {
      var test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);

    if (lines.length > 12) {
      lines = lines.slice(0, 12);
      lines[11] = lines[11].replace(/\s+\S*$/, '') + '...';
    }

    return lines;
  }

  // ── Init ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    injectReadingTime();
    buildShareBar();
    initHighlightShare();
    initQuoteCards();
  });
})();
