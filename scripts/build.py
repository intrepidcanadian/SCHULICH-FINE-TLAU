#!/usr/bin/env python3
"""Concatenate per-slide partials into chapter index.html.

For each chapter (ch1..ch4), reads all chN/slides/*.html in name order and
splices their content into chN/index.html between the markers:

    <!-- BEGIN SLIDES -->
    <!-- END SLIDES -->

Slide partials are HTML fragments — typically a leading <!-- ... --> comment
followed by a <section class="slide ...">...</section>. Pure copy-paste, no
templating.

Usage:
    python3 scripts/build.py            # build all chapters
    python3 scripts/build.py ch1 ch3    # build only listed chapters
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BEGIN = "<!-- BEGIN SLIDES -->"
END = "<!-- END SLIDES -->"


def build_chapter(chapter_dir: Path) -> None:
    index_path = chapter_dir / "index.html"
    slides_dir = chapter_dir / "slides"
    no_rebuild = chapter_dir / ".no-rebuild"

    if not index_path.exists():
        raise SystemExit(f"missing {index_path}")
    if not slides_dir.is_dir():
        raise SystemExit(f"missing {slides_dir}")

    if no_rebuild.exists():
        # Chapter is locked: index.html is hand-curated (e.g. locked-appendix
        # split) and must not be regenerated from the full slides/*.html glob,
        # which would re-inflate the curated deck back to the union of partials.
        # See HYPERFRAMES.md "Locked-split topology" for the rationale.
        reason = no_rebuild.read_text(encoding="utf-8").strip().splitlines()[0] if no_rebuild.stat().st_size else "locked"
        print(f"  {chapter_dir.name}: SKIPPED (.no-rebuild present — {reason})")
        return

    partials = sorted(p for p in slides_dir.glob("*.html"))
    if not partials:
        raise SystemExit(f"no slide partials in {slides_dir}")

    html = index_path.read_text(encoding="utf-8")
    begin = html.find(BEGIN)
    end = html.find(END)
    if begin == -1 or end == -1 or end < begin:
        raise SystemExit(
            f"{index_path}: could not find '{BEGIN}' / '{END}' markers"
        )

    body_parts = [p.read_text(encoding="utf-8").rstrip() + "\n" for p in partials]
    body = "\n".join(body_parts)

    head = html[: begin + len(BEGIN)]
    tail = html[end:]
    new_html = f"{head}\n{body}\n{tail}"

    if new_html != html:
        index_path.write_text(new_html, encoding="utf-8")
        action = "rebuilt"
    else:
        action = "unchanged"
    print(f"  {chapter_dir.name}: {len(partials)} slides → index.html ({action})")


def main(argv: list[str]) -> int:
    if argv:
        chapters = [REPO_ROOT / name for name in argv]
    else:
        chapters = sorted(p for p in REPO_ROOT.glob("ch*") if p.is_dir())

    for ch in chapters:
        build_chapter(ch)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
