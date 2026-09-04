/* Document pages — contents, reading progress, and the travelling focus dot
   (the ReadRush bar-and-dot motif, reused as navigation). */
(function () {
  'use strict';
  var prose = document.querySelector('.prose'),
      toc = document.querySelector('.toc'),
      list = toc && toc.querySelector('ol');
  if (!prose) return;

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reading progress */
  var bar = document.createElement('div');
  bar.className = 'docprog';
  if (RM) bar.style.transition = 'none';
  document.body.appendChild(bar);

  /* estimated read time */
  var slot = document.querySelector('[data-readtime]');
  if (slot) {
    var n = (prose.textContent || '').trim().split(/\s+/).length;
    slot.textContent = Math.max(1, Math.round(n / 220)) + ' min read';
  }

  /* contents — top-level sections plus any FAQ questions, in document order */
  var nodes = [].slice.call(prose.querySelectorAll('h2[id], .faq > details')),
      entries = [], links = [], dot = null, q = 0;

  nodes.forEach(function (el) {
    var isFaq = el.tagName === 'DETAILS', label;
    if (isFaq) {
      if (!el.id) el.id = 'q' + (++q);
      var sum = el.querySelector('summary');
      label = (sum ? sum.textContent : '').replace(/\s+/g, ' ').trim();
    } else {
      label = (el.dataset.toc || el.textContent).trim();
    }
    entries.push({ el: el, label: label, sub: isFaq });
  });

  if (list && entries.length) {
    entries.forEach(function (e) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + e.el.id;
      a.textContent = e.label;
      if (e.sub) a.className = 'sub';
      a.addEventListener('click', function () { if (e.sub) e.el.open = true; });
      li.appendChild(a);
      list.appendChild(li);
      links.push(a);
    });

    var count = toc.querySelector('[data-toccount]');
    if (count) count.textContent = String(prose.querySelectorAll('h2[id]').length).padStart(2, '0');

    dot = document.createElement('span');
    dot.className = 'tocdot';
    (list.parentNode || toc).appendChild(dot);
  }

  var active = -1;
  function setActive(i) {
    if (i === active || !links.length || !links[i]) return;
    active = i;
    links.forEach(function (a, j) { a.classList.toggle('on', i === j); });
    if (dot) dot.style.top = (links[i].offsetTop + links[i].offsetHeight / 2 - 3.5) + 'px';
  }

  function onScroll() {
    var top = prose.getBoundingClientRect().top + window.scrollY,
        span = Math.max(1, prose.offsetHeight - window.innerHeight * 0.6),
        p = Math.min(1, Math.max(0, (window.scrollY - top + 120) / span));
    bar.style.width = (p * 100).toFixed(2) + '%';

    if (!entries.length) return;
    var y = window.scrollY + 150, i = 0;
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].el.getBoundingClientRect().top + window.scrollY <= y) i = k;
    }
    setActive(i);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { active = -1; onScroll(); });
  setActive(0);
  onScroll();
})();
