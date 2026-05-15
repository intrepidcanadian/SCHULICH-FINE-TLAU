#!/usr/bin/env python3
"""One-time restructure: split ch3 and ch4 speaker-notes.html into main + appendix.

Parses each file into (header, [slide_blocks], footer). Each slide_block starts
with `<!-- SLIDE NN -->` and runs to the next SLIDE marker or to the footer.

For each chapter:
- Main file keeps slides 01..main_keep_low + the OLD closing slide renumbered to
  the new main total.
- Appendix file gets the appendix-range slides renumbered 01..N.

Within each block we rewrite slide-number text in a few well-known patterns:
  <!-- SLIDE NN -->                    -> <!-- SLIDE MM -->
  Slide NN &mdash; Title                -> Slide MM &mdash; Title (title kept verbatim)
  Slide NN <other>                      -> Slide MM <other>
  >Slide NN<                            -> >Slide MM<       (e.g. <span ...>Slide NN</span>)
Body content (cross-references like "see Slide 13 for ...") is left untouched
intentionally -- the cross-references describe semantic relationships and the
exact slide number is less important than the topic mention.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

SLIDE_MARKER = re.compile(r"<!--\s*SLIDE\s+(\d+)\s*-->", re.IGNORECASE)


def parse_file(text: str) -> tuple[str, list[tuple[int, str]], str]:
    """Return (header, [(orig_nn, block_html), ...], footer).
    header includes everything up to the first `<!-- SLIDE NN -->`.
    Each block runs from its SLIDE marker to (but not including) the next.
    footer is everything from the last block's close `</div>` to end of file.
    """
    matches = list(SLIDE_MARKER.finditer(text))
    if not matches:
        raise SystemExit("no SLIDE markers found")

    header = text[: matches[0].start()]
    blocks: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else None
        if end is None:
            # Footer starts after the last slide-block's closing </div>.
            tail_text = text[start:]
            # Find the LAST `</div>\n\n` followed by either total-time div or </body>.
            # Heuristic: the last </div> that precedes either <div class="total-time"
            # or </body> is the boundary. Use rfind for </div>.
            # Look for end markers
            for marker in ['<div class="total-time"', "</body>"]:
                idx = tail_text.find(marker)
                if idx != -1:
                    # back up to the last </div> before that marker
                    close = tail_text.rfind("</div>", 0, idx)
                    if close != -1:
                        close_end = close + len("</div>")
                        blocks.append((int(m.group(1)), tail_text[:close_end] + "\n"))
                        footer = tail_text[close_end:]
                        return header, blocks, footer
            # fallback: whole tail is the last block
            blocks.append((int(m.group(1)), tail_text))
            return header, blocks, ""
        blocks.append((int(m.group(1)), text[start:end]))
    return header, blocks, ""


def renumber_block(block: str, old_nn: int, new_nn: int) -> str:
    """Rewrite slide-number occurrences inside one speaker-notes block.
    Touches only well-known patterns; body text is left alone.
    """
    new_nn_s = f"{new_nn:02d}"

    # 1) The <!-- SLIDE NN --> marker comment
    block = re.sub(
        rf"(<!--\s*SLIDE\s+)0*{old_nn}(\s*-->)",
        rf"\g<1>{new_nn_s}\g<2>",
        block,
        count=1,
        flags=re.IGNORECASE,
    )

    # 2) "Slide NN &mdash; ..." inside .slide-title span (ch3 style)
    block = re.sub(
        rf"(Slide\s+)0*{old_nn}(\s*&mdash;)",
        rf"\g<1>{new_nn_s}\g<2>",
        block,
    )

    # 3) ">Slide NN<" inside .slide-number span (ch4 style)
    block = re.sub(
        rf"(>Slide\s+)0*{old_nn}(<)",
        rf"\g<1>{new_nn_s}\g<2>",
        block,
    )

    return block


def rewrite_chapter_intro(header: str, new_total: int, is_appendix: bool, chapter: str) -> str:
    """Update header text to reflect the new slide count.
    Best-effort: replaces specific known phrases the source files use today.
    """
    if is_appendix:
        appendix_title_map = {
            "ch3": "Chapter 3 Appendix &mdash; Funding &amp; IPO Window 2024&ndash;2026 &mdash; Speaker Notes",
            "ch4": "Chapter 4 Appendix &mdash; Valuation Reset 2024&ndash;2026 &mdash; Speaker Notes",
        }
        appendix_subtitle_map = {
            "ch3": "FINE 6280 &middot; Fintech &middot; Schulich School of Business &middot; Lecture 03 Appendix &middot; Reference only",
            "ch4": "FINE 6280 &middot; Fintech &middot; Schulich School of Business &middot; Lecture 04 Appendix &middot; Reference only",
        }
        # Replace <h1> contents
        header = re.sub(r"<h1>[^<]*</h1>", f"<h1>{appendix_title_map[chapter]}</h1>", header, count=1)
        # Replace .subtitle paragraph
        header = re.sub(
            r"<p class=\"subtitle\">[\s\S]*?</p>",
            f"<p class=\"subtitle\">{appendix_subtitle_map[chapter]}</p>",
            header,
            count=1,
        )
        # Replace .total-time div (ch3 has one in header; ch4 doesn't)
        header = re.sub(
            r"<div class=\"total-time\">[\s\S]*?</div>",
            f"<div class=\"total-time\">Appendix &middot; {new_total} reference slides covering 2024&ndash;2026 data updates. Not part of the core lecture.</div>",
            header,
            count=1,
        )
        # Page <title>
        header = re.sub(
            r"<title>[^<]*</title>",
            f"<title>{chapter.upper()} Appendix &mdash; 2024-2026 Data Updates &mdash; Speaker Notes</title>",
            header,
            count=1,
        )
    else:
        # Main file: update the total-time div / subtitle to reflect new slide count
        # ch3 .total-time line:
        header = re.sub(
            r"Total estimated lecture time: ~\d+ minutes \(\d+ slides\)[^<]*",
            f"Total estimated lecture time: ~45 minutes ({new_total} slides) &middot; Core textbook material. 2024&ndash;2026 data updates live in the appendix at /{chapter}/appendix/.",
            header,
            count=1,
        )
        # ch4 subtitle "Target duration: ~75 minutes - 23 slides"
        header = re.sub(
            r"Target duration: ~\d+ minutes &middot; \d+ slides",
            f"Target duration: ~50 minutes &middot; {new_total} slides (core textbook material). 2024&ndash;2026 updates live in the appendix at /{chapter}/appendix/.",
            header,
            count=1,
        )
    return header


def split_chapter(
    chapter: str,
    main_keep_low: int,
    appendix_range: range,
    closing_old: int,
    closing_new: int,
    new_main_total: int,
    appendix_total: int,
) -> None:
    src = REPO_ROOT / chapter / "speaker-notes.html"
    main_out = src  # overwrite in place
    appendix_dir = REPO_ROOT / chapter / "appendix"
    appendix_dir.mkdir(parents=True, exist_ok=True)
    appendix_out = appendix_dir / "speaker-notes.html"

    text = src.read_text(encoding="utf-8")
    header, blocks, footer = parse_file(text)

    # Index blocks by their original slide number for easy lookup.
    by_nn = {nn: blk for nn, blk in blocks}

    # 1) MAIN file = slides 01..main_keep_low + (old closing renumbered to closing_new)
    main_blocks: list[str] = []
    for n in range(1, main_keep_low + 1):
        if n not in by_nn:
            print(f"  WARN: {chapter} main missing slide {n}")
            continue
        main_blocks.append(renumber_block(by_nn[n], n, n))
    if closing_old in by_nn:
        main_blocks.append(renumber_block(by_nn[closing_old], closing_old, closing_new))
    else:
        print(f"  WARN: {chapter} no closing slide {closing_old}")

    main_header = rewrite_chapter_intro(header, new_main_total, is_appendix=False, chapter=chapter)
    main_text = main_header + "".join(main_blocks) + footer
    main_out.write_text(main_text, encoding="utf-8")
    print(f"  {chapter}/speaker-notes.html: {len(main_blocks)} slides (was {len(blocks)})")

    # 2) APPENDIX file = appendix_range renumbered 01..N
    appendix_blocks: list[str] = []
    for idx, old_nn in enumerate(appendix_range, start=1):
        if old_nn not in by_nn:
            print(f"  WARN: {chapter} appendix missing source slide {old_nn}")
            continue
        appendix_blocks.append(renumber_block(by_nn[old_nn], old_nn, idx))

    appendix_header = rewrite_chapter_intro(header, appendix_total, is_appendix=True, chapter=chapter)
    appendix_text = appendix_header + "".join(appendix_blocks) + footer
    appendix_out.write_text(appendix_text, encoding="utf-8")
    print(f"  {chapter}/appendix/speaker-notes.html: {len(appendix_blocks)} slides (new)")


def main() -> int:
    print("Splitting ch3/speaker-notes.html (22 -> 11 main + 11 appendix):")
    split_chapter(
        chapter="ch3",
        main_keep_low=10,
        appendix_range=range(11, 22),  # 11..21
        closing_old=22,
        closing_new=11,
        new_main_total=11,
        appendix_total=11,
    )

    print("Splitting ch4/speaker-notes.html (23 -> 12 main + 11 appendix):")
    split_chapter(
        chapter="ch4",
        main_keep_low=11,
        appendix_range=range(12, 23),  # 12..22
        closing_old=23,
        closing_new=12,
        new_main_total=12,
        appendix_total=11,
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())
