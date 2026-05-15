# scripts/

Build tooling for the chapter decks.

## Source layout

Each chapter directory looks like this:

```
ch1/
  slides/
    01-title.html
    02-what-is-fintech.html
    ...
    23-financial-inclusion-closing.html
  deck.css
  index.html        # generated; do not edit between BEGIN/END SLIDES markers
```

`slides/*.html` is the **source of truth**. Each file is a standalone fragment
containing one `<section class="slide ...">` block (plus a leading HTML comment
documenting it). Edit those, not `index.html`.

`shared/deck.js` is loaded by every chapter and handles WebGL backgrounds,
navigation, and the ESC overview.

## Workflow

Edit a slide:

```
$EDITOR ch1/slides/02-what-is-fintech.html
python3 scripts/build.py ch1     # rebuild only ch1
```

Or rebuild everything:

```
python3 scripts/build.py
```

Add a new slide: drop a new file into `ch1/slides/` named so it sorts into
the right position (`NN-slug.html`), then rebuild. The deck JS computes its
width from the slide count, so no JS or CSS changes are needed.

Renumber slides: rename the files. Filename order = slide order.

## Scripts

- `build.py` — concatenates `chN/slides/*.html` into `chN/index.html` between
  the `<!-- BEGIN SLIDES -->` / `<!-- END SLIDES -->` markers. Idempotent;
  prints "unchanged" when there's nothing to do. Pass chapter names as args
  to scope it.

  **`.no-rebuild` guard**: if a chapter directory contains a `.no-rebuild`
  file, `build.py` skips that chapter and prints the first line of the file
  as the skip reason. `ch1/` and `ch2/` ship with this marker because their
  `index.html` is curated to a 12-slide / 15-slide locked-appendix split
  (with the remaining partials surfaced via `chN/appendix/index.html`).
  Without the guard, `build.py` would re-inflate them to the full 24 / 26
  partial set, undoing the split. See `HYPERFRAMES.md` for the rationale.
- `split.py` — one-time bootstrap. Reads each chapter's `index.html`, peels
  out every slide into `slides/NN-slug.html`, and replaces the slide region
  with the build markers. Already run once during the migration; you should
  not need it again.
