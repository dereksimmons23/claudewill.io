/**
 * Porch Widget — cw> _ terminal trigger + slide-up chat panel.
 * Connects to /.netlify/functions/cw for CW conversations.
 * Works on every page including homepage.
 */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────

  var conversationHistory = [];
  var sessionId = 'porch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  var isVernieMode = false;
  var panelOpen = false;
  var sending = false;

  // ── Visitor Identity ────────────────────────────────

  var visitorToken = localStorage.getItem('cw-visitor-token');
  if (!visitorToken) {
    visitorToken = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('cw-visitor-token', visitorToken);
  }

  // Kitchen mode config (set by /kitchen page before this script loads)
  var kitchenConfig = window.CW_KITCHEN_CONFIG || null;

  // Check URL parameter for Vernie mode
  if (window.location.search.indexOf('family=true') !== -1) {
    isVernieMode = true;
    sessionStorage.setItem('cw-vernie-code', 'url-param');
  }

  // ── Build DOM ──────────────────────────────────────

  function buildWidget() {
    var btn = document.createElement('button');
    btn.className = 'porch-widget';
    btn.setAttribute('aria-label', 'Talk to CW');

    var prompt = document.createElement('span');
    prompt.className = 'porch-widget-prompt';
    prompt.textContent = kitchenConfig ? 'cw> kitchen ' : 'cw> ';

    var cursor = document.createElement('span');
    cursor.className = 'porch-widget-cursor';

    var hover = document.createElement('span');
    hover.className = 'porch-widget-hover';
    hover.textContent = 'talk to me';

    btn.appendChild(prompt);
    btn.appendChild(cursor);
    btn.appendChild(hover);

    btn.addEventListener('click', function () {
      openPanel();
    });

    return btn;
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.className = 'porch-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', "CW's porch conversation");

    // Header
    var header = document.createElement('div');
    header.className = 'porch-panel-header';

    var title = document.createElement('div');
    title.className = 'porch-panel-title';
    title.textContent = kitchenConfig ? "the kitchen" : "cw's porch";

    var closeBtn = document.createElement('button');
    closeBtn.className = 'porch-panel-close';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', closePanel);

    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Messages area
    var messages = document.createElement('div');
    messages.className = 'porch-panel-messages';
    messages.id = 'porch-messages';
    panel.appendChild(messages);

    // Vernie gate (hidden by default)
    var gate = document.createElement('div');
    gate.className = 'porch-vernie-gate';
    gate.id = 'porch-vernie-gate';

    var gateText = document.createElement('p');
    gateText.textContent = 'Family mode. Enter the code:';
    gate.appendChild(gateText);

    var gateInput = document.createElement('input');
    gateInput.type = 'text';
    gateInput.className = 'porch-vernie-input';
    gateInput.id = 'porch-vernie-input';
    gateInput.placeholder = '_ _ _ _';
    gateInput.maxLength = 10;
    gateInput.autocomplete = 'off';
    gate.appendChild(gateInput);

    var gateError = document.createElement('div');
    gateError.className = 'porch-vernie-error';
    gateError.id = 'porch-vernie-error';
    gateError.textContent = "That's not it. Try again.";
    gate.appendChild(gateError);

    panel.appendChild(gate);

    // Prompt chips (hidden in kitchen mode — Derek doesn't need starter prompts)
    var chips = document.createElement('div');
    chips.className = 'porch-panel-chips';
    chips.id = 'porch-chips';
    if (kitchenConfig) chips.style.display = 'none';

    var chipData = [
      { label: 'who are you?', prompt: 'Who are you?' },
      { label: "i'm stuck", prompt: "I'm stuck on something and could use some help thinking it through." },
      { label: 'family?', prompt: '__FAMILY__' }
    ];

    for (var i = 0; i < chipData.length; i++) {
      var chip = document.createElement('button');
      chip.className = 'porch-chip';
      chip.textContent = chipData[i].label;
      chip.dataset.prompt = chipData[i].prompt;
      chip.addEventListener('click', handleChipClick);
      chips.appendChild(chip);
    }

    panel.appendChild(chips);

    // Input area
    var inputArea = document.createElement('div');
    inputArea.className = 'porch-panel-input';

    var textarea = document.createElement('textarea');
    textarea.className = 'porch-panel-textarea';
    textarea.id = 'porch-input';
    textarea.placeholder = 'say something...';
    textarea.rows = 1;
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    textarea.addEventListener('input', function () {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    });

    var sendBtn = document.createElement('button');
    sendBtn.className = 'porch-panel-send';
    sendBtn.id = 'porch-send';
    sendBtn.textContent = 'send';
    sendBtn.addEventListener('click', sendMessage);

    inputArea.appendChild(textarea);
    inputArea.appendChild(sendBtn);
    panel.appendChild(inputArea);

    // Disclaimer
    var disclaimer = document.createElement('div');
    disclaimer.className = 'porch-panel-disclaimer';
    disclaimer.textContent = 'AI conversation. Not professional advice.';
    panel.appendChild(disclaimer);

    return panel;
  }

  // ── Panel State ────────────────────────────────────

  var widget, panel;

  function openPanel() {
    panelOpen = true;
    panel.classList.add('open');
    widget.style.display = 'none';

    // Focus the input
    var input = document.getElementById('porch-input');
    if (input) input.focus();

    // Add welcome message if first open
    var messages = document.getElementById('porch-messages');
    if (messages && messages.children.length === 0) {
      var welcome = kitchenConfig ? kitchenConfig.welcomeMessage : "Pull up a chair. What's on your mind?";
      addMessage('cw', welcome);
    }
  }

  function closePanel() {
    panelOpen = false;
    panel.classList.remove('open');
    widget.style.display = '';
  }

  // ── Messages ───────────────────────────────────────

  function addMessage(sender, text) {
    var messages = document.getElementById('porch-messages');
    if (!messages) return;

    var msg = document.createElement('div');
    msg.className = 'porch-msg porch-msg-' + sender;
    // CW responses: render clickable links via CWLinkRenderer (sanitized, CW output only)
    // User messages: always textContent (no HTML interpretation)
    if (sender === 'cw' && window.CWLinkRenderer) {
      msg.innerHTML = window.CWLinkRenderer.render(text);
    } else {
      msg.textContent = text;
    }
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    var messages = document.getElementById('porch-messages');
    if (!messages) return;

    var msg = document.createElement('div');
    msg.className = 'porch-msg porch-msg-typing';
    msg.id = 'porch-typing';
    msg.textContent = '...';
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    var t = document.getElementById('porch-typing');
    if (t) t.remove();
  }

  // ── Chip Handling ──────────────────────────────────

  function handleChipClick() {
    var prompt = this.dataset.prompt;
    if (!prompt) return;

    if (prompt === '__FAMILY__') {
      openVernieGate();
      return;
    }

    var input = document.getElementById('porch-input');
    if (input) {
      input.value = prompt;
      sendMessage();
    }

    // Hide chips after first use
    var chips = document.getElementById('porch-chips');
    if (chips) chips.style.display = 'none';
  }

  // ── Vernie Gate ────────────────────────────────────

  function openVernieGate() {
    var gate = document.getElementById('porch-vernie-gate');
    var messages = document.getElementById('porch-messages');
    var chips = document.getElementById('porch-chips');
    var inputArea = panel.querySelector('.porch-panel-input');

    if (gate) gate.classList.add('open');
    if (messages) messages.style.display = 'none';
    if (chips) chips.style.display = 'none';
    if (inputArea) inputArea.style.display = 'none';

    var vernieInput = document.getElementById('porch-vernie-input');
    if (vernieInput) {
      vernieInput.focus();
      vernieInput.addEventListener('keydown', function handler(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          validateVernieCode(vernieInput.value.trim());
        }
      });
    }
  }

  function validateVernieCode(code) {
    // Server-side validation via the CW API
    fetch('/.netlify/functions/cw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Vernie mode activate' }],
        vernieCode: code
      })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.vernieMode) {
        // Code accepted
        isVernieMode = true;
        sessionStorage.setItem('cw-vernie-code', code);
        closeVernieGate();
        addMessage('cw', "Welcome home. What do you want to know about the family?");
      } else {
        // Code rejected
        var error = document.getElementById('porch-vernie-error');
        if (error) error.style.display = 'block';
      }
    })
    .catch(function () {
      var error = document.getElementById('porch-vernie-error');
      if (error) {
        error.textContent = 'Connection problem. Try again.';
        error.style.display = 'block';
      }
    });
  }

  function closeVernieGate() {
    var gate = document.getElementById('porch-vernie-gate');
    var messages = document.getElementById('porch-messages');
    var chips = document.getElementById('porch-chips');
    var inputArea = panel.querySelector('.porch-panel-input');

    if (gate) gate.classList.remove('open');
    if (messages) messages.style.display = '';
    if (chips) chips.style.display = '';
    if (inputArea) inputArea.style.display = '';
  }

  // ── Send Message ───────────────────────────────────

  function sendMessage() {
    var input = document.getElementById('porch-input');
    var sendBtn = document.getElementById('porch-send');
    if (!input || sending) return;

    var text = input.value.trim();
    if (!text) return;

    sending = true;
    addMessage('you', text);
    input.value = '';
    input.style.height = 'auto';

    if (sendBtn) sendBtn.disabled = true;
    input.disabled = true;

    showTyping();

    conversationHistory.push({
      role: 'user',
      content: text
    });

    var body = {
      messages: conversationHistory,
      visitorToken: visitorToken
    };

    // Kitchen mode — send mode + auth code
    if (kitchenConfig) {
      body.mode = 'kitchen';
      body.kitchenCode = kitchenConfig.getCode();
    }

    if (isVernieMode) {
      body.vernieCode = sessionStorage.getItem('cw-vernie-code');
    }

    fetch('/.netlify/functions/cw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify(body)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      removeTyping();

      var response = data.response || 'Having trouble right now. Try again.';
      addMessage('cw', response);

      conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Hide chips after first exchange
      var chips = document.getElementById('porch-chips');
      if (chips) chips.style.display = 'none';
    })
    .catch(function () {
      removeTyping();
      addMessage('cw', 'Connection problem. Try again.');
    })
    .finally(function () {
      sending = false;
      if (sendBtn) sendBtn.disabled = false;
      if (input) {
        input.disabled = false;
        input.focus();
      }
    });
  }

  // ── Session Close ────────────────────────────────────

  window.addEventListener('beforeunload', function () {
    if (conversationHistory.length < 2) return;
    var blob = new Blob([JSON.stringify({
      action: 'close-session',
      visitorToken: visitorToken,
      sessionId: sessionId,
      messages: conversationHistory
    })], { type: 'application/json' });
    navigator.sendBeacon('/.netlify/functions/cw', blob);
  });

  // ── Init ───────────────────────────────────────────

  function init() {
    widget = buildWidget();
    panel = buildPanel();

    document.body.appendChild(widget);
    document.body.appendChild(panel);

    // Escape closes panel
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panelOpen) {
        closePanel();
      }
    });
  }

  // Expose API for external triggers (e.g. homepage invitation CTA)
  window.CW_PORCH = {
    open: function () {
      if (panel) openPanel();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
