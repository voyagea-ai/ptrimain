/* PTRI Innovation — shared behaviour */
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- nav ---- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('on', window.scrollY > 30); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  var burger = document.querySelector('.burger'),
      sheet = document.querySelector('.sheet');
  if (burger && sheet) {
    burger.addEventListener('click', function () {
      var open = sheet.classList.toggle('open');
      burger.classList.toggle('x', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    sheet.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        sheet.classList.remove('open'); burger.classList.remove('x');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- reveal on scroll ---- */
  var rv = document.querySelectorAll('.rv');
  if (rv.length) {
    if (RM || !('IntersectionObserver' in window)) {
      rv.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      rv.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- count up ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = parseFloat(el.dataset.count),
            suf = el.dataset.suffix || '', dec = (el.dataset.dec | 0), t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1);
          var e2 = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * e2).toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        if (RM) el.textContent = to.toFixed(dec) + suf; else requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- marquee: duplicate track for seamless loop ---- */
  document.querySelectorAll('.marq-in').forEach(function (t) {
    t.innerHTML = t.innerHTML + t.innerHTML;
  });

  /* ---- year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- intro safety net: never leave content invisible ---- */
  var intro = document.querySelectorAll('.hero-top,.hero-sub,.hero-acts,.hero-side,.scroller');
  if (intro.length) {
    setTimeout(function () {
      intro.forEach(function (el) { el.style.animation = 'none'; el.style.opacity = '1'; });
    }, 3200);
  }

  /* ---- hero signal field ---- */
  var cv = document.getElementById('field');
  if (cv && !RM) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1,
        pts = [], mx = -9999, my = -9999, tmx = -9999, tmy = -9999,
        t = 0, rings = [], visible = true, raf = 0;

    var build = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var gap = W < 700 ? 34 : 44;
      pts = [];
      for (var y = gap * 0.5; y < H; y += gap)
        for (var x = gap * 0.5; x < W; x += gap)
          pts.push({ x: x, y: y, a: 0 });
    };

    var draw = function () {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      t += 0.0042;
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      ctx.clearRect(0, 0, W, H);

      // radar rings
      for (var i = rings.length - 1; i >= 0; i--) {
        var g = rings[i]; g.r += 2.6;
        var o = 1 - g.r / g.max;
        if (o <= 0) { rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, 6.2832);
        ctx.strokeStyle = 'rgba(255,77,25,' + (o * 0.16).toFixed(3) + ')';
        ctx.lineWidth = 1; ctx.stroke();
      }

      var len = 7;
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];
        // ambient flow angle
        var fa = Math.sin(p.x * 0.0055 + t) * 1.15 + Math.cos(p.y * 0.006 - t * 0.8) * 1.15;
        var dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        var infl = d < 250 ? (1 - d / 250) : 0;
        var pa = Math.atan2(dy, dx);
        var a = fa * (1 - infl) + pa * infl;
        var l = len + infl * 9;
        var alpha = 0.16 + infl * 0.6;
        ctx.beginPath();
        ctx.moveTo(p.x - Math.cos(a) * l * .5, p.y - Math.sin(a) * l * .5);
        ctx.lineTo(p.x + Math.cos(a) * l * .5, p.y + Math.sin(a) * l * .5);
        ctx.strokeStyle = infl > 0.28
          ? 'rgba(255,77,25,' + (infl * 0.85).toFixed(3) + ')'
          : 'rgba(246,244,239,' + alpha.toFixed(3) + ')';
        ctx.lineWidth = infl > 0.5 ? 1.4 : 1;
        ctx.stroke();
      }
    };

    build();
    window.addEventListener('resize', build);
    window.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      tmx = e.clientX - r.left; tmy = e.clientY - r.top;
    }, { passive: true });
    window.addEventListener('pointerleave', function () { tmx = -9999; tmy = -9999; });
    setInterval(function () {
      if (visible && rings.length < 3) {
        var mmax = Math.max(W, H) * 0.85;
        rings.push({ x: W * 0.62, y: H * 0.42, r: 0, max: mmax });
      }
    }, 3400);
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting && !document.hidden; })
        .observe(cv);
    }
    draw();
  }

  /* ---- smooth in-page anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
    });
  });
})();
