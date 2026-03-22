/* kitchen.js — Mission Control renderer
   Fetches pulse.json and kitchen-data.json.
   Populates status, pulse, headlines, bottom line.
   No auth gate. No TUI terminal. Just numbers. */

(function () {
  'use strict';

  // ── Projects to show in status row ──────────────
  var STATUS_PROJECTS = [
    { key: 'claudewill.io', label: 'CW', field: 'portfolio' },
    { key: 'Coach D', label: 'D', field: 'business' },
    { key: 'BOB', label: 'BOB', field: 'portfolio' },
    { key: 'Hancock', label: 'Hancock', field: 'portfolio' }
  ];

  // ── Helper: clear all children ──────────────────

  function clearChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  // ── Render status dots ──────────────────────────

  function renderStatus(projects) {
    var grid = document.getElementById('status-grid');
    if (!grid) return;
    clearChildren(grid);

    var projectMap = {};
    if (projects && projects.length) {
      for (var i = 0; i < projects.length; i++) {
        projectMap[projects[i].name] = projects[i];
      }
    }

    for (var s = 0; s < STATUS_PROJECTS.length; s++) {
      var cfg = STATUS_PROJECTS[s];
      var proj = projectMap[cfg.key];
      var alive = false;
      var detail = '';

      if (proj) {
        var st = (proj.status || '').toLowerCase();
        alive = st !== 'paused' && st !== 'dead' && st !== 'not launched';
        detail = proj.status || '';
      }

      var item = document.createElement('div');
      item.className = 'status-item';

      var dot = document.createElement('span');
      dot.className = 'dot ' + (alive ? 'dot-green' : 'dot-red');
      item.appendChild(dot);

      var name = document.createElement('span');
      name.className = 'status-name';
      name.textContent = cfg.label;
      item.appendChild(name);

      if (detail) {
        var det = document.createElement('span');
        det.className = 'status-detail';
        det.textContent = detail;
        item.appendChild(det);
      }

      grid.appendChild(item);
    }
  }

  // ── Render pulse numbers ────────────────────────

  function renderPulse(pulse) {
    var grid = document.getElementById('pulse-grid');
    if (!grid || !pulse) return;

    var stats = [
      { value: pulse.visitors ? pulse.visitors.total : 0, label: 'visitors' },
      { value: pulse.porch ? pulse.porch.total : 0, label: 'conversations' },
      { value: pulse.d ? pulse.d.total : 0, label: 'D users' },
      { value: pulse.dawn ? pulse.dawn.dayNumber : '--', label: 'dawn day' }
    ];

    clearChildren(grid);

    for (var i = 0; i < stats.length; i++) {
      var stat = document.createElement('div');
      stat.className = 'mc-stat';

      var val = document.createElement('span');
      val.className = 'mc-stat-value';
      val.textContent = typeof stats[i].value === 'number' ? stats[i].value.toLocaleString() : stats[i].value;
      stat.appendChild(val);

      var lbl = document.createElement('span');
      lbl.className = 'mc-stat-label';
      lbl.textContent = stats[i].label;
      stat.appendChild(lbl);

      grid.appendChild(stat);
    }

    // Revenue line
    var rev = document.getElementById('pulse-revenue');
    if (rev) {
      rev.textContent = 'practice cost: ~$125/month. revenue from practice: $0.';
    }
  }

  // ── Render Morning Edition headlines ────────────

  function renderHeadlines(kitchen) {
    var lead = document.getElementById('me-lead');
    var list = document.getElementById('headlines-list');
    var meta = document.getElementById('me-meta');

    if (!kitchen || !kitchen.agents || !kitchen.agents.morningEdition) {
      if (list) {
        clearChildren(list);
        var noData = document.createElement('li');
        noData.className = 'mc-headline-placeholder';
        noData.textContent = 'no morning edition data';
        list.appendChild(noData);
      }
      return;
    }

    var me = kitchen.agents.morningEdition;

    // Lead story
    if (lead && me.summary) {
      clearChildren(lead);
      var leadText = document.createElement('span');
      leadText.textContent = me.summary;
      lead.appendChild(leadText);
    }

    // Headlines — fetch the markdown report
    if (list) {
      fetchHeadlines(list);
    }

    // Meta
    if (meta && me.findings) {
      meta.textContent = me.findings;
    }
  }

  function fetchHeadlines(listEl) {
    fetch('/reports/morning-edition.md')
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var headlines = parseHeadlines(text);
        clearChildren(listEl);

        var count = Math.min(headlines.length, 5);
        if (count === 0) {
          var placeholder = document.createElement('li');
          placeholder.className = 'mc-headline-placeholder';
          placeholder.textContent = 'no headlines found';
          listEl.appendChild(placeholder);
          return;
        }

        for (var i = 0; i < count; i++) {
          var li = document.createElement('li');
          var titleSpan = document.createElement('span');
          titleSpan.className = 'mc-headline-title';
          titleSpan.textContent = headlines[i].title;
          li.appendChild(titleSpan);

          if (headlines[i].source) {
            var sourceSpan = document.createElement('span');
            sourceSpan.className = 'mc-headline-source';
            sourceSpan.textContent = ' \u2014 ' + headlines[i].source;
            li.appendChild(sourceSpan);
          }

          listEl.appendChild(li);
        }
      })
      .catch(function () {
        clearChildren(listEl);
        var errLi = document.createElement('li');
        errLi.className = 'mc-headline-placeholder';
        errLi.textContent = 'could not load headlines';
        listEl.appendChild(errLi);
      });
  }

  function parseHeadlines(md) {
    var headlines = [];
    var lines = md.split('\n');
    var inHeadlines = false;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();

      // Start capturing after "## Headlines"
      if (line === '## Headlines') {
        inHeadlines = true;
        continue;
      }

      // Stop at next section
      if (inHeadlines && /^##\s/.test(line) && line !== '## Headlines') {
        break;
      }

      if (inHeadlines && /^-\s\*\*/.test(line)) {
        // Parse: - **Title** — Source
        var match = line.match(/^-\s\*\*(.+?)\*\*\s*(?:\u2014|—|--)\s*(.+)$/);
        if (match) {
          headlines.push({ title: match[1].trim(), source: match[2].trim() });
        } else {
          // Try just bold text
          var boldMatch = line.match(/^-\s\*\*(.+?)\*\*/);
          if (boldMatch) {
            headlines.push({ title: boldMatch[1].trim(), source: '' });
          }
        }
      }
    }

    // If we didn't find any in Headlines section, try the front page blockquote
    if (headlines.length === 0) {
      for (var j = 0; j < lines.length; j++) {
        var l = lines[j].trim();
        if (/^>\s\*\*/.test(l)) {
          var fpMatch = l.match(/^>\s\*\*(.+?)\*\*\s*(?:\u2014|—|--)\s*(.+)$/);
          if (fpMatch) {
            headlines.push({ title: fpMatch[1].trim(), source: fpMatch[2].trim() });
          }
        }
      }
    }

    return headlines;
  }

  // ── Render bottom line ──────────────────────────

  function renderBottomLine(pulse) {
    var list = document.getElementById('bottom-list');
    if (!list) return;
    clearChildren(list);

    var lines = pulse && pulse.bottomLine ? pulse.bottomLine : [];

    if (lines.length === 0) {
      var li = document.createElement('li');
      li.textContent = 'no data';
      list.appendChild(li);
      return;
    }

    for (var i = 0; i < lines.length; i++) {
      var li = document.createElement('li');
      li.textContent = lines[i];
      list.appendChild(li);
    }
  }

  // ── Fetch and render ────────────────────────────

  Promise.all([
    fetch('/pulse.json').then(function (r) { return r.json(); }).catch(function () { return null; }),
    fetch('/kitchen-data.json').then(function (r) { return r.json(); }).catch(function () { return null; })
  ]).then(function (results) {
    var pulse = results[0];
    var kitchen = results[1];

    renderStatus(kitchen ? kitchen.projects : []);
    renderPulse(pulse);
    renderHeadlines(kitchen);
    renderBottomLine(pulse);
  }).catch(function () {
    var grid = document.getElementById('status-grid');
    if (grid) {
      clearChildren(grid);
      var errItem = document.createElement('div');
      errItem.className = 'status-item';
      var errDot = document.createElement('span');
      errDot.className = 'dot dot-red';
      errItem.appendChild(errDot);
      var errName = document.createElement('span');
      errName.className = 'status-name';
      errName.textContent = 'unable to load data';
      errItem.appendChild(errName);
      grid.appendChild(errItem);
    }
  });

})();
