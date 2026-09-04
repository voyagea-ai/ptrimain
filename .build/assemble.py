#!/usr/bin/env python3
"""Injects the shared nav + footer partials into any page containing
   <!--NAV--> / <!--FOOT--> markers. Output is plain static HTML."""
import sys, os, re, pathlib
root = pathlib.Path(__file__).resolve().parent
nav = open(root / 'nav.html').read()
foot = open(root / 'foot.html').read()
head = open(root / 'head.html').read()
for f in sys.argv[1:]:
    p = pathlib.Path(f)
    s = p.read_text()
    n = nav
    # mark the current top-level section in the nav
    key = p.parent.name if p.parent.name in ('products', 'projects') else ''
    s = s.replace('<!--HEAD-->', head).replace('<!--NAV-->', n).replace('<!--FOOT-->', foot)
    # only the homepage marks Home as current
    if p.as_posix().rstrip('/').split('/')[-1] != 'index.html' or p.parent != pathlib.Path('.'):
        s = s.replace('<a href="/" aria-current="page">Home</a>', '<a href="/">Home</a>')
    p.write_text(s)
    print('assembled', f)
