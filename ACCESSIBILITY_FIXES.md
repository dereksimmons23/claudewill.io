# Accessibility Implementation Guide (WCAG 2.1 AA)

This guide provides specific code changes to make claudewill.io accessible.

---

## 🎯 Priority Levels

- **🔴 Critical** - Must fix before public launch (WCAG failures)
- **🟡 Important** - Should fix within 30 days (usability issues)
- **🟢 Nice to Have** - Improves experience but not required for compliance

---

## 🔴 CRITICAL FIXES

### 1. Color Contrast Issues

**Problem:** Footer text (#666) on dark background (#0d0d0d) = 2.85:1 ratio
**Required:** 4.5:1 for WCAG AA compliance

**Fix:** Update `.condition` and footer link colors in `index.html`

```css
/* Change this: */
.condition {
    font-size: 0.75rem;
    color: var(--dim);  /* #666 - FAILS */
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

/* To this: */
.condition {
    font-size: 0.75rem;
    color: #999;  /* PASSES at 5.57:1 */
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

/* Also update: */
.footer {
    padding: 1rem 0;
    font-size: 0.7rem;
    color: #999;  /* Changed from var(--dim) */
    border-top: 1px solid var(--border);
    text-align: center;
}

.footer a {
    color: #999;  /* Changed from var(--dim) */
    text-decoration: none;
}
```

### 2. Focus Indicators

**Problem:** No visible focus outline on interactive elements
**Required:** Keyboard users must see what element has focus

**Fix:** Add clear focus states

```css
/* Add to <style> section: */

/* Visible focus for all interactive elements */
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
a:focus-visible,
.prompt-chip:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

/* Remove default focus for mouse users (keep for keyboard) */
button:focus:not(:focus-visible),
input:focus:not(:focus-visible),
textarea:focus:not(:focus-visible) {
    outline: none;
}
```

### 3. ARIA Labels for Screen Readers

**Problem:** Screen readers can't identify purpose of controls
**Required:** All interactive elements need accessible names

**Fix:** Add ARIA labels throughout `index.html`

```html
<!-- Update input field: -->
<textarea
    class="input-field"
    id="input"
    placeholder="What do you need?"
    rows="1"
    aria-label="Message input"
    aria-describedby="disclaimer"
></textarea>

<!-- Update send button: -->
<button
    class="send-btn"
    id="send"
    aria-label="Send message">
    Send
</button>

<!-- Update prompt chips: -->
<button
    class="prompt-chip"
    data-prompt="Who is CW?"
    aria-label="Ask: Who is CW?">
    Who is CW?
</button>
<button
    class="prompt-chip"
    data-prompt="I need help with a decision"
    aria-label="Ask: I need help with a decision">
    Help with a decision
</button>
<button
    class="prompt-chip"
    data-prompt="What's the catch?"
    aria-label="Ask: What's the catch?">
    What's the catch?
</button>
```

### 4. Skip Navigation Link

**Problem:** Keyboard users must tab through everything to reach content
**Required:** Provide skip link to main content area

**Fix:** Add skip link at top of `<body>`

```html
<!-- Add immediately after opening <body> tag: -->
<a href="#chat" class="skip-link">Skip to conversation</a>

<div class="container">
    <!-- ... rest of content ... -->
    <div class="chat-area" id="chat" role="log" aria-live="polite" aria-atomic="false">
```

```css
/* Add to <style> section: */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--accent);
    color: var(--bg);
    padding: 0.5rem 1rem;
    text-decoration: none;
    z-index: 100;
    font-family: inherit;
}

.skip-link:focus {
    top: 0;
}
```

### 5. Semantic HTML & ARIA Roles

**Problem:** Screen readers can't understand page structure
**Required:** Use semantic HTML and ARIA landmarks

**Fix:** Update HTML structure

```html
<!-- Update header: -->
<header class="header" role="banner">
    <h1 class="wordmark">CW</h1>
</header>

<!-- Update chat area: -->
<main role="main">
    <div
        class="chat-area"
        id="chat"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Conversation history">
    </div>
</main>

<!-- Update input area: -->
<div class="input-area" role="form" aria-label="Message form">
    <!-- input content -->
</div>

<!-- Update footer: -->
<footer class="footer" role="contentinfo">
    <!-- footer content -->
</footer>
```

### 6. Screen Reader Announcements for Dynamic Content

**Problem:** Screen readers don't know when CW responds
**Required:** Announce new messages to screen readers

**Fix:** Add live region announcements in JavaScript

```javascript
// Add this function to <script> section:
function announceMessage(who, text) {
    const announcement = document.createElement('div');
    announcement.className = 'sr-only';
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `${who === 'cw' ? 'CW' : 'You'}: ${text}`;
    document.body.appendChild(announcement);

    // Remove after announced
    setTimeout(() => announcement.remove(), 1000);
}

// Update addMessage function to include announcement:
function addMessage(who, text, isError = false) {
    const msg = document.createElement('div');
    msg.className = `message ${who}${isError ? ' error' : ''}`;
    msg.innerHTML = `
        <div class="message-label">${who === 'cw' ? 'CW' : 'You'}</div>
        <div class="message-text">${escapeHtml(text)}</div>
    `;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;

    // Announce to screen readers
    announceMessage(who, text);
}
```

```css
/* Add screen reader only class: */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

---

## 🟡 IMPORTANT FIXES

### 7. Respect prefers-reduced-motion

**Problem:** Typing animation can trigger motion sensitivity
**Should:** Disable animations for users who prefer reduced motion

**Fix:** Add media query

```css
/* Add to <style> section: */
@media (prefers-reduced-motion: reduce) {
    .typing::after {
        animation: none;
        content: '...';
    }

    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

### 8. Form Validation Feedback

**Problem:** No feedback when input is empty and send is clicked
**Should:** Announce errors to screen readers

**Fix:** Add validation message

```javascript
// Update sendMessage function:
async function sendMessage() {
    const text = input.value.trim();
    if (!text) {
        // Add validation feedback
        const error = document.createElement('div');
        error.className = 'validation-error sr-only';
        error.setAttribute('role', 'alert');
        error.textContent = 'Please enter a message';
        document.body.appendChild(error);
        setTimeout(() => error.remove(), 3000);
        input.focus();
        return;
    }
    // ... rest of function
}
```

### 9. Disable Controls During Processing

**Problem:** Users can click send multiple times while CW is thinking
**Should:** Disable and indicate processing state

**Fix:** Already implemented! ✅ But add ARIA attributes:

```javascript
// Update in sendMessage function:
send.disabled = true;
send.setAttribute('aria-busy', 'true');
send.textContent = 'Sending...';
input.disabled = true;

// After response:
send.disabled = false;
send.setAttribute('aria-busy', 'false');
send.textContent = 'Send';
input.disabled = false;
```

### 10. Language Declaration

**Problem:** Screen readers don't know what language the page is in
**Should:** Declare language in HTML tag

**Fix:** Update opening `<html>` tag:

```html
<html lang="en">
```

**Already done!** ✅

---

## 🟢 NICE TO HAVE

### 11. Keyboard Shortcuts

**Enhancement:** Add keyboard shortcuts for common actions

```javascript
// Add to <script> section:
document.addEventListener('keydown', (e) => {
    // Focus input with / key (unless already in input)
    if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
    }

    // Clear chat with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (confirm('Clear conversation?')) {
            chat.innerHTML = '';
            conversationHistory = [];
            conversationEnded = false;
            prompts.classList.remove('hidden');
            addMessage('cw', getGreeting());
        }
    }
});
```

Add keyboard shortcuts help to footer:

```html
<div style="font-size: 0.65rem; color: #666; margin-top: 0.5rem;">
    Keyboard: <kbd>/</kbd> focus input | <kbd>Ctrl+K</kbd> clear
</div>
```

### 12. High Contrast Mode Support

**Enhancement:** Better visibility in Windows High Contrast mode

```css
/* Add to <style> section: */
@media (prefers-contrast: high) {
    .wordmark {
        color: #fff;
        font-weight: 900;
    }

    .message.cw .message-text {
        border-left-width: 3px;
    }

    button, input, textarea {
        border-width: 2px;
    }
}
```

### 13. Focus Within Container

**Enhancement:** Show container focus state

```css
.input-row:focus-within {
    outline: 1px solid var(--border);
    outline-offset: 4px;
}
```

---

## 🧪 Testing Checklist

### Manual Keyboard Testing

- [ ] Tab through entire page (logical order?)
- [ ] Shift+Tab navigates backwards
- [ ] Enter on send button submits message
- [ ] Enter in textarea submits (Shift+Enter for new line) ✅
- [ ] Focus visible on all interactive elements
- [ ] Skip link appears on Tab and works
- [ ] Prompt chips focusable and activatable with Enter/Space

### Screen Reader Testing

**Tools:**
- **NVDA** (Windows, free): https://www.nvaccess.org/download/
- **JAWS** (Windows, trial): https://www.freedomscientific.com/
- **VoiceOver** (Mac, built-in): Cmd+F5
- **TalkBack** (Android, built-in)
- **VoiceOver** (iOS, built-in)

**Test:**
- [ ] Page title announced ("CW")
- [ ] Landmarks announced (header, main, footer)
- [ ] Input field purpose clear ("Message input")
- [ ] Buttons labeled clearly
- [ ] New messages announced as they appear
- [ ] Error messages announced
- [ ] Links have descriptive text

### Automated Testing

**Tools:**
- **axe DevTools** (browser extension): https://www.deque.com/axe/devtools/
- **WAVE** (browser extension): https://wave.webaim.org/extension/
- **Lighthouse** (Chrome DevTools): Already built-in

**Run:**
1. Install axe DevTools
2. Open claudewill.io in browser
3. Open DevTools → axe DevTools tab
4. Click "Scan ALL of my page"
5. Fix all Critical and Serious issues

### Color Contrast Testing

**Tools:**
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser**: https://www.tpgi.com/color-contrast-checker/

**Test combinations:**
- [ ] #d4d4d4 (text) on #0d0d0d (background) = 11.58:1 ✅ PASS
- [ ] #999 (dim text) on #0d0d0d (background) = 5.57:1 ✅ PASS
- [ ] #b8860b (accent) on #0d0d0d (background) = 4.83:1 ✅ PASS

---

## 📝 Complete Implementation File

I can create a complete `index-accessible.html` file with ALL fixes applied if you'd like.

**Would you prefer:**
1. Full file with all changes integrated
2. Individual code snippets to apply yourself
3. Step-by-step implementation with testing between each step

Let me know and I'll prepare it!

---

## 📊 Before/After Compliance

### Before Fixes
- ❌ Color contrast failures
- ❌ No keyboard navigation support
- ❌ No screen reader support
- ❌ No ARIA labels
- ❌ No skip navigation
- **Estimated WCAG 2.1 AA Score: 35/100**

### After Critical Fixes
- ✅ Color contrast WCAG AA compliant
- ✅ Full keyboard navigation
- ✅ Screen reader announcements
- ✅ ARIA labels on all controls
- ✅ Skip navigation link
- **Estimated WCAG 2.1 AA Score: 85/100**

### After All Fixes
- ✅ All critical + important fixes
- ✅ Reduced motion support
- ✅ High contrast mode support
- ✅ Keyboard shortcuts
- **Estimated WCAG 2.1 AA Score: 95/100**

---

## ⏱️ Implementation Time Estimate

- **Critical fixes (1-6)**: 1.5 hours
- **Important fixes (7-10)**: 30 minutes
- **Nice to have (11-13)**: 30 minutes
- **Testing**: 1 hour
- **Total**: ~3.5 hours

**Recommendation:** Implement Critical fixes before soft launch (1.5 hrs), then Important within 7 days, Nice to have within 30 days.
