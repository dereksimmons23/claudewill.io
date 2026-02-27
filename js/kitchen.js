/* kitchen.js — Terminal renderer for The Kitchen page
   Fetches kitchen-data.json, island-data, message-stats.
   Renders TUI-style collapsible sections into #terminal.
   ES5-compatible. No template literals, no arrow functions, no let/const. */

(function () {
  'use strict';

  // ── Agent display names ──────────────────────────
  var AGENT_ORDER = [
    'siteAudit', 'codeReview', 'research', 'gemini',
    'analytics', 'contentScan', 'socialDraft', 'pipelineScan', 'researchStatus'
  ];
  var AGENT_NAMES = {
    siteAudit: 'site-audit',
    codeReview: 'code-review',
    research: 'research-brief',
    gemini: 'industry-brief',
    analytics: 'analytics',
    contentScan: 'content-scan',
    socialDraft: 'social-draft',
    pipelineScan: 'pipeline-scan',
    researchStatus: 'research-status'
  };

  // ── Helpers ──────────────────────────────────────

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function tree(i, n) {
    return i < n - 1 ? '\u251C' : '\u2514';
  }

  function sparkline(values) {
    var chars = ' \u2591\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588';
    var max = Math.max.apply(null, values);
    if (max === 0) {
      var out = '';
      for (var k = 0; k < values.length; k++) out += chars[0];
      return out;
    }
    var result = '';
    for (var j = 0; j < values.length; j++) {
      var idx = Math.ceil((values[j] / max) * (chars.length - 1));
      result += chars[idx];
    }
    return result;
  }

  function progressBar(current, total, width) {
    width = width || 10;
    var filled = Math.round((current / total) * width);
    var empty = width - filled;
    var bar = '';
    var f, e;
    for (f = 0; f < filled; f++) bar += '\u2588';
    for (e = 0; e < empty; e++) bar += '\u2591';
    return bar;
  }

  function statusDot(agentStatus) {
    if (agentStatus === 'ok') return { char: '\u25CF', cls: 'ok' };
    if (agentStatus === 'flags') return { char: '\u2691', cls: 'flag' };
    return { char: '\u25CB', cls: 'error' };
  }

  function projectDot(status) {
    if (status === 'Autonomous') return { char: '\u25C9', cls: 'ok' };
    if (/Day|\//.test(status)) return { char: '\u25D0', cls: 'ok' };
    return { char: '\u25CF', cls: 'ok' };
  }

  function fmtTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      var opts = {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
        hour12: false, timeZone: 'America/Chicago'
      };
      return d.toLocaleString('en-US', opts).replace(',', '');
    } catch (e) {
      return '';
    }
  }

  function fmtTimeAgo(iso) {
    if (!iso) return '';
    var now = Date.now();
    var then = new Date(iso).getTime();
    var diff = Math.floor((now - then) / 1000);
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function firstSentence(str, max) {
    if (!str) return '';
    // strip markdown bold
    var clean = str.replace(/\*\*/g, '');
    // grab up to first period, question mark, or newline
    var match = clean.match(/^[^.\n?!]+[.\n?!]?/);
    var sentence = match ? match[0].trim() : clean.trim();
    max = max || 60;
    if (sentence.length > max) {
      return sentence.substring(0, max - 1) + '\u2026';
    }
    return sentence;
  }

  // ── Build a TUI line ─────────────────────────────

  function tuiLine(treeChar, dotObj, name, value) {
    var line = el('div', 'tui-line');

    var treeSpan = el('span', 'tree', treeChar);
    line.appendChild(treeSpan);

    var statusSpan = el('span', 'status ' + (dotObj ? dotObj.cls : ''), dotObj ? dotObj.char : ' ');
    line.appendChild(statusSpan);

    var nameSpan = el('span', 'name', name);
    line.appendChild(nameSpan);

    var valueSpan = el('span', 'value', value || '');
    line.appendChild(valueSpan);

    return line;
  }

  // ── Section builder ──────────────────────────────

  function section(label, count, rightText, isOpen) {
    var details = document.createElement('details');
    details.className = 'tui-section';
    if (isOpen) details.setAttribute('open', '');

    var summary = document.createElement('summary');
    var left = document.createTextNode(label + '  ');
    summary.appendChild(left);

    if (count !== undefined && count !== null) {
      var countSpan = el('span', 'section-count', String(count));
      summary.appendChild(countSpan);
    }

    if (rightText) {
      var right = el('span', 'section-right', rightText);
      summary.appendChild(right);
    }

    details.appendChild(summary);

    var body = el('div', 'section-body');
    details.appendChild(body);

    return { details: details, body: body };
  }

  // ── Clear a container safely ─────────────────────

  function clearChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  // ── renderOvernight ──────────────────────────────

  function renderOvernight(container, data) {
    var agents = data.agents || {};
    var keys = [];
    var i;
    for (i = 0; i < AGENT_ORDER.length; i++) {
      if (agents[AGENT_ORDER[i]]) keys.push(AGENT_ORDER[i]);
    }

    var timestamp = fmtTime(data.lastUpdated);
    var s = section('Overnight', keys.length, timestamp, true);

    for (i = 0; i < keys.length; i++) {
      var key = keys[i];
      var agent = agents[key];
      var dot = statusDot(agent.status);
      var displayName = AGENT_NAMES[key] || key;
      var val = firstSentence(agent.summary, 40);

      var line = tuiLine(tree(i, keys.length), dot, displayName, val);

      // If agent has flags, make the line clickable to toggle detail
      var hasFlags = agent.flags && agent.flags.length > 0;
      if (hasFlags) {
        var detail = el('div', 'agent-detail');
        var sub = el('div', 'tui-sub');

        for (var f = 0; f < agent.flags.length; f++) {
          var flagLine = el('div', 'tui-line');
          flagLine.appendChild(el('span', 'tree', '\u2502'));
          flagLine.appendChild(el('span', 'status', ' '));
          var flagName = el('span', 'name');
          flagName.style.width = 'auto';
          flagName.style.flex = '1';
          flagName.textContent = firstSentence(agent.flags[f], 60);
          flagLine.appendChild(flagName);
          sub.appendChild(flagLine);
        }

        detail.appendChild(sub);
        line.style.cursor = 'pointer';
        (function (detailEl) {
          line.addEventListener('click', function () {
            if (detailEl.className.indexOf('open') > -1) {
              detailEl.className = 'agent-detail';
            } else {
              detailEl.className = 'agent-detail open';
            }
          });
        })(detail);

        s.body.appendChild(line);
        s.body.appendChild(detail);
      } else {
        s.body.appendChild(line);
      }

      // Sparkline for analytics agent
      if (key === 'analytics' && agent.metrics && agent.metrics.conversations) {
        var conv = agent.metrics.conversations;
        var day = conv.day || 0;
        var week = conv.week || 0;
        var month = conv.month || 0;

        // Build a 20-element distribution from the three data points
        var sparkData = [];
        var step;
        for (step = 0; step < 20; step++) {
          var ratio = step / 19;
          if (ratio < 0.05) {
            sparkData.push(day);
          } else if (ratio < 0.35) {
            sparkData.push(Math.round(week * (ratio / 0.35)));
          } else {
            sparkData.push(Math.round(month * ((ratio - 0.35) / 0.65)));
          }
        }

        var sparkSub = el('div', 'tui-sub');
        var sparkRow = el('div', 'tui-line');
        sparkRow.appendChild(el('span', 'tree', '\u2502'));
        sparkRow.appendChild(el('span', 'status', ' '));
        sparkRow.appendChild(el('span', 'name sparkline', sparkline(sparkData)));
        sparkRow.appendChild(el('span', 'value', '24h: ' + day + ' \u00B7 7d: ' + week + ' \u00B7 30d: ' + month));
        sparkSub.appendChild(sparkRow);
        s.body.appendChild(sparkSub);
      }
    }

    container.appendChild(s.details);
  }

  // ── renderNow ────────────────────────────────────

  function renderNow(container, island, messages, kitchen) {
    var divider = el('div', 'now-divider', 'now');
    container.appendChild(divider);

    var nowSection = el('div', 'now-section');

    // Line 1: derek x claude + model + hours/sessions
    var line1 = el('div', 'now-line');
    var label1 = el('span', '', 'derek \u00D7 claude');
    line1.appendChild(label1);

    var model = el('span', 'now-label', '  opus 4.6');
    line1.appendChild(model);

    // Hours/sessions from island or kitchen analytics
    var hours = '';
    var sessions = '';
    if (island && island.hours7d !== undefined) {
      hours = island.hours7d;
      sessions = island.sessions7d;
    } else if (kitchen && kitchen.agents && kitchen.agents.analytics && kitchen.agents.analytics.metrics && kitchen.agents.analytics.metrics.derekTime) {
      var dt = kitchen.agents.analytics.metrics.derekTime;
      hours = dt.hours7d;
      sessions = dt.sessions7d;
    }

    if (hours || sessions) {
      var timeInfo = el('span', 'now-label', '  ' + hours + 'h / ' + sessions + ' sessions');
      line1.appendChild(timeInfo);
    }

    nowSection.appendChild(line1);

    // Line 2: message count + Dawn progress bar
    var line2 = el('div', 'now-line');
    var hasLine2Content = false;

    if (messages && messages.total) {
      var msgSpan = el('span', '', messages.total.toLocaleString() + ' messages');
      line2.appendChild(msgSpan);
      hasLine2Content = true;
    }

    // Find Dawn in projects for progress bar
    var projects = kitchen.projects || [];
    var dawn = null;
    for (var p = 0; p < projects.length; p++) {
      if (projects[p].name === 'Dawn') {
        dawn = projects[p];
        break;
      }
    }

    if (dawn && dawn.status) {
      var dayMatch = dawn.status.match(/Day\s+(\d+)\s+of\s+(\d+)/i);
      if (dayMatch) {
        var current = parseInt(dayMatch[1], 10);
        var total = parseInt(dayMatch[2], 10);
        var filledCount = Math.round((current / total) * 16);
        var emptyCount = 16 - filledCount;

        var barContainer = document.createElement('span');
        barContainer.className = 'now-label';
        barContainer.appendChild(document.createTextNode('  '));

        var filledSpan = el('span', 'progress-filled');
        var filledStr = '';
        for (var fi = 0; fi < filledCount; fi++) filledStr += '\u2588';
        filledSpan.textContent = filledStr;
        barContainer.appendChild(filledSpan);

        var emptySpan = el('span', 'progress-empty');
        var emptyStr = '';
        for (var ei = 0; ei < emptyCount; ei++) emptyStr += '\u2591';
        emptySpan.textContent = emptyStr;
        barContainer.appendChild(emptySpan);

        barContainer.appendChild(document.createTextNode('  day ' + current + '/' + total));
        line2.appendChild(barContainer);
        hasLine2Content = true;
      }
    }

    if (hasLine2Content) {
      nowSection.appendChild(line2);
    }

    container.appendChild(nowSection);
  }

  // ── renderProjects ───────────────────────────────

  function renderProjects(container, projects) {
    if (!projects || projects.length === 0) return;

    var s = section('Projects', projects.length, null, false);

    for (var i = 0; i < projects.length; i++) {
      var proj = projects[i];
      var dot = projectDot(proj.status);
      var name = proj.name.toLowerCase();
      var val = proj.status;

      if (proj.note) {
        val += ' \u00B7 ' + firstSentence(proj.note, 30);
      }

      // Dawn gets a progress bar in its value
      if (proj.name === 'Dawn' && proj.status) {
        var dayMatch = proj.status.match(/Day\s+(\d+)\s+of\s+(\d+)/i);
        if (dayMatch) {
          var cur = parseInt(dayMatch[1], 10);
          var tot = parseInt(dayMatch[2], 10);
          val = cur + '/' + tot + '  ' + progressBar(cur, tot, 10);
        }
      }

      var line = tuiLine(tree(i, projects.length), dot, name, val);
      s.body.appendChild(line);
    }

    container.appendChild(s.details);
  }

  // ── renderStack ──────────────────────────────────

  function renderStack(container, ecosystem) {
    var stack = ecosystem.stack || [];
    if (stack.length === 0) return;

    var cost = ecosystem.monthlyCost || '';
    var rightText = cost ? cost + '/mo' : '';
    var s = section('Stack', stack.length, rightText, false);

    for (var i = 0; i < stack.length; i++) {
      var item = stack[i];
      var name = item.name.toLowerCase();
      var val = firstSentence(item.role, 45);

      var line = tuiLine(tree(i, stack.length), null, name, val);
      s.body.appendChild(line);
    }

    container.appendChild(s.details);
  }

  // ── renderMethod ─────────────────────────────────

  function renderMethod(container, ecosystem) {
    var s = section('Method', null, null, false);

    var methodLine = el('div', 'method-line', 'start \u2192 work \u2192 finish \u2192 decide');
    s.body.appendChild(methodLine);

    container.appendChild(s.details);
  }

  // ── Main render ──────────────────────────────────

  function render(kitchen, island, messages) {
    var terminal = document.getElementById('terminal');
    if (!terminal) return;
    clearChildren(terminal);

    renderOvernight(terminal, kitchen);
    renderNow(terminal, island, messages, kitchen);
    renderProjects(terminal, kitchen.projects || []);
    renderStack(terminal, kitchen.ecosystem || {});
    renderMethod(terminal, kitchen.ecosystem || {});
  }

  // ── Fetch and go ─────────────────────────────────

  function showError() {
    var terminal = document.getElementById('terminal');
    if (terminal) {
      clearChildren(terminal);
      var msg = el('div', 'loading-state', 'unable to load kitchen data');
      terminal.appendChild(msg);
    }
  }

  Promise.all([
    fetch('/kitchen-data.json').then(function (r) { return r.json(); }),
    fetch('/.netlify/functions/island-data').then(function (r) { return r.json(); }).catch(function () { return null; }),
    fetch('/data/message-stats.json').then(function (r) { return r.json(); }).catch(function () { return null; })
  ]).then(function (results) {
    render(results[0], results[1], results[2]);
  }).catch(function () {
    showError();
  });

})();
