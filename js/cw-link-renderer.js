/**
 * CW Link Renderer — makes URLs and markdown links clickable in CW's chat responses.
 *
 * INTEGRATION INSTRUCTIONS (for porch-widget.js):
 * ────────────────────────────────────────────────
 *
 * 1. Add this script tag BEFORE porch-widget.js on any page that loads the widget:
 *
 *      <script src="/js/cw-link-renderer.js"></script>
 *      <script src="/js/porch-widget.js" defer></script>
 *
 * 2. In the addMessage() function (~line 197), change from textContent to innerHTML
 *    for CW messages only:
 *
 *      BEFORE:
 *        msg.textContent = text;
 *
 *      AFTER:
 *        if (sender === 'cw' && window.CWLinkRenderer) {
 *          msg.innerHTML = window.CWLinkRenderer.render(text);
 *        } else {
 *          msg.textContent = text;
 *        }
 *
 *    User messages ('you') stay as textContent — no HTML injection risk.
 *    CW messages are safe because render() escapes all non-link text.
 *
 * 3. CSS for link styling is already in css/porch-widget.css (.porch-msg-cw a rules).
 */
(function () {
  'use strict';

  /**
   * Escape HTML entities to prevent XSS.
   * Applied to all text segments that are NOT links.
   */
  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Determine if a URL is on claudewill.io (same site).
   * Same-site links open in the same window; external links open in a new tab.
   */
  function isSameSite(url) {
    try {
      if (url.indexOf('claudewill.io') !== -1) return true;
      if (url.charAt(0) === '/') return true;
      var parsed = new URL(url, window.location.origin);
      return parsed.hostname === window.location.hostname ||
             parsed.hostname === 'claudewill.io' ||
             parsed.hostname.endsWith('.claudewill.io');
    } catch (e) {
      return false;
    }
  }

  /**
   * Build an <a> tag string.
   */
  function makeLink(url, displayText) {
    var href = url;

    // If it looks like a bare domain path (claudewill.io/something), add https://
    if (href.indexOf('://') === -1 && href.indexOf('claudewill.io') !== -1) {
      href = 'https://' + href;
    }

    var sameSite = isSameSite(href);
    var target = sameSite ? '_self' : '_blank';
    var rel = sameSite ? '' : ' rel="noopener noreferrer"';

    return '<a href="' + escapeHTML(href) + '" target="' + target + '"' + rel + '>' +
           escapeHTML(displayText) + '</a>';
  }

  /**
   * Render CW message text with clickable links.
   *
   * Handles (in order):
   * 1. Markdown-style links: [text](url)
   * 2. Bare URLs: https://..., http://..., claudewill.io/...
   *
   * All non-link text is HTML-escaped to prevent XSS.
   */
  function render(text) {
    if (!text) return '';

    // Step 1: Replace markdown-style links [text](url) with placeholders
    var placeholders = [];
    var PLACEHOLDER = '\x00CWLINK';

    var processed = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, linkText, url) {
      var idx = placeholders.length;
      placeholders.push(makeLink(url, linkText));
      return PLACEHOLDER + idx + '\x00';
    });

    // Step 2: Split on bare URLs and claudewill.io patterns
    // Match: https://..., http://..., or claudewill.io/... (without protocol)
    var urlPattern = /((?:https?:\/\/)?(?:[\w-]+\.)*claudewill\.io(?:\/[^\s,;)]*)?|https?:\/\/[^\s<>,;)"']+)/g;

    var parts = [];
    var lastIndex = 0;
    var urlMatch;

    while ((urlMatch = urlPattern.exec(processed)) !== null) {
      // Skip if this match is inside a placeholder token
      var matchStart = urlMatch.index;
      var insidePlaceholder = false;
      for (var p = 0; p < placeholders.length; p++) {
        var phStart = processed.indexOf(PLACEHOLDER + p + '\x00');
        var phEnd = phStart + (PLACEHOLDER + p + '\x00').length;
        if (matchStart >= phStart && matchStart < phEnd) {
          insidePlaceholder = true;
          break;
        }
      }
      if (insidePlaceholder) continue;

      // Add text before this URL
      if (urlMatch.index > lastIndex) {
        parts.push(escapeHTML(processed.substring(lastIndex, urlMatch.index)));
      }

      // Clean trailing punctuation that probably isn't part of the URL
      var matchedUrl = urlMatch[0];
      var trailingPunct = '';
      var cleanMatch = matchedUrl.replace(/[.,;:!?)]+$/, function (punct) {
        trailingPunct = punct;
        return '';
      });

      parts.push(makeLink(cleanMatch, cleanMatch));
      if (trailingPunct) {
        parts.push(escapeHTML(trailingPunct));
      }

      lastIndex = urlMatch.index + urlMatch[0].length;
    }

    // Add remaining text
    if (lastIndex < processed.length) {
      parts.push(escapeHTML(processed.substring(lastIndex)));
    }

    var result = parts.join('');

    // Step 3: Replace placeholder tokens with actual link HTML
    for (var i = 0; i < placeholders.length; i++) {
      result = result.replace(
        escapeHTML(PLACEHOLDER + i + '\x00'),
        placeholders[i]
      );
    }

    return result;
  }

  // Expose globally for porch-widget.js integration
  window.CWLinkRenderer = {
    render: render
  };
})();
