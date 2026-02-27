/**
 * deck.js — Lightweight slide deck engine
 *
 * Usage: <div class="deck" id="deck"><div class="slide active">...</div></div>
 * Supports: arrow keys, swipe, click-to-advance, ?slide=N, progress bar.
 * Disables keyboard nav when input/textarea/select is focused.
 * ES5-compatible.
 */
(function () {
  'use strict';

  var deck = document.getElementById('deck');
  if (!deck) return;

  var slides = deck.querySelectorAll('.slide');
  var total = slides.length;
  if (total === 0) return;

  var counter = document.getElementById('slide-counter');
  var progressFill = document.getElementById('progress-fill');
  var current = 0;

  // Read ?slide=N from URL
  var params = new URLSearchParams(window.location.search);
  var startSlide = parseInt(params.get('slide'), 10);
  if (startSlide && startSlide >= 1 && startSlide <= total) {
    current = startSlide - 1;
  }

  function goTo(index) {
    if (index < 0 || index >= total) return;
    slides[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');

    if (counter) counter.textContent = (current + 1) + ' / ' + total;
    if (progressFill) progressFill.style.width = (((current + 1) / total) * 100) + '%';

    // Update URL without reload
    var url = new URL(window.location);
    url.searchParams.set('slide', current + 1);
    history.replaceState(null, '', url);
  }

  // Initialize
  for (var i = 0; i < slides.length; i++) {
    slides[i].classList.remove('active');
  }
  goTo(current);

  // Keyboard
  document.addEventListener('keydown', function (e) {
    // Skip if user is typing in a form field
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(total - 1);
    }
  });

  // Touch swipe
  var touchStartX = 0;
  var touchStartY = 0;

  deck.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  deck.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goTo(current + 1);
      else goTo(current - 1);
    }
  }, { passive: true });

  // Click to advance (skip interactive elements)
  deck.addEventListener('click', function (e) {
    var tag = e.target.tagName;
    if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'LABEL') return;
    if (e.target.closest('form') || e.target.closest('a') || e.target.closest('button')) return;

    var rect = deck.getBoundingClientRect();
    var x = e.clientX - rect.left;
    if (x > rect.width / 2) goTo(current + 1);
    else goTo(current - 1);
  });

  // Expose for external use
  window.Deck = { goTo: goTo };

})();
