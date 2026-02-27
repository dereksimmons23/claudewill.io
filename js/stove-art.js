/**
 * stove-art.js — Pixel art wood-burning stove rendered with Unicode half-blocks
 *
 * Each character cell shows two vertical pixels via U+2580 (upper half-block):
 *   CSS color      = top pixel
 *   CSS background = bottom pixel
 *
 * All content is generated from hardcoded color values — no user input.
 * Injected into #stove-art on the Kitchen page.
 */
(function () {
  'use strict';

  var el = document.getElementById('stove-art');
  if (!el) return;

  /* ── Palette ─────────────────────────────────────── */
  var C = {
    _: null,          // transparent — page background shows through
    b: '#8B4513',     // saddle brown — main body
    s: '#A0522D',     // sienna — body highlight
    d: '#3E2723',     // dark brown — shadow, edges, trim
    c: '#D2691E',     // chocolate — warm accent
    p: '#CD853F',     // peru — lighter accent
    k: '#1a1a1a',     // near-black — door frame, grate
    f: '#d97706',     // fire glow — amber
    e: '#f59e0b',     // fire bright — yellow-amber
    r: '#b45309',     // fire deep — dark amber / ember
    g: '#9e9e9e',     // smoke — medium gray
    w: '#6b7280',     // smoke — cooler gray
    n: '#a16207',     // dark gold — fire rim / embers
    i: '#6d4c41',     // brown gray — iron accent
    l: '#5d4037',     // dark roast — iron body
    o: '#ef6c00',     // hot orange — fire core
    a: '#4e342e',     // ash brown — stove detail
  };

  /* ── Pixel grid ──────────────────────────────────── *
   * 26 columns x 36 rows = 18 character rows
   * Row pairs: [top, bottom] -> one half-block row
   *
   * Design: Potbelly / Franklin-style cast-iron stove, front view
   * Features: chimney pipe, top plate, rounded body with bulge,
   *           door with grate and fire glow, decorative legs
   */

  var _ = '_', b = 'b', s = 's', d = 'd', c = 'c', p = 'p';
  var k = 'k', f = 'f', e = 'e', r = 'r', g = 'g', w = 'w';
  var n = 'n', i = 'i', l = 'l', o = 'o', a = 'a';

  var pixels = [

    // -- Row 0-1: Upper smoke wisps (scattered, organic)
    [_,_,_,_,_,_,_,_,_,_,_,_,w,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,g,_,_,_,_,_,_,_,_,_,_,_,_],

    // -- Row 2-3: Mid smoke
    [_,_,_,_,_,_,_,_,_,_,_,g,_,w,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,g,_,_,_,_,_,_,_,_,_,_,_,_,_],

    // -- Row 4-5: Chimney cap
    [_,_,_,_,_,_,_,_,_,_,d,d,d,d,d,d,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,d,l,i,i,l,d,_,_,_,_,_,_,_,_,_,_],

    // -- Row 6-7: Chimney pipe
    [_,_,_,_,_,_,_,_,_,_,_,d,l,l,d,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,d,i,i,d,_,_,_,_,_,_,_,_,_,_,_],

    // -- Row 8-9: Chimney-to-body flange
    [_,_,_,_,_,_,_,_,_,_,d,d,i,i,d,d,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,d,d,d,d,d,d,d,d,d,d,d,d,d,d,d,d,_,_,_,_,_],

    // -- Row 10-11: Top plate (wide, flat, warm chocolate surface)
    [_,_,_,_,_,d,c,c,c,c,c,p,c,c,p,c,c,c,c,c,d,_,_,_,_,_],
    [_,_,_,_,_,d,d,d,d,d,d,d,d,d,d,d,d,d,d,d,d,_,_,_,_,_],

    // -- Row 12-13: Body top shoulder (narrower than plate = shouldered look)
    [_,_,_,_,_,_,d,b,b,b,b,b,b,b,b,b,b,b,b,d,_,_,_,_,_,_],
    [_,_,_,_,_,_,d,s,s,c,c,c,c,c,c,c,c,s,s,d,_,_,_,_,_,_],

    // -- Row 14-15: Body upper — starts to widen (potbelly bulge)
    [_,_,_,_,_,d,b,s,c,c,p,p,p,p,p,p,c,c,s,b,d,_,_,_,_,_],
    [_,_,_,_,_,d,b,s,c,p,p,p,p,p,p,p,p,c,s,b,d,_,_,_,_,_],

    // -- Row 16-17: Body — door frame top (widest point of bulge)
    [_,_,_,_,d,b,s,c,p,p,k,k,k,k,k,k,p,p,c,s,b,d,_,_,_,_],
    [_,_,_,_,d,b,s,c,p,k,k,k,k,k,k,k,k,p,c,s,b,d,_,_,_,_],

    // -- Row 18-19: Door — fire glow top (grate bars visible)
    [_,_,_,_,d,b,s,c,p,k,a,r,f,f,r,a,k,p,c,s,b,d,_,_,_,_],
    [_,_,_,_,d,b,s,c,p,k,r,f,o,o,f,r,k,p,c,s,b,d,_,_,_,_],

    // -- Row 20-21: Door — fire glow core (hottest)
    [_,_,_,_,d,b,s,c,p,k,f,o,e,e,o,f,k,p,c,s,b,d,_,_,_,_],
    [_,_,_,_,d,b,s,c,p,k,f,e,o,e,e,f,k,p,c,s,b,d,_,_,_,_],

    // -- Row 22-23: Door — fire lower (cooling embers)
    [_,_,_,_,d,b,s,c,p,k,r,f,o,f,f,r,k,p,c,s,b,d,_,_,_,_],
    [_,_,_,_,d,b,s,c,p,k,n,r,f,r,r,n,k,p,c,s,b,d,_,_,_,_],

    // -- Row 24-25: Door — grate bottom / door handle
    [_,_,_,_,d,b,s,c,p,k,a,n,n,n,n,a,k,p,c,s,b,d,_,_,_,_],
    [_,_,_,_,d,b,s,c,p,k,k,k,k,k,k,k,k,p,c,s,b,d,_,_,_,_],

    // -- Row 26-27: Body lower — belly narrows back down
    [_,_,_,_,_,d,b,s,c,p,p,p,p,p,p,p,p,c,s,b,d,_,_,_,_,_],
    [_,_,_,_,_,d,b,s,c,c,c,c,c,c,c,c,c,c,s,b,d,_,_,_,_,_],

    // -- Row 28-29: Body bottom rim (mirrors shoulder)
    [_,_,_,_,_,_,d,s,s,c,c,c,c,c,c,c,c,s,s,d,_,_,_,_,_,_],
    [_,_,_,_,_,_,d,b,b,b,b,b,b,b,b,b,b,b,b,d,_,_,_,_,_,_],

    // -- Row 30-31: Base plate (wide, grounding)
    [_,_,_,_,_,d,d,d,d,d,d,d,d,d,d,d,d,d,d,d,d,_,_,_,_,_],
    [_,_,_,_,_,_,d,d,d,d,d,d,d,d,d,d,d,d,d,d,_,_,_,_,_,_],

    // -- Row 32-33: Legs — decorative curved feet
    [_,_,_,_,_,_,_,d,a,_,_,_,_,_,_,_,_,a,d,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,d,d,_,_,_,_,_,_,_,_,_,_,d,d,_,_,_,_,_,_],
  ];

  /* ── Smoke zone: pixel rows 0-3 ─────────────────── */
  var smokePositions = {};
  var sr, sc;
  for (sr = 0; sr < 4; sr++) {
    for (sc = 0; sc < pixels[sr].length; sc++) {
      if (pixels[sr][sc] !== _) {
        smokePositions[sr + ',' + sc] = true;
      }
    }
  }

  /* ── Build the DOM from hardcoded palette ────────── */
  var pre = document.createElement('pre');
  var row, col, top, bot, width, tk, bk, tc, bc, isSmoke, span, charRow;

  for (row = 0; row < pixels.length; row += 2) {
    top = pixels[row];
    bot = pixels[row + 1] || [];
    width = Math.max(top.length, bot.length);
    charRow = '';

    for (col = 0; col < width; col++) {
      tk = top[col] || _;
      bk = bot[col] || _;
      tc = tk !== _ ? C[tk] : null;
      bc = bk !== _ ? C[bk] : null;

      isSmoke = !!(smokePositions[row + ',' + col] ||
                   smokePositions[(row + 1) + ',' + col]);

      if (!tc && !bc) {
        charRow += ' ';
      } else {
        // Flush accumulated spaces as a text node
        if (charRow) {
          pre.appendChild(document.createTextNode(charRow));
          charRow = '';
        }

        span = document.createElement('span');
        if (isSmoke) span.className = 'smoke-char';

        if (tc && bc) {
          span.style.color = tc;
          span.style.background = bc;
          span.textContent = '\u2580'; // upper half-block
        } else if (tc) {
          span.style.color = tc;
          span.textContent = '\u2580'; // upper half-block
        } else {
          span.style.color = bc;
          span.textContent = '\u2584'; // lower half-block
        }

        pre.appendChild(span);
      }
    }

    // Flush remaining spaces + newline
    charRow += '\n';
    pre.appendChild(document.createTextNode(charRow));
  }

  el.appendChild(pre);

})();
