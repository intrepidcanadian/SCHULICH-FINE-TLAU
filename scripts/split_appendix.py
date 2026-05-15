#!/usr/bin/env python3
"""One-time restructure: move ch3/ch4 fourth-wave slides into appendix folders.

For ch3: slides 11-21 (11 files) move to ch3/appendix/slides/ as 01-11,
slide 22 (closing) renames to ch3/slides/11-closing.html, slides 01-10
stay in place. Main deck total goes 22 -> 11; appendix deck = 11.

For ch4: slides 12-22 (11 files) move to ch4/appendix/slides/ as 01-11,
slide 23 (closing) renames to ch4/slides/12-closing.html, slides 01-11
stay in place. Main deck total goes 23 -> 12; appendix deck = 11.

For each moved or renamed partial, rewrite three chrome locations to
match the new (NN, total) pair: the data-screen-label number prefix,
the "NN / total" counter in <div class="chrome">, and the "Page NN"
foot label. CSS selectors of the form
    .slide[data-screen-label="NN ..."]
are rewritten to track the new NN. Content text is left alone.
"""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def renumber_partial(content: str, old_nn: int, new_nn: int, new_total: int) -> str:
    """Renumber slide chrome inside one HTML partial.

    Only touches:
      - data-screen-label="NN <label>"   (HTML attr + CSS selector forms)
      - <div>NN / OLD_TOTAL</div>         (chrome counter, exact line)
      - Page NN                            (foot label)
    """
    old_nn_s = f"{old_nn:02d}"
    new_nn_s = f"{new_nn:02d}"

    # 1) data-screen-label attribute and CSS selector forms
    #    Matches: data-screen-label="NN <anything>"
    #    and the escaped CSS form: data-screen-label=\"NN <anything>\"
    content = re.sub(
        rf'(data-screen-label=\\?")0*{old_nn}(\s)',
        rf'\g<1>{new_nn_s}\g<2>',
        content,
    )

    # 2) Chrome counter: <div>NN / OLD_TOTAL</div>
    content = re.sub(
        rf'(<div>)\s*0*{old_nn}\s*/\s*\d+\s*(</div>)',
        rf'\g<1>{new_nn_s} / {new_total}\g<2>',
        content,
        count=1,
    )

    # 3) Foot label: "Page NN"
    content = re.sub(
        rf'(Page\s+)0*{old_nn}(?=\b|&middot;|\s|<)',
        rf'\g<1>{new_nn_s}',
        content,
    )

    return content


def restructure_chapter(
    chapter: str,
    main_keep_low: int,      # last main slide # to keep at the top (inclusive)
    appendix_range: range,   # range of source numbers to move into appendix
    closing_old: int,        # current closing slide number (e.g. 22, 23)
    closing_new: int,        # target closing slide number after move
    new_main_total: int,     # final main-deck slide count
    appendix_total: int,     # final appendix-deck slide count
) -> None:
    src = REPO_ROOT / chapter / "slides"
    appendix_dir = REPO_ROOT / chapter / "appendix" / "slides"
    appendix_dir.mkdir(parents=True, exist_ok=True)

    # 1. Update chrome on main-deck partials 01..main_keep_low (only the total changes)
    for n in range(1, main_keep_low + 1):
        matches = list(src.glob(f"{n:02d}-*.html"))
        if not matches:
            print(f"  WARN: ch{chapter} main slot {n:02d}: no file found")
            continue
        path = matches[0]
        text = path.read_text(encoding="utf-8")
        new_text = renumber_partial(text, n, n, new_main_total)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            print(f"  {chapter}/slides/{path.name}: chrome total -> /{new_main_total}")

    # 2. Move appendix-range slides to appendix/ with new numbering 01..N
    for idx, old_nn in enumerate(appendix_range, start=1):
        matches = list(src.glob(f"{old_nn:02d}-*.html"))
        if not matches:
            print(f"  ERR: ch{chapter} no file for source slot {old_nn:02d}")
            sys.exit(1)
        old_path = matches[0]
        slug = old_path.name.split("-", 1)[1]
        new_name = f"{idx:02d}-{slug}"
        new_path = appendix_dir / new_name
        text = old_path.read_text(encoding="utf-8")
        new_text = renumber_partial(text, old_nn, idx, appendix_total)
        new_path.write_text(new_text, encoding="utf-8")
        old_path.unlink()
        print(f"  {chapter}/slides/{old_path.name} -> {chapter}/appendix/slides/{new_name}")

    # 3. Rename closing slide and renumber it
    closing_matches = list(src.glob(f"{closing_old:02d}-*.html"))
    if not closing_matches:
        print(f"  ERR: ch{chapter} no closing slide at {closing_old:02d}")
        sys.exit(1)
    closing_path = closing_matches[0]
    closing_slug = closing_path.name.split("-", 1)[1]
    new_closing = src / f"{closing_new:02d}-{closing_slug}"
    text = closing_path.read_text(encoding="utf-8")
    new_text = renumber_partial(text, closing_old, closing_new, new_main_total)
    new_closing.write_text(new_text, encoding="utf-8")
    closing_path.unlink()
    print(f"  {chapter}/slides/{closing_path.name} -> {chapter}/slides/{new_closing.name}")


def main() -> int:
    # CH 3: 22 source slides. Main keeps 01-10 + new closing (11). Appendix gets 11-21 -> 01-11.
    print("Restructuring ch3 (main 22 -> 11, appendix 0 -> 11):")
    restructure_chapter(
        chapter="ch3",
        main_keep_low=10,
        appendix_range=range(11, 22),  # 11..21
        closing_old=22,
        closing_new=11,
        new_main_total=11,
        appendix_total=11,
    )

    # CH 4: 23 source slides. Main keeps 01-11 + new closing (12). Appendix gets 12-22 -> 01-11.
    print("Restructuring ch4 (main 23 -> 12, appendix 0 -> 11):")
    restructure_chapter(
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
