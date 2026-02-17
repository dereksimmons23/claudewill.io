/**
 * Arcade Controller — claudewill.io/arcade
 * Manages game selection, scoring, and lifecycle.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'cw-arcade-scores';
  var currentGame = null;
  var canvas, ctx;

  var GAMES = {
    'fence-mender': {
      name: 'Fence Mender',
      script: '/js/arcade/fence-mender.js',
      controls: {
        desktop: '\u2190 \u2192 Arrow keys to move',
        mobile: 'Drag to move'
      }
    },
    'porch-light': {
      name: 'Porch Light',
      script: '/js/arcade/porch-light.js',
      controls: {
        desktop: 'Click to pulse',
        mobile: 'Tap to pulse'
      }
    },
    'the-route': {
      name: 'The Route',
      script: '/js/arcade/the-route.js',
      controls: {
        desktop: '\u2190 \u2192 to steer, Z to throw left, X to throw right',
        mobile: 'Tap left/right side to throw and steer'
      }
    }
  };

  var MESSAGES = {
    low: ["Not bad.", "Slow start. That's fine.", "CW started somewhere too."],
    mid: ["Getting the hang of it.", "Solid.", "Keep going."],
    high: ["Best on the porch.", "CW would be proud.", "Now you're building."],
    record: ["New record.", "That one's going on the wall.", "Best yet."]
  };

  // ── Score Management ──────────────────────────────

  function getScores() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveScore(gameId, score) {
    var scores = getScores();
    if (!scores[gameId]) {
      scores[gameId] = { high: 0, gamesPlayed: 0 };
    }
    scores[gameId].gamesPlayed++;
    scores[gameId].lastPlayed = new Date().toISOString();
    var isNewRecord = score > scores[gameId].high;
    if (isNewRecord) {
      scores[gameId].high = score;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return isNewRecord;
  }

  function getHighScore(gameId) {
    var scores = getScores();
    return scores[gameId] ? scores[gameId].high : 0;
  }

  // ── UI Updates ────────────────────────────────────

  function updateCardScores() {
    Object.keys(GAMES).forEach(function (id) {
      var el = document.getElementById('score-' + id);
      var high = getHighScore(id);
      if (el) {
        el.textContent = high > 0 ? ('Best: ' + high) : '';
      }
    });
  }

  function updateLeaderboard() {
    var body = document.getElementById('leaderboard-body');
    if (!body) return;

    var scores = getScores();
    var hasScores = false;
    var html = '';

    Object.keys(GAMES).forEach(function (id) {
      var high = scores[id] ? scores[id].high : 0;
      var played = scores[id] ? scores[id].gamesPlayed : 0;
      if (high > 0) hasScores = true;
      html += '<tr><td>' + GAMES[id].name + '</td><td>' + (high > 0 ? high : '—') + '</td></tr>';
    });

    if (!hasScores) {
      html = '<tr><td colspan="2" class="leaderboard-empty">No scores yet. Pick a game.</td></tr>';
    }

    body.innerHTML = html;
  }

  function getMessage(score, gameId) {
    var high = getHighScore(gameId);
    if (score > high && high > 0) return pick(MESSAGES.record);
    if (score > 200) return pick(MESSAGES.high);
    if (score > 50) return pick(MESSAGES.mid);
    return pick(MESSAGES.low);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ── Game Lifecycle ────────────────────────────────

  function isMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function loadGame(gameId) {
    var game = GAMES[gameId];
    if (!game) return;

    currentGame = gameId;

    // Show game container, hide grid
    document.getElementById('arcade-grid').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
    var container = document.getElementById('game-container');
    container.style.display = '';

    // Set header
    document.getElementById('game-title').textContent = game.name;
    document.getElementById('game-score-display').textContent = '';

    // Controls hint
    var hint = isMobile() ? game.controls.mobile : game.controls.desktop;
    document.getElementById('game-controls-hint').textContent = hint;

    // Size canvas
    canvas = document.getElementById('game-canvas');
    var wrapper = canvas.parentElement;
    var maxWidth = Math.min(wrapper.clientWidth, 480);
    canvas.width = maxWidth;
    canvas.height = Math.round(maxWidth * 1.33); // 3:4 aspect
    ctx = canvas.getContext('2d');

    // Load script if needed
    if (window.ArcadeGames && window.ArcadeGames[gameId]) {
      startGame(gameId);
    } else {
      var script = document.createElement('script');
      script.src = game.script;
      script.onload = function () { startGame(gameId); };
      document.head.appendChild(script);
    }
  }

  function startGame(gameId) {
    if (!window.ArcadeGames || !window.ArcadeGames[gameId]) return;

    // Hide game over overlay if showing
    document.getElementById('game-over-overlay').style.display = 'none';

    window.ArcadeGames[gameId].init(canvas, function (finalScore) {
      onGameOver(gameId, finalScore);
    }, function (liveScore) {
      // Live score callback
      document.getElementById('game-score-display').textContent = liveScore;
    });
  }

  function onGameOver(gameId, score) {
    var isRecord = saveScore(gameId, score);
    var high = getHighScore(gameId);

    var msg = isRecord ? pick(MESSAGES.record) : getMessage(score, gameId);

    document.getElementById('game-over-message').textContent = msg;
    document.getElementById('game-over-score').textContent = score;
    document.getElementById('game-over-best').textContent = isRecord ? 'New high score!' : ('Best: ' + high);
    document.getElementById('game-over-overlay').style.display = '';

    updateCardScores();
    updateLeaderboard();
  }

  function exitGame() {
    if (currentGame && window.ArcadeGames && window.ArcadeGames[currentGame]) {
      window.ArcadeGames[currentGame].destroy();
    }

    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('arcade-grid').style.display = '';
    document.getElementById('leaderboard').style.display = '';
    currentGame = null;
  }

  // ── Visibility Change (pause/resume) ──────────────

  document.addEventListener('visibilitychange', function () {
    if (!currentGame || !window.ArcadeGames || !window.ArcadeGames[currentGame]) return;
    if (document.hidden) {
      if (window.ArcadeGames[currentGame].pause) window.ArcadeGames[currentGame].pause();
    } else {
      if (window.ArcadeGames[currentGame].resume) window.ArcadeGames[currentGame].resume();
    }
  });

  // ── Init ──────────────────────────────────────────

  function init() {
    // Game card click handlers
    var cards = document.querySelectorAll('.game-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var gameId = card.getAttribute('data-game');
        loadGame(gameId);
      });
    });

    // Back button
    document.getElementById('game-back').addEventListener('click', exitGame);

    // Game over buttons
    document.getElementById('game-retry').addEventListener('click', function () {
      if (currentGame) {
        if (window.ArcadeGames && window.ArcadeGames[currentGame]) {
          window.ArcadeGames[currentGame].destroy();
        }
        startGame(currentGame);
      }
    });

    document.getElementById('game-quit').addEventListener('click', exitGame);

    // Escape to exit
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && currentGame) {
        exitGame();
      }
    });

    // Initial scores
    updateCardScores();
    updateLeaderboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
