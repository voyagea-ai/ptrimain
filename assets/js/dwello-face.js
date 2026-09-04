/* Dwello — interactive robot face.
   Injects an SVG into every [data-dwello-face] and wires expression
   controls into every [data-dwello-exp]. */
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // eye: {w,h,rx,dy,dx}  mouth: svg path d   tilt: degrees
  var EXP = {
    happy:     { l:{w:14,h:17,rx:7},  r:{w:14,h:17,rx:7},  m:'M105 101 Q120 114 135 101', tilt:0 },
    excited:   { l:{w:17,h:19,rx:8},  r:{w:17,h:19,rx:8},  m:'M102 99 Q120 121 138 99 Z', tilt:0, fill:1 },
    curious:   { l:{w:15,h:18,rx:7},  r:{w:12,h:11,rx:6},  m:'M112 104 Q120 111 129 103', tilt:-7 },
    focused:   { l:{w:18,h:7,rx:3.5}, r:{w:18,h:7,rx:3.5}, m:'M110 105 L130 105', tilt:0 },
    thinking:  { l:{w:13,h:14,rx:6,dx:-3,dy:-3}, r:{w:13,h:14,rx:6,dx:-3,dy:-3}, m:'M110 106 Q115 101 120 106 T130 106', tilt:5 },
    surprised: { l:{w:18,h:18,rx:9},  r:{w:18,h:18,rx:9},  m:'M114 102 q6 -3 6 4 q0 7 -6 4 q-6 -3 0 -8', tilt:0, fill:1 },
    sleepy:    { l:{w:15,h:4,rx:2,dy:4}, r:{w:15,h:4,rx:2,dy:4}, m:'M114 106 q6 0 6 4', tilt:8 },
    wink:      { l:{w:14,h:17,rx:7},  r:{w:15,h:4,rx:2},   m:'M105 101 Q120 114 135 101', tilt:-4 }
  };
  var ORDER = ['happy','excited','curious','focused','thinking','surprised','sleepy','wink'];

  var SVG =
  '<svg class="dw-svg" viewBox="0 0 240 250" role="img" aria-label="Dwello, a small desk robot">' +
    '<defs>' +
      '<radialGradient id="dwGlow" cx="50%" cy="50%"><stop offset="0%" stop-color="#38bdf8" stop-opacity=".26"/><stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="dwShell" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#c9cfd6"/></linearGradient>' +
      '<linearGradient id="dwShell2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f4f6f8"/><stop offset="100%" stop-color="#b9c1c9"/></linearGradient>' +
      '<radialGradient id="dwScreen" cx="50%" cy="35%"><stop offset="0%" stop-color="#16202b"/><stop offset="100%" stop-color="#070b10"/></radialGradient>' +
    '</defs>' +
    '<ellipse cx="120" cy="120" rx="118" ry="118" fill="url(#dwGlow)"/>' +
    '<ellipse class="dw-shadow" cx="120" cy="232" rx="58" ry="9" fill="#000" opacity=".45"/>' +
    '<g class="dw-bot">' +
      /* arms */
      '<rect class="dw-arm-l" x="45" y="148" width="18" height="56" rx="9" fill="url(#dwShell2)" stroke="rgba(255,255,255,.5)" stroke-width="1"/>' +
      '<g class="dw-arm-r"><rect x="177" y="148" width="18" height="56" rx="9" fill="url(#dwShell2)" stroke="rgba(255,255,255,.5)" stroke-width="1"/></g>' +
      /* body */
      '<rect x="64" y="138" width="112" height="90" rx="30" fill="url(#dwShell)"/>' +
      '<rect x="64" y="138" width="112" height="90" rx="30" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1"/>' +
      '<rect x="100" y="176" width="40" height="15" rx="7.5" fill="#e3e8ec"/>' +
      '<text x="120" y="187" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="1.2" fill="#8e979f">DWELLO</text>' +
      /* ear pods */
      '<rect x="54" y="70" width="15" height="36" rx="7.5" fill="url(#dwShell2)"/>' +
      '<rect x="171" y="70" width="15" height="36" rx="7.5" fill="url(#dwShell2)"/>' +
      /* head */
      '<g class="dw-head">' +
        '<circle cx="120" cy="88" r="54" fill="url(#dwShell)"/>' +
        '<circle cx="120" cy="88" r="54" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1"/>' +
        '<circle cx="120" cy="88" r="41" fill="url(#dwScreen)"/>' +
        '<circle cx="120" cy="88" r="41" fill="none" stroke="rgba(56,189,248,.22)" stroke-width="1"/>' +
        '<g class="dw-face" filter="none">' +
          '<rect class="dw-eye dw-eye-l" x="97" y="80" width="14" height="17" rx="7" fill="#38bdf8"/>' +
          '<rect class="dw-eye dw-eye-r" x="129" y="80" width="14" height="17" rx="7" fill="#38bdf8"/>' +
          '<path class="dw-mouth" d="M105 101 Q120 114 135 101" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>' +
        '</g>' +
      '</g>' +
    '</g>' +
  '</svg>';

  function apply(root, name) {
    var e = EXP[name] || EXP.happy;
    var L = root.querySelector('.dw-eye-l'), R = root.querySelector('.dw-eye-r'),
        M = root.querySelector('.dw-mouth'), H = root.querySelector('.dw-head');
    var set = function (el, cx, spec) {
      var w = spec.w, h = spec.h, dx = spec.dx || 0, dy = spec.dy || 0;
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.x = (cx - w / 2 + dx) + 'px';
      el.style.y = (88 - h / 2 - 2 + dy) + 'px';
      el.style.rx = spec.rx + 'px';
    };
    set(L, 104, e.l); set(R, 136, e.r);
    M.setAttribute('d', e.m);
    M.setAttribute('fill', e.fill ? '#38bdf8' : 'none');
    if (H) H.style.transform = 'rotate(' + (e.tilt || 0) + 'deg)';
    root.dataset.exp = name;
  }

  function blink(root) {
    var L = root.querySelector('.dw-eye-l'), R = root.querySelector('.dw-eye-r');
    var lh = L.style.height, rh = R.style.height, ly = L.style.y, ry = R.style.y;
    if (parseFloat(lh) < 6) return; // already closed
    var close = function (el) { el.style.height = '3px'; el.style.y = '86px'; el.style.rx = '1.5px'; };
    close(L); close(R);
    setTimeout(function () { apply(root, root.dataset.exp || 'happy'); }, 130);
  }

  document.querySelectorAll('[data-dwello-face]').forEach(function (host) {
    host.innerHTML = SVG;
    host.classList.add('dw-host');
    apply(host, host.dataset.dwelloFace || 'happy');

    // click reaction
    host.addEventListener('click', function () {
      var next = ORDER[Math.floor(Math.random() * ORDER.length)];
      if (next === host.dataset.exp) next = 'excited';
      apply(host, next);
      syncButtons(next);
      var bot = host.querySelector('.dw-bot');
      bot.classList.remove('dw-bounce'); void bot.offsetWidth; bot.classList.add('dw-bounce');
    });

    if (!RM) {
      setInterval(function () {
        if (!document.hidden && Math.random() > 0.35) blink(host);
      }, 3800);
    }
  });

  var hosts = document.querySelectorAll('[data-dwello-face]');
  function syncButtons(name) {
    document.querySelectorAll('[data-dwello-exp] button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.e === name);
    });
  }

  document.querySelectorAll('[data-dwello-exp]').forEach(function (bar) {
    ORDER.forEach(function (name) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.e = name;
      b.textContent = name;
      b.addEventListener('click', function () {
        hosts.forEach(function (h) { apply(h, name); });
        syncButtons(name);
      });
      bar.appendChild(b);
    });
  });
  syncButtons('happy');
})();
