# PTRI Innovation — website (redesign)

Static site. No build step, no dependencies: every page is plain HTML/CSS/JS and
can be dropped on any static host (Vercel, Netlify, Cloudflare Pages, S3, nginx).

## Run it locally

```bash
python3 -m http.server 4640
```

Then open http://localhost:4640

## Structure

```
index.html                    Landing page
products/index.html           Products overview
products/voyagea/             Voyagea — AI travel planner (live)
products/dwello/              Dwello — radar desk robot (prototype, full page)
products/ptrionix/            Ptrionix — ERP for builders (launching 14.09.2026)
projects/index.html           Projects hub
projects/websites/            Websites built by PTRI (5 live builds)
ReadRush/                     ReadRush app hub (live RSVP demo in a phone frame)
ReadRush/privacy/             ReadRush Privacy Policy  <- App Store privacy URL
ReadRush/support/             ReadRush Support + FAQ   <- App Store support URL
RushRage/                     Generated mirror of ReadRush/ (see below)
portfolio.html                Redirect → /projects/websites/ (old URL)
404.html, robots.txt, sitemap.xml
assets/css/base.css           Design system (tokens, type, components)
assets/js/site.js             Nav, reveals, counters, hero signal field
assets/js/dwello-face.js      The Dwello robot face (SVG + 8 expressions)
assets/js/room-sim.js         Dwello radar room simulation
assets/js/doc.js              Doc pages: contents rail, reading progress, focus dot
assets/img/readrush-icon.svg  ReadRush app icon (vector recreation)
vercel.json / _redirects      Host redirect rules (case variants, /portfolio)
assets/img/*.jpg              Live screenshots of each site
.build/                       Dev-only: nav/head/footer partials + assemble.py
```

### Editing the nav or footer

They are duplicated into every page (so the site stays dependency-free). Edit
`.build/nav.html`, `.build/head.html` or `.build/foot.html`, put the
`<!--NAV-->` / `<!--HEAD-->` / `<!--FOOT-->` markers back where you want them,
then run:

```bash
python3 .build/assemble.py index.html products/index.html products/*/index.html projects/index.html projects/websites/index.html
```

`.build/` never ships anything to the browser — you can delete it before deploy.

### ReadRush: two URL spellings, one source

The app's own text links to `/RushRage/privacy` and `/RushRage/support`, but the
app is called ReadRush. Rather than guess, **both work**:

- `/ReadRush/…` is canonical — every page carries `rel="canonical"` pointing here.
- `/RushRage/…` is a full generated mirror, so an already-submitted App Store link
  cannot 404. Its internal links stay inside `/RushRage/`.

Edit only the files under `ReadRush/`, then regenerate the mirror:

```bash
python3 .build/mirror-readrush.py
```

If you confirm which spelling the App Store listing actually uses, delete the other
tree and add a redirect for it — carrying both forever is not ideal for SEO.

> **Do not create `/ReadRush/Privacy/` as a folder.** macOS filesystems are
> case-insensitive, so it is the *same directory* as `/ReadRush/privacy/` and will
> silently overwrite the real page. Capitalisation variants are handled by the
> redirect rules in `vercel.json` / `_redirects` instead.

## Design

- **Type** — Inter Tight (display + UI), Instrument Serif italic (accents),
  JetBrains Mono (spec labels). All from Google Fonts.
- **Colour** — graphite `#08090b` base, warm ink `#f6f4ef`, signal orange
  `#ff4d19`. Per-product accents: Voyagea teal `#3ecfb2`, Dwello cyan `#38bdf8`,
  Ptrionix amber `#f5b324` (matching each product's own brand).
- **Signature moments** — the hero's cursor-reactive signal field (canvas),
  the live Voyagea itinerary demo, the interactive Dwello face, the Ptrionix
  countdown, and the draggable radar room simulation on the Dwello page.
- Respects `prefers-reduced-motion`; all animation stops and content stays visible.

## Before you go live — things that still need wiring

1. **Contact form** (`index.html`) and **Dwello early-access form**
   (`products/dwello/index.html`) currently open the visitor's mail client via
   `mailto:info@ptriinnovation.com`. That works everywhere, but it loses people
   who use webmail. Swap in a real endpoint (Formspree, Resend, a serverless
   function) — look for the `<script>` block at the bottom of each page.
2. **Social handles** — `linkedin.com/company/ptri-innovation` and
   `x.com/ptriinnovation` are carried over from the old site. Confirm the X
   handle exists, or remove the link.
3. **Registered office** — 706 Supath Complex, Vijay Cross Road, Ahmedabad, is
   carried over from the old site. Confirm it's current.
4. **Screenshots** in `assets/img/` were captured live on 2026-08-21. They will
   drift as those sites change — re-capture when they do. (The Ptrionix shot
   shows a countdown that will be stale after 14 September 2026.)
5. **Skyvage** is included in the websites index because it was in the old
   portfolio. Remove the `<article class="entry ...">` block in
   `projects/websites/index.html` and its tile in `index.html` if you'd rather
   only show the four sites on your own domains.
6. **OG image** — no `og:image` is set. Add one (1200×630) for link previews.
7. **ReadRush icon** — `assets/img/readrush-icon.svg` is a vector *recreation* of the
   app icon, drawn to match. For pixel-exact, drop the real 1024×1024 PNG in as
   `assets/img/readrush-icon.png`, swap the `<img src>` references under `ReadRush/`,
   then re-run the mirror script.
8. **ReadRush App Store URLs** — point the listing's Privacy Policy URL at
   `https://ptriinnovation.com/ReadRush/privacy` and the Support URL at
   `https://ptriinnovation.com/ReadRush/support`. Both `/RushRage/` spellings also
   resolve, so an existing submission will not break.
