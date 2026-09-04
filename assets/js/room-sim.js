/* Dwello room simulation — presence, zones, distance and an event stream,
   driven by a draggable target. No camera, no video: just the fields a
   mmWave sensor actually reports. */
(function () {
  'use strict';
  var room = document.getElementById('room');
  if (!room) return;

  var target = document.getElementById('target'),
      beam = document.getElementById('beamline'),
      stream = document.getElementById('stream'),
      zones = [].slice.call(room.querySelectorAll('.zone'));

  var el = {
    status: document.getElementById('stStatus'),
    people: document.getElementById('stPeople'),
    zone:   document.getElementById('stZone'),
    dist:   document.getElementById('stDist'),
    entry:  document.getElementById('stEntry'),
    dur:    document.getElementById('stDur')
  };

  var DW = { x: 79, y: 20 };      // Dwello sits on the desk, in % of the room
  var ROOM_M = 6.0;               // room is ~6 m across, so 1% ≈ 6 cm
  var pos = { x: 8, y: 50 };
  var present = false, entryAt = null, lastZone = null, moved = false, first = true;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function zoneAt(x, y) {
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i], s = z.style;
      var zx = parseFloat(s.left), zy = parseFloat(s.top),
          zw = parseFloat(s.width), zh = parseFloat(s.height);
      if (x >= zx && x <= zx + zw && y >= zy && y <= zy + zh) return z.dataset.zone;
    }
    return 'Open floor';
  }

  function clock(d) {
    d = d || new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function log(event, detail) {
    if (first) { stream.innerHTML = ''; first = false; }
    var row = document.createElement('div');
    row.innerHTML = '<span class="t">' + clock() + '</span>  ' +
                    '<span class="e">' + event + '</span>  ' +
                    '<span class="z">' + detail + '</span>';
    stream.appendChild(row);
    while (stream.children.length > 60) stream.removeChild(stream.firstChild);
    stream.scrollTop = stream.scrollHeight;
  }

  function distanceCm() {
    var dx = (pos.x - DW.x) / 100 * ROOM_M,
        dy = (pos.y - DW.y) / 100 * (ROOM_M * 0.75);
    return Math.round(Math.sqrt(dx * dx + dy * dy) * 100);
  }

  function render() {
    target.style.left = pos.x + '%';
    target.style.top = pos.y + '%';
    beam.setAttribute('x2', pos.x);
    beam.setAttribute('y2', pos.y * 0.75);

    var z = zoneAt(pos.x, pos.y);
    zones.forEach(function (n) { n.classList.toggle('hot', n.dataset.zone === z); });
    el.zone.textContent = z;
    el.dist.textContent = present ? distanceCm() + ' cm' : '—';

    if (z !== lastZone) {
      if (moved) {
        log(z === 'Open floor' ? 'MOVE ' : 'ENTER', 'zone=' + z + '  d=' + distanceCm() + 'cm');
      }
      lastZone = z;
    }
  }

  function enter() {
    if (present) return;
    present = true; entryAt = Date.now();
    el.status.textContent = 'Occupied';
    el.status.className = 'ok';
    el.people.textContent = '1';
    el.entry.textContent = clock(new Date(entryAt));
    log('PRESENCE', 'target acquired  ·  Dwello wakes up');
  }

  setInterval(function () {
    if (!present || !entryAt) return;
    var s = Math.floor((Date.now() - entryAt) / 1000);
    el.dur.textContent = s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  }, 1000);

  /* ---- pointer drag ---- */
  var dragging = false;
  function toPct(e) {
    var r = room.getBoundingClientRect();
    return {
      x: clamp((e.clientX - r.left) / r.width * 100, 2, 98),
      y: clamp((e.clientY - r.top) / r.height * 100, 2, 98)
    };
  }
  function move(e) {
    pos = toPct(e);
    if (!moved) { moved = true; enter(); }
    render();
  }
  target.addEventListener('pointerdown', function (e) {
    dragging = true; target.setPointerCapture(e.pointerId); e.preventDefault();
  });
  room.addEventListener('pointerdown', function (e) {
    if (e.target === target) return;
    move(e);
  });
  window.addEventListener('pointermove', function (e) { if (dragging) move(e); });
  window.addEventListener('pointerup', function () { dragging = false; });

  /* ---- keyboard ---- */
  var KEYS = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] };
  function key(e) {
    var d = KEYS[e.key];
    if (!d) return;
    e.preventDefault();
    pos.x = clamp(pos.x + d[0], 2, 98);
    pos.y = clamp(pos.y + d[1], 2, 98);
    if (!moved) { moved = true; enter(); }
    render();
  }
  target.addEventListener('keydown', key);
  room.addEventListener('keydown', key);

  render();
})();
