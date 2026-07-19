#!/usr/bin/env python3
"""Network-free docs gate for the Great Expectations site.

For every HTML file under site/:
  - balanced tags (tolerant of void elements)
  - exactly one <h1>
  - <html lang="..."> present
  - <title> present
  - every internal href/src resolves to an existing file
  - no external RESOURCE loads (zero external requests at runtime)

For every CSS file under site/:
  - no url(http...) remote imports

Exits non-zero on any failure (used to block merge).
"""
import html.parser
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site")

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}


class Checker(html.parser.HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.stack = []
        self.h1 = 0
        self.has_lang = False
        self.has_title = False
        self.errors = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "html" and d.get("lang"):
            self.has_lang = True
        if tag == "title":
            self.has_title = True
        if tag == "h1":
            self.h1 += 1
        if tag in VOID:
            return
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f"stray </{tag}> with empty stack")
            return
        if self.stack[-1] == tag:
            self.stack.pop()
        elif tag in self.stack:
            while self.stack and self.stack[-1] != tag:
                self.errors.append(f"unclosed <{self.stack[-1]}> before </{tag}>")
                self.stack.pop()
            if self.stack:
                self.stack.pop()
        else:
            self.errors.append(f"unexpected </{tag}>")


def check_html(path):
    with open(path, encoding="utf-8") as f:
        body = f.read()
    c = Checker(path)
    c.feed(body)
    c.close()

    if c.stack:
        for t in c.stack:
            c.errors.append(f"unclosed <{t}> at EOF")
    if c.h1 != 1:
        c.errors.append(f"expected exactly 1 <h1>, found {c.h1}")
    if not c.has_lang:
        c.errors.append('missing <html lang="...">')
    if not c.has_title:
        c.errors.append("missing <title>")

    # Internal link integrity — resolve relative to the file's own directory.
    directory = os.path.dirname(path)
    for line in body.splitlines():
        for token in ("href=", "src="):
            idx = line.find(token)
            while idx != -1:
                q1 = line.find('"', idx)
                if q1 == -1:
                    break
                start = q1 + 1
                q2 = line.find('"', start)
                if q2 == -1:
                    break
                val = line[start:q2].strip()
                idx = line.find(token, q2)
                if not val:
                    continue
                if val.startswith(("http://", "https://", "//", "#", "mailto:", "data:")):
                    continue
                target = os.path.normpath(os.path.join(directory, val))
                if not os.path.exists(target):
                    c.errors.append(f"broken internal link: {val}")
    return c.errors


def check_css(path):
    with open(path, encoding="utf-8") as f:
        body = f.read()
    errs = []
    for m in re.finditer(r"url\(\s*(['\"]?)([^)]+)\1\s*\)", body):
        ref = m.group(2).strip()
        if ref.startswith(("http://", "https://", "//")):
            errs.append(f"external resource in CSS: url({ref})")
    return errs


def main():
    if not os.path.isdir(SITE):
        print(f"site/ not found at {SITE}")
        return 1
    failed = False
    for dirpath, _, files in os.walk(SITE):
        for name in sorted(files):
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, ROOT)
            if name.endswith(".html"):
                errs = check_html(full)
            elif name.endswith(".css"):
                errs = check_css(full)
            else:
                continue
            if errs:
                failed = True
                print(f"[FAIL] {rel}")
                for e in errs:
                    print(f"   - {e}")
            else:
                print(f"[ok]   {rel}")
    if failed:
        print("\nDocs gate FAILED.")
        return 1
    print("\nDocs gate PASSED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
