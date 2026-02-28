/* d.js — Health accountability dashboard renderer
   Auth gate + TUI-style sections for dawn/dusk tracking.
   ES5-compatible. No template literals, no arrow functions, no let/const. */

(function () {
  'use strict';

  var D_KEY = 'd-code';
  var API = '/.netlify/functions/d';

  var DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  var SPARK_CHARS = '\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588';

  // ── Helpers ──────────────────────────────────────

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function clearChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function getDow(dateStr) {
    var d = new Date(dateStr + 'T12:00:00');
    return DAYS_OF_WEEK[d.getDay()];
  }

  function getDowIndex(dateStr) {
    var d = new Date(dateStr + 'T12:00:00');
    return d.getDay();
  }

  function todayStr() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    if (m.length < 2) m = '0' + m;
    var day = String(d.getDate());
    if (day.length < 2) day = '0' + day;
    return y + '-' + m + '-' + day;
  }

  // ── Section builder ────────────────────────────────

  function section(label, rightText, isOpen) {
    var details = document.createElement('details');
    details.className = 'tui-section';
    if (isOpen) details.setAttribute('open', '');

    var summary = document.createElement('summary');
    summary.appendChild(document.createTextNode(label));

    if (rightText) {
      var right = el('span', 'section-right', rightText);
      summary.appendChild(right);
    }

    details.appendChild(summary);

    var body = el('div', 'section-body');
    details.appendChild(body);

    return { details: details, body: body };
  }

  // ── Consolidate entries by date (merge dawn + dusk phases) ──

  function consolidateByDate(entries) {
    var byDate = {};
    var dates = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var d = e.entry_date;
      if (!byDate[d]) {
        byDate[d] = {};
        dates.push(d);
      }
      // Merge fields — dawn phase has sleep/raid/up, dusk has summary/learned
      var row = byDate[d];
      if (e.phase === 'dawn' || !row.day_number) {
        row.entry_date = d;
        row.day_number = e.day_number || row.day_number;
        row.week_number = e.week_number || row.week_number;
      }
      if (e.up_time) row.up_time = e.up_time;
      if (e.sleep_hours != null) row.sleep_hours = e.sleep_hours;
      if (e.raid) row.raid = true;
      if (e.raid_calories != null) row.raid_calories = e.raid_calories;
      if (e.raid_description) row.raid_description = e.raid_description;
      if (e.weight_lbs != null) row.weight_lbs = e.weight_lbs;
      if (e.goal) row.goal = e.goal;
      if (e.dusk_summary) row.dusk_summary = e.dusk_summary;
      if (e.dusk_learned) row.dusk_learned = e.dusk_learned;
    }
    // Sort dates descending
    dates.sort(function (a, b) { return b.localeCompare(a); });
    var result = [];
    for (var j = 0; j < dates.length; j++) {
      result.push(byDate[dates[j]]);
    }
    return result;
  }

  // ── Typewriter for title ───────────────────────────

  var D_WORDS = [
    'd',
    'derek',
    'dash',
    'dawn',
    'desk',
    'dusk',
    'data',
    'drive',
    'discipline',
    'day',
    'determination',
    'done'
  ];

  function startTypewriter(titleEl) {
    var wordIndex = 0;
    var charIndex = 1; // always start showing 'd'
    var deleting = false;
    var pauseAfterWord = 2200;
    var pauseOnD = 600;
    var typeSpeed = 70;
    var deleteSpeed = 40;

    titleEl.textContent = 'd';

    function step() {
      var word = D_WORDS[wordIndex];

      if (!deleting) {
        charIndex++;
        titleEl.textContent = word.substring(0, charIndex);

        if (charIndex === word.length) {
          // Finished typing — pause, then delete
          setTimeout(function () { deleting = true; step(); }, pauseAfterWord);
          return;
        }
        setTimeout(step, typeSpeed);
      } else {
        charIndex--;
        titleEl.textContent = word.substring(0, charIndex);

        if (charIndex === 1) {
          // Back to just 'd' — pause, then next word
          deleting = false;
          wordIndex = (wordIndex + 1) % D_WORDS.length;
          // Skip index 0 ('d' alone) on subsequent cycles
          if (wordIndex === 0) wordIndex = 1;
          setTimeout(step, pauseOnD);
          return;
        }
        setTimeout(step, deleteSpeed);
      }
    }

    // Respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Start after a beat — first word is 'd', so jump to next
    wordIndex = 1;
    setTimeout(step, 1200);
  }

  // ── Build Hero ─────────────────────────────────────

  function buildHero(container, data) {
    clearChildren(container);

    // Title with typewriter
    var title = el('div', 'd-title');
    title.textContent = 'd';
    container.appendChild(title);
    startTypewriter(title);

    // Day counter
    var counter = el('div', 'd-counter');
    var left = el('span', '', 'Day ' + data.currentDay + ' of ' + data.totalDays);
    var right = el('span', '', data.remaining + ' remaining');
    counter.appendChild(left);
    counter.appendChild(right);
    container.appendChild(counter);

    // Progress bar
    var pct = Math.round((data.currentDay / data.totalDays) * 100);
    var progress = el('div', 'd-progress');
    var fill = el('div', 'd-progress-fill');
    fill.style.width = pct + '%';
    progress.appendChild(fill);
    var label = el('span', 'd-progress-label', pct + '%');
    progress.appendChild(label);
    container.appendChild(progress);

    // Weight display
    var wh = data.weightHistory;
    if (wh && wh.length >= 1) {
      var startWeight = wh[0].weight;
      var currentWeight = wh[wh.length - 1].weight;
      var delta = currentWeight - startWeight;

      var weightRow = el('div', 'd-weight');
      weightRow.appendChild(el('span', 'd-weight-start', startWeight.toFixed(1)));
      weightRow.appendChild(el('span', 'd-weight-line'));
      weightRow.appendChild(el('span', 'd-weight-current', currentWeight.toFixed(1)));
      container.appendChild(weightRow);

      var deltaDiv = el('div', 'd-weight-delta', delta.toFixed(1) + ' lb');
      container.appendChild(deltaDiv);
    }
  }

  // ── Build Timeline ─────────────────────────────────

  function buildTimeline(container, data) {
    var consolidated = consolidateByDate(data.entries);
    var today = todayStr();
    var initialShow = 14;
    var showAll = false;

    var rightText = consolidated.length + ' days';
    var s = section('TIMELINE', rightText, true);

    function renderEntries(limit) {
      clearChildren(s.body);
      var count = limit || consolidated.length;
      if (count > consolidated.length) count = consolidated.length;

      for (var i = 0; i < count; i++) {
        var row = consolidated[i];
        var line = el('div', 'timeline-entry');

        // Day number
        var daySpan = el('span', 'timeline-day', String(row.day_number || ''));
        line.appendChild(daySpan);

        // Day of week
        var dow = getDow(row.entry_date);
        var dowSpan = el('span', 'timeline-dow', dow);
        line.appendChild(dowSpan);

        // Up time
        var upText = row.up_time ? 'up ' + row.up_time : '';
        var upSpan = el('span', 'timeline-up', upText);
        line.appendChild(upSpan);

        // Sleep
        var sleepText = row.sleep_hours != null ? 'sleep ' + row.sleep_hours + 'h' : '';
        var sleepSpan = el('span', 'timeline-sleep', sleepText);
        line.appendChild(sleepSpan);

        // Raid indicator
        var raidSpan = el('span', 'timeline-raid');
        if (row.entry_date === today && !row.up_time && !row.sleep_hours && !row.raid) {
          // Today with no data yet
          raidSpan.textContent = '\u00B7';
          raidSpan.className = 'timeline-raid';
        } else if (row.raid) {
          raidSpan.textContent = '\u25CF';
          raidSpan.className = 'timeline-raid raid-yes';
          if (row.raid_calories) {
            raidSpan.textContent = '\u25CF ' + row.raid_calories + 'cal';
          }
        } else {
          raidSpan.textContent = '\u25CB';
          raidSpan.className = 'timeline-raid raid-no';
        }
        line.appendChild(raidSpan);

        // Weight (only on weigh-in days)
        if (row.weight_lbs != null) {
          var weightSpan = el('span', 'timeline-weight', row.weight_lbs.toFixed(1));
          line.appendChild(weightSpan);
        }

        // Today marker
        if (row.entry_date === today) {
          line.classList.add('timeline-today');
        }

        s.body.appendChild(line);
      }

      // Show all / show less toggle
      if (consolidated.length > initialShow) {
        var toggle = el('button', 'timeline-toggle');
        if (!showAll && count < consolidated.length) {
          toggle.textContent = 'show all ' + consolidated.length + ' days';
          toggle.addEventListener('click', function () {
            showAll = true;
            renderEntries(consolidated.length);
          });
        } else if (showAll) {
          toggle.textContent = 'show recent';
          toggle.addEventListener('click', function () {
            showAll = false;
            renderEntries(initialShow);
          });
        }
        s.body.appendChild(toggle);
      }
    }

    renderEntries(initialShow);
    container.appendChild(s.details);
  }

  // ── Build Weight Chart ─────────────────────────────

  function buildWeight(container, data) {
    var wh = data.weightHistory;
    if (!wh || wh.length === 0) return;

    var s = section('WEIGHT', wh.length + ' weigh-ins', false);

    // Find range for bar scaling
    var minW = 999, maxW = 0;
    var i;
    for (i = 0; i < wh.length; i++) {
      if (wh[i].weight < minW) minW = wh[i].weight;
      if (wh[i].weight > maxW) maxW = wh[i].weight;
    }
    // Use 200-240 or actual range, whichever is wider
    var rangeMin = Math.min(minW - 2, 200);
    var rangeMax = Math.max(maxW + 2, 240);
    var range = rangeMax - rangeMin;

    for (i = 0; i < wh.length; i++) {
      var w = wh[i];
      var row = el('div', 'weight-row');

      var weekLabel = el('span', 'weight-week', 'W' + w.week);
      row.appendChild(weekLabel);

      var numLabel = el('span', 'weight-num', w.weight.toFixed(1));
      row.appendChild(numLabel);

      var barWidth = Math.round(((w.weight - rangeMin) / range) * 20);
      if (barWidth < 1) barWidth = 1;
      var barStr = '';
      for (var b = 0; b < barWidth; b++) barStr += '\u2587';
      var barSpan = el('span', 'weight-bar', barStr);
      row.appendChild(barSpan);

      s.body.appendChild(row);
    }

    container.appendChild(s.details);
  }

  // ── Build Raids ────────────────────────────────────

  function buildRaids(container, data) {
    var consolidated = consolidateByDate(data.entries);
    if (consolidated.length === 0) return;

    // Count total raids
    var raidCount = 0;
    for (var r = 0; r < consolidated.length; r++) {
      if (consolidated[r].raid) raidCount++;
    }

    var s = section('RAIDS', raidCount + ' of ' + consolidated.length + ' days', false);

    // Current week heatmap
    var today = new Date();
    var currentDow = today.getDay(); // 0=sun
    // Find Monday of current week
    var mondayOffset = currentDow === 0 ? -6 : 1 - currentDow;
    var monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    var weekLabel = el('div', 'raid-week-label', 'This week');
    s.body.appendChild(weekLabel);

    var grid = el('div', 'raid-grid');

    // Build a lookup of this week's dates
    var weekDates = {};
    for (var d = 0; d < 7; d++) {
      var dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + d);
      var mm = String(dayDate.getMonth() + 1);
      if (mm.length < 2) mm = '0' + mm;
      var dd = String(dayDate.getDate());
      if (dd.length < 2) dd = '0' + dd;
      var key = dayDate.getFullYear() + '-' + mm + '-' + dd;
      weekDates[key] = null; // default: no data
    }

    // Fill in from consolidated data
    for (var c = 0; c < consolidated.length; c++) {
      var entry = consolidated[c];
      if (weekDates.hasOwnProperty(entry.entry_date)) {
        weekDates[entry.entry_date] = entry;
      }
    }

    var todayKey = todayStr();
    var dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    var dateKeys = Object.keys(weekDates).sort();
    for (var di = 0; di < dateKeys.length; di++) {
      var col = el('div', 'raid-day-col');

      var dayLabel = el('div', 'raid-day-label', dayLabels[di]);
      col.appendChild(dayLabel);

      var dot = el('div', 'raid-dot');
      var dateEntry = weekDates[dateKeys[di]];
      if (dateKeys[di] > todayKey) {
        // Future day
        dot.textContent = '\u00B7';
        dot.className = 'raid-dot raid-empty';
      } else if (!dateEntry) {
        // Past day with no data
        dot.textContent = '\u00B7';
        dot.className = 'raid-dot raid-empty';
      } else if (dateEntry.raid) {
        dot.textContent = '\u25CF';
        dot.className = 'raid-dot raid-yes';
      } else {
        dot.textContent = '\u25CB';
        dot.className = 'raid-dot raid-no';
      }
      col.appendChild(dot);
      grid.appendChild(col);
    }

    s.body.appendChild(grid);
    container.appendChild(s.details);
  }

  // ── Build Sleep ────────────────────────────────────

  function buildSleep(container, data) {
    var consolidated = consolidateByDate(data.entries);

    // Get last 14 days with sleep data
    var sleepDays = [];
    for (var i = 0; i < consolidated.length; i++) {
      if (consolidated[i].sleep_hours != null) {
        sleepDays.push(consolidated[i].sleep_hours);
      }
      if (sleepDays.length >= 14) break;
    }

    if (sleepDays.length === 0) return;

    // Reverse so oldest is first (sparkline reads left to right)
    sleepDays.reverse();

    // Calculate 7d average
    var recent = sleepDays.slice(-7);
    var sum = 0;
    for (var j = 0; j < recent.length; j++) sum += recent[j];
    var avg = Math.round((sum / recent.length) * 10) / 10;

    var s = section('SLEEP', avg + 'h avg (7d)', false);

    // Header
    var header = el('div', 'sleep-header');
    header.appendChild(el('span', 'sleep-avg-label', '14d'));
    header.appendChild(el('span', 'sleep-avg-value', avg + 'h'));
    s.body.appendChild(header);

    // Sparkline using block characters
    // Map 4h-10h range to spark chars
    var sparkStr = '';
    for (var k = 0; k < sleepDays.length; k++) {
      var h = sleepDays[k];
      var normalized = (h - 4) / 6; // 4h=0, 10h=1
      if (normalized < 0) normalized = 0;
      if (normalized > 1) normalized = 1;
      var idx = Math.round(normalized * (SPARK_CHARS.length - 1));
      sparkStr += SPARK_CHARS[idx];
    }
    var sparkDiv = el('div', 'sleep-sparkline', sparkStr);
    s.body.appendChild(sparkDiv);

    container.appendChild(s.details);
  }

  // ── Build 8 Questions ──────────────────────────────

  function buildQuestions(container) {
    var s = section('THE 8 QUESTIONS', null, false);

    var questions = [
      { q: 'What foods work?', a: 'Protein-heavy, high fiber. Two meals: protein shake after fast, big healthy dinner.' },
      { q: 'What protocols work?', a: 'Going dry + 14-16hr fasts + daily walk + Friday weigh-ins.' },
      { q: 'What precedes streaks?', a: 'Rock bottom.' },
      { q: 'First domino?', a: 'Overnight eating, always. Sugary/carby snacks at 2am.' },
      { q: 'What made 2023 stick?', a: 'Going dry, defined window, honest accounting.' },
      { q: 'Exercise?', a: 'Any movement beats perfect planning.' },
      { q: 'Rhythm?', a: '5-2-5. Jan-May on, Jun-Jul rest, Aug-Dec on.' },
      { q: 'The overnight truth?', a: '"It\'s not circadian. It\'s guilt."' }
    ];

    var list = el('ol', 'questions-list');

    for (var i = 0; i < questions.length; i++) {
      var li = document.createElement('li');

      var num = el('span', 'question-num', String(i + 1));
      li.appendChild(num);

      var q = el('span', 'question-q', questions[i].q);
      li.appendChild(q);

      var a = el('span', 'question-a', questions[i].a);
      li.appendChild(a);

      list.appendChild(li);
    }

    s.body.appendChild(list);
    container.appendChild(s.details);
  }

  // ── Main render ────────────────────────────────────

  function render(data) {
    var hero = document.getElementById('d-hero');
    var terminal = document.getElementById('d-terminal');
    if (!hero || !terminal) return;

    clearChildren(hero);
    clearChildren(terminal);

    buildHero(hero, data);
    buildTimeline(terminal, data);
    buildWeight(terminal, data);
    buildRaids(terminal, data);
    buildSleep(terminal, data);
    buildQuestions(terminal);
  }

  // ── API call ───────────────────────────────────────

  function apiCall(action, code) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dCode: code, action: action })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  // ── Auth gate ──────────────────────────────────────

  function showDashboard(code) {
    var gate = document.getElementById('auth-gate');
    var dash = document.getElementById('dashboard');
    if (gate) gate.style.display = 'none';
    if (dash) dash.style.display = 'block';

    // Show loading
    var terminal = document.getElementById('d-terminal');
    if (terminal) {
      clearChildren(terminal);
      terminal.appendChild(el('div', 'loading-state', 'loading...'));
    }

    apiCall('state', code).then(function (data) {
      render(data);
    }).catch(function () {
      if (terminal) {
        clearChildren(terminal);
        terminal.appendChild(el('div', 'loading-state', 'unable to load data'));
      }
    });
  }

  function initAuth() {
    var stored = localStorage.getItem(D_KEY);
    if (stored) {
      // Verify stored code
      apiCall('verify', stored).then(function (res) {
        if (res.ok) {
          showDashboard(stored);
        } else {
          localStorage.removeItem(D_KEY);
          showGate();
        }
      }).catch(function () {
        showGate();
      });
    } else {
      showGate();
    }
  }

  function showGate() {
    var gate = document.getElementById('auth-gate');
    var dash = document.getElementById('dashboard');
    if (gate) gate.style.display = '';
    if (dash) dash.style.display = 'none';

    var input = document.getElementById('auth-input');
    if (!input) return;

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var code = input.value.trim();
        if (!code) return;

        apiCall('verify', code).then(function (res) {
          if (res.ok) {
            localStorage.setItem(D_KEY, code);
            showDashboard(code);
          } else {
            input.value = '';
            input.placeholder = '\u00D7';
            setTimeout(function () { input.placeholder = '\u00B7'; }, 1000);
          }
        }).catch(function () {
          input.value = '';
          input.placeholder = '\u00D7';
          setTimeout(function () { input.placeholder = '\u00B7'; }, 1000);
        });
      }
    });
  }

  // ── Init ───────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

})();
