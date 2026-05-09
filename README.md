# SCHULICH-FINE-TLAU

FINE 6280: Fintech — Digital Transformation of Financial Services

Schulich School of Business, York University

## Chapters

- [Chapter 1: Introduction to Fintech](ch1/)
- [Chapter 2: Theories & Business Models](ch2/)
- [Chapter 3: Funding Fintech Start-Ups](ch3/)
- [Chapter 4: Valuation of Fintech Companies](ch4/)

## Production

- [HyperFrames integration map](HYPERFRAMES.md) — slide → block / API
  mapping for `data-chart`, `flowchart`, `apple-money-count`, the
  `html-in-canvas` VFX catalog, and GSAP timeline migration plan.
- `scripts/build.py` — concatenates `chN/slides/*.html` into
  `chN/index.html` between the `<!-- BEGIN SLIDES -->` /
  `<!-- END SLIDES -->` markers.
- The deck is designed for 16:9 (1920×1080 / 1280×720). Layout
  uses `vh`-based sizing throughout.
