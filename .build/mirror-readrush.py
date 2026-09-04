#!/usr/bin/env python3
"""ReadRush pages are authored once under /ReadRush/ and mirrored to
   /RushRage/ (the spelling used in the App Store submission) so neither
   URL can 404. Canonical tags always point at /ReadRush/.
   Run from the site root:  python3 .build/mirror-readrush.py
"""
import os, re, shutil, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, DST = ROOT / 'ReadRush', ROOT / 'RushRage'

if DST.exists():
    shutil.rmtree(DST)

for src in SRC.rglob('index.html'):
    rel = src.relative_to(SRC)
    out = DST / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    s = src.read_text()
    # every in-tree link stays in this tree …
    s = s.replace('href="/ReadRush/', 'href="/RushRage/')
    # … but the canonical URL always points back at the ReadRush spelling
    s = re.sub(r'(<link rel="canonical" href="https://ptriinnovation\.com)/RushRage/',
               r'\1/ReadRush/', s)
    # visible URLs in the prose keep naming the canonical spelling
    s = s.replace('>https://ptriinnovation.com/RushRage/', '>https://ptriinnovation.com/ReadRush/')
    out.write_text(s)
    print('mirrored', out.relative_to(ROOT))

# NOTE: case variants (/ReadRush/Privacy, /RushRage/Support, …) are handled by
# host redirect rules in vercel.json / _redirects — NOT by extra directories.
# macOS has a case-insensitive filesystem, so creating them as folders here
# silently overwrites the real pages.
