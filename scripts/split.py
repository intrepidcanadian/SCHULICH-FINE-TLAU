#!/usr/bin/env python3
"""One-time: split each chapter's monolithic index.html into per-slide files.

For each chapter (ch1..ch4):
  1. Locate every <section class="slide ...">...</section> block (and any
     immediately-preceding HTML comment that documents it).
  2. Write each block to chN/slides/NN-slug.html with NN derived from the
     position and slug from the section comment / data-screen-label.
  3. Rewrite chN/index.html so the slides region is replaced by:

         <!-- BEGIN SLIDES -->
         <!-- END SLIDES -->

     ready to be rebuilt by scripts/build.py.

After this script runs, the source-of-truth is chN/slides/*.html. The
chN/index.html file is generated output; never edit it directly.

Usage: python3 scripts/split.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BEGIN = "<!-- BEGIN SLIDES -->"
END = "<!-- END SLIDES -->"

# Capture: optional leading HTML comment block (line-leading) + line-leading
# <section class="slide ..."> ... line-leading </section>. Anchoring on column
# zero avoids matching the example "<section class=\"slide ...\">" that appears
# *inside* the instructional comment near the top of the deck region.
SLIDE_RE = re.compile(
    r"(?P<lead>(?:^<!--[^-]*(?:-[^-]+)*-->\s*\n)?)"
    r"(?P<body>^<section\s+class=\"slide[^\"]*\"[^>]*>.*?^</section>)",
    re.S | re.M,
)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:50] or "slide"


def derive_slug(slide_html: str, comment: str) -> str:
    # Prefer the SLIDE NN · <description> in the leading comment
    m = re.search(r"SLIDE\s+\d+\s*[·\.\-:]+\s*([^\n]+)", comment, re.I)
    if m:
        raw = m.group(1)
        # Trim trailing decoration like "(dark)" or "==="
        raw = re.sub(r"\(.*?\)", "", raw)
        raw = re.sub(r"=+", "", raw)
        raw = raw.strip()
        if raw:
            return slugify(raw)
    # Fall back to data-screen-label="NN <slug>"
    m = re.search(r'data-screen-label="(\d+\s+)?([^"]+)"', slide_html)
    if m:
        return slugify(m.group(2))
    return "slide"


def split_chapter(chapter_dir: Path) -> None:
    index_path = chapter_dir / "index.html"
    slides_dir = chapter_dir / "slides"

    html = index_path.read_text(encoding="utf-8")

    # Refuse to clobber an already-split chapter. After the bootstrap, the
    # source of truth is slides/*.html, and index.html is generated. Re-running
    # split.py against a stale index.html would silently delete edits to slide
    # partials that hadn't been rebuilt yet.
    if BEGIN in html or END in html:
        print(
            f"  {chapter_dir.name}: already split (BEGIN/END SLIDES markers "
            f"present in index.html); skipping"
        )
        return

    slides_dir.mkdir(exist_ok=True)

    # Find the deck container: insert markers right after <div id="deck"> and
    # before the matching </div>. The deck region is everything from the line
    # after the opening tag down to the closing </div>.
    deck_open_re = re.compile(r'<div\s+id="deck">\s*\n', re.S)
    open_match = deck_open_re.search(html)
    if not open_match:
        raise SystemExit(f"{index_path}: <div id=\"deck\"> not found")
    deck_start = open_match.end()
    # Find the </div> that closes the deck. Heuristic: first standalone </div>
    # at the start of a line after deck_start. The deck has no nested top-level
    # </div> at the line start because each <section class="slide"> is closed
    # by </section>, and inner <div>s are indented.
    close_re = re.compile(r"^\</div\>\s*$", re.M)
    close_match = close_re.search(html, pos=deck_start)
    if not close_match:
        raise SystemExit(f"{index_path}: closing </div> for deck not found")
    deck_region = html[deck_start : close_match.start()]

    matches = list(SLIDE_RE.finditer(deck_region))
    if not matches:
        raise SystemExit(f"{index_path}: no slide sections found")

    # Clean any pre-existing slides/*.html so we have a deterministic output.
    for old in slides_dir.glob("*.html"):
        old.unlink()

    for idx, m in enumerate(matches, start=1):
        comment = m.group("lead")
        body = m.group("body")
        slug = derive_slug(body, comment)
        # Use leading comment as-is; if absent, prefix a small one for context.
        if comment.strip():
            content = comment.rstrip() + "\n" + body.rstrip() + "\n"
        else:
            content = (
                f"<!-- SLIDE {idx:02d} · {slug.replace('-', ' ')} -->\n"
                + body.rstrip() + "\n"
            )
        out = slides_dir / f"{idx:02d}-{slug}.html"
        out.write_text(content, encoding="utf-8")

    # Rebuild the deck region: keep any pre-section content (e.g. instructional
    # comment "SLIDES 插入区"), drop slides, leave markers in place.
    pre_first_slide = deck_region[: matches[0].start()].rstrip()
    new_deck_region = (
        ("\n" + pre_first_slide + "\n" if pre_first_slide else "\n")
        + f"\n{BEGIN}\n{END}\n\n"
    )

    new_html = html[:deck_start] + new_deck_region + html[close_match.start() :]
    index_path.write_text(new_html, encoding="utf-8")

    print(
        f"  {chapter_dir.name}: split {len(matches)} slides → {slides_dir}/, "
        f"rewrote index.html with markers"
    )


def main() -> int:
    chapters = sorted(p for p in REPO_ROOT.glob("ch*") if p.is_dir())
    if not chapters:
        raise SystemExit(f"no chapter dirs found in {REPO_ROOT}")
    for ch in chapters:
        split_chapter(ch)
    return 0


if __name__ == "__main__":
    sys.exit(main())
