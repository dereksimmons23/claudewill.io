// Mirae Widget — Smart colleague at claudewill.io
// Hybrid: scripted navigation + live Haiku API for real questions
(function() {
  'use strict';

  var API_URL = '/.netlify/functions/mirae';
  var currentPage = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

  // Session management
  var sessionId = sessionStorage.getItem('mirae-session');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('mirae-session', sessionId);
  }

  var history = JSON.parse(sessionStorage.getItem('mirae-history') || '[]');
  var isOpen = sessionStorage.getItem('mirae-open') === 'true';
  var sending = false;

  // Page-aware content
  var WELCOMES = {
    '/story': 'Reading the story? I can help with context on CW or the family.',
    '/derek': 'This is Derek\'s page. Let me know if you need help finding something.',
    '/the-cw-standard': 'The five principles. Want context on any of them?',
    '/derek/assessment': 'This is the intake assessment. Seven questions, ten minutes.',
    '/derek/resume': 'Derek\'s career background. Need more context on anything?'
  };

  var CHIPS = {
    '/story': ['Who was CW?', 'Talk to CW', 'About Derek'],
    '/derek': ['The assessment', 'The CW Standard', 'Talk to CW'],
    '/the-cw-standard': ['Read the story', 'Talk to CW', 'About Derek'],
    '/derek/assessment': ['About Derek', 'CW Standard', 'Talk to CW'],
    '/derek/resume': ['About Derek', 'The assessment', 'Talk to CW']
  };

  var DEFAULT_WELCOME = 'Need help finding something?';
  var DEFAULT_CHIPS = ['What is this site?', 'Talk to CW', 'The CW Standard'];

  // Scripted responses — checked before API call
  var SCRIPTED = [
    { patterns: [/what is (the )?cw standard/i, /five principles/i, /what('s| are) the principles/i],
      response: 'The CW Standard is five principles Derek built from his grandfather\'s example: Truth over comfort, Usefulness over purity, Transparency over reputation, People over systems, Agency over ideology. Full breakdown at <a href="/the-cw-standard">/the-cw-standard</a>.' },
    { patterns: [/who (is|was) cw\b/i, /claude william s/i, /who('s| is) the grandfather/i],
      response: 'Claude William Simmons (1903-1967). Oklahoma farmer, raised 11 kids through the Depression. Derek\'s grandfather and the reason this site exists. Full story at <a href="/story">/story</a>, or talk to him directly on <a href="/">the porch</a>.' },
    { patterns: [/who (is|was) derek/i, /derek simmons/i, /about derek/i, /who built/i],
      response: 'Derek Claude Simmons. Three decades in media, sports, and tech. Built two world-class newspapers, generated $20M+ in revenue. Now runs CW Strategies. Full page at <a href="/derek">/derek</a>.' },
    { patterns: [/work with derek/i, /hire/i, /consulting/i, /engagement/i, /how (do|can) (i|we) (start|begin|work)/i],
      response: 'Start with the assessment. Seven questions, ten minutes. Not a test — a mutual fit check. <a href="/derek/assessment">/derek/assessment</a>.' },
    { patterns: [/talk to cw/i, /porch/i, /chat with cw/i, /main chat/i, /go to (the )?homepage/i],
      response: 'CW\'s on the porch. <a href="/">Head to the homepage</a> and pull up a chair.' },
    { patterns: [/assessment/i],
      response: 'The assessment is at <a href="/derek/assessment">/derek/assessment</a>. Seven questions, ten minutes. Filters for mutual fit.' },
    { patterns: [/story|history|family|lineage/i],
      response: 'Four chapters on CW, the family lineage, and why Derek built this. <a href="/story">/story</a>.' },
    { patterns: [/resume|cv\b/i],
      response: 'Derek\'s resume is at <a href="/derek/resume">/derek/resume</a>.' },
    { patterns: [/contact|email|reach derek/i],
      response: 'Contact form is on <a href="/derek">/derek</a>. That\'s the best way to reach him.' },
    { patterns: [/what (is|are) (this|these) (site|page|place)/i, /what am i looking at/i, /where am i/i],
      response: getPageDescription }
  ];

  function getPageDescription() {
    switch (currentPage) {
      case '/story': return 'You\'re reading the story of Claude William Simmons — CW. Four chapters covering his life, the family lineage, the principles he inspired, and why Derek built this site.';
      case '/derek': return 'This is Derek Simmons\' professional page. Bio, Q&A, career history, contact form. Derek is CW\'s grandson and the builder of this site.';
      case '/the-cw-standard': return 'The CW Standard — five principles for AI that serves people. Truth over comfort. Usefulness over purity. Transparency over reputation. People over systems. Agency over ideology.';
      case '/derek/assessment': return 'The intake assessment for working with Derek through CW Strategies. Seven questions, ten minutes. It\'s a mutual fit check, not a test.';
      case '/derek/resume': return 'Derek\'s career history — LA Times, Star Tribune, CW Strategies. The professional timeline.';
      default: return 'claudewill.io is an AI conversation tool built on the practical wisdom of Claude William Simmons (1903-1967). CW\'s on <a href="/">the porch</a>.';
    }
  }

  function matchScripted(text) {
    for (var i = 0; i < SCRIPTED.length; i++) {
      var entry = SCRIPTED[i];
      for (var j = 0; j < entry.patterns.length; j++) {
        if (entry.patterns[j].test(text)) {
          return typeof entry.response === 'function' ? entry.response() : entry.response;
        }
      }
    }
    return null;
  }

  // Escape HTML for user messages
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // DOM elements (populated in createWidget)
  var panel, messagesEl, chipsEl, inputEl, sendBtn, toggleBtn;

  function createWidget() {
    // Toggle button
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'mirae-toggle';
    toggleBtn.setAttribute('aria-label', 'Open Mirae chat');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = 'M';

    // Panel
    panel = document.createElement('div');
    panel.className = 'mirae-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Mirae');
    panel.innerHTML =
      '<div class="mirae-header">' +
        '<span class="mirae-header-title">MIRAE</span>' +
        '<button class="mirae-close" aria-label="Close Mirae chat">&times;</button>' +
      '</div>' +
      '<div class="mirae-messages" role="log" aria-live="polite" aria-label="Conversation"></div>' +
      '<div class="mirae-chips" role="group" aria-label="Suggested questions"></div>' +
      '<div class="mirae-input-area">' +
        '<input class="mirae-input" type="text" placeholder="Ask anything..." aria-label="Message Mirae" autocomplete="off">' +
        '<button class="mirae-send" aria-label="Send message">Send</button>' +
      '</div>';

    document.body.appendChild(toggleBtn);
    document.body.appendChild(panel);

    messagesEl = panel.querySelector('.mirae-messages');
    chipsEl = panel.querySelector('.mirae-chips');
    inputEl = panel.querySelector('.mirae-input');
    sendBtn = panel.querySelector('.mirae-send');

    // Events
    toggleBtn.addEventListener('click', open);
    panel.querySelector('.mirae-close').addEventListener('click', close);
    sendBtn.addEventListener('click', function() { send(); });
    inputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    // Escape key closes
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) close();
    });

    // Restore state
    if (history.length > 0) {
      renderHistory();
    }

    if (isOpen) {
      open();
    } else {
      // Pulse on first visit
      if (!sessionStorage.getItem('mirae-seen')) {
        toggleBtn.classList.add('pulse');
        sessionStorage.setItem('mirae-seen', 'true');
      }
    }
  }

  function open() {
    isOpen = true;
    sessionStorage.setItem('mirae-open', 'true');
    panel.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.classList.remove('pulse');

    if (history.length === 0) {
      var welcome = WELCOMES[currentPage] || DEFAULT_WELCOME;
      addMessage('mirae', welcome);
      showChips();
    }

    inputEl.focus();
    scrollToBottom();
  }

  function close() {
    isOpen = false;
    sessionStorage.setItem('mirae-open', 'false');
    panel.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function showChips() {
    var chips = CHIPS[currentPage] || DEFAULT_CHIPS;
    chipsEl.innerHTML = '';
    for (var i = 0; i < chips.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'mirae-chip';
      btn.textContent = chips[i];
      btn.addEventListener('click', (function(text) {
        return function() { send(text); };
      })(chips[i]));
      chipsEl.appendChild(btn);
    }
  }

  function hideChips() {
    chipsEl.innerHTML = '';
  }

  function addMessage(who, content) {
    var msg = document.createElement('div');
    msg.className = 'mirae-msg ' + who;

    if (who === 'user') {
      msg.textContent = content;
    } else {
      msg.innerHTML = content; // Mirae responses may contain links
    }

    messagesEl.appendChild(msg);
    scrollToBottom();

    // Save to history
    history.push({ who: who, content: content });
    sessionStorage.setItem('mirae-history', JSON.stringify(history));
  }

  function renderHistory() {
    messagesEl.innerHTML = '';
    for (var i = 0; i < history.length; i++) {
      var msg = document.createElement('div');
      msg.className = 'mirae-msg ' + history[i].who;
      if (history[i].who === 'user') {
        msg.textContent = history[i].content;
      } else {
        msg.innerHTML = history[i].content;
      }
      messagesEl.appendChild(msg);
    }
    scrollToBottom();
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'mirae-typing';
    el.id = 'mirae-typing';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function removeTyping() {
    var el = document.getElementById('mirae-typing');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function send(text) {
    if (sending) return;

    var message = text || inputEl.value.trim();
    if (!message) return;

    inputEl.value = '';
    hideChips();
    addMessage('user', escapeHtml(message));

    // Check scripted first
    var scripted = matchScripted(message);
    if (scripted) {
      addMessage('mirae', scripted);
      return;
    }

    // API call
    sending = true;
    sendBtn.disabled = true;
    showTyping();

    // Build API messages from history (convert to role/content format)
    var apiMessages = [];
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      apiMessages.push({
        role: h.who === 'user' ? 'user' : 'assistant',
        content: h.who === 'user' ? h.content : h.content.replace(/<[^>]*>/g, '') // strip HTML for API
      });
    }

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({
        messages: apiMessages,
        page: currentPage
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      removeTyping();
      sending = false;
      sendBtn.disabled = false;

      var response = data.response || 'Something went wrong. Try again.';
      // Convert URLs in response to links
      response = linkify(response);
      addMessage('mirae', response);
      inputEl.focus();
    })
    .catch(function() {
      removeTyping();
      sending = false;
      sendBtn.disabled = false;
      addMessage('mirae', 'Connection issue. Try again in a moment.');
      inputEl.focus();
    });
  }

  // Convert /path references to clickable links
  function linkify(text) {
    return text.replace(/\/(story|derek|the-cw-standard|derek\/assessment|derek\/resume|privacy|terms)\b/g, function(match) {
      return '<a href="' + match + '">' + match + '</a>';
    });
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
