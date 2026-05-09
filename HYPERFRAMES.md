# HyperFrames Integration Map

This document maps the existing FINE 6280 lecture slides to candidate
HyperFrames blocks, examples, and APIs that could be used to render
short cinematic clips inside (or alongside) each chapter.

The slides are static HTML decks driven by `deck.js`. Today they use
hand-written CSS keyframes for the fourth-wave "data view" cards (e.g.
`ch1/slides/12-the-2024-2026-wave.html`, `ch1/slides/20-spot-crypto-etfs-2024-2026.html`).
HyperFrames offers richer, deterministic, render-safe animation
primitives we can drop in either as inline embeds (HTML-in-Canvas),
as ready-to-use catalog blocks, or as full 1080p video files
authored once and embedded in the slide.

Reference: `../hyperframeshtmlcanvas.md`

---

## Setup commands (one-time)

```bash
# Scaffold a new HyperFrames project for chapter clips
npx hyperframes init schulich-clips --example nyt-graph

# Install the html-in-canvas catalog (vfx-* blocks + tooling)
npx hyperframes add html-in-canvas

# Specific blocks worth pre-installing for this deck:
npx hyperframes add data-chart        # animated bar/line chart
npx hyperframes add flowchart         # animated decision tree
npx hyperframes add apple-money-count # finance counter (capital figures)
npx hyperframes add logo-outro        # closing card
npx hyperframes add grain-overlay     # warm-grain texture
npx hyperframes add shimmer-sweep     # text highlight reveal

# Install the AI coding skills so Claude can author compositions
npx hyperframes skills
```

Examples to scaffold from when picking a tone:

| Example         | Tone / use case                                                    |
| --------------- | ------------------------------------------------------------------ |
| `warm-grain`    | Documentary / archival — pairs with Fintech 1.0/2.0 history slides |
| `play-mode`     | Energetic kinetic intro — chapter title cards                      |
| `swiss-grid`    | Editorial typographic grid — paradigms, taxonomies, eight-categories |
| `kinetic-type`  | Big-statement number reveals — $1.2T, $200B, $853B                 |
| `decision-tree` | Branching logic — VC method, valuation flow, capital structure     |
| `product-promo` | Product showcase — Stripe, Wealthsimple, Nubank, Plaid arcs        |
| `nyt-graph`     | Newspaper-style charts — capital rebound, multiples reset          |
| `vignelli`      | Modernist editorial — closing cards, financial inclusion           |

---

## Slide → block mapping

### Chapter 1 · Fintech Defined

| Slide                                              | Block / API                                         | Why                                                                            |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| 01 Title                                           | `vfx-text-cursor` (html-in-canvas)                  | Cinematic deck-open. Renders the slide's `<h1>` with chromatic shadow rays.    |
| 03 Growth $1.2T / 38K                              | `apple-money-count`                                 | Counts $0 → $1,200,000,000,000. Pairs with Fig. 1.1.                           |
| 04 Three Eras pipeline                             | `flowchart` block                                   | 1858 → 1967 → 2006 timeline as animated decision tree.                         |
| 12 The 2024–2026 Wave                              | `data-chart` (replace hand-written keyframes)       | Bar chart with staggered reveal for $85B / $2.8B / $853B figures.              |
| 14 2025 Capital Rebound                            | `data-chart` (line + bar)                           | Drop-in replacement for the bespoke scrub bar.                                 |
| 15 Global Fintech Hubs 2020→2025                   | `nyc-paris-flight` style map block (forked)         | World map ranking deltas as kinetic map annotations.                           |
| 17 Bank GenAI 2023→2025                            | `data-chart`                                        | JPMorgan / MS / Citi adoption bars.                                            |
| 20 Spot Crypto ETFs 2024–2026                      | `data-chart` + `shimmer-sweep` on the AUM number   | Inflow streak with shimmer highlight on $200B.                                 |
| 24 Financial Inclusion (closing)                   | `logo-outro` + `grain-overlay`                      | Warm closing card with course mark.                                            |

### Chapter 2 · Theories & Business Models

| Slide                                              | Block / API                                         | Why                                                                            |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| 03 Five Dimensions (Fig 2.1)                       | `flowchart`                                         | Five-node radial diagram around "Financial intermediation".                    |
| 05 Disruptive Innovation                           | `data-chart` (line cross-over)                      | Performance-vs-time trajectories, Christensen 1997.                            |
| 06 Pisano Innovation Landscape                     | `flowchart` quadrant                                | 2×2 with animated quadrant labels.                                             |
| 09 Monetization (Tab 2.1)                          | `data-chart`                                        | Stacked bars: agency vs. principal revenue mix.                                |
| 14 Network Effects MSP 2025–26                     | `data-chart`                                        | Replace hand-rolled scrub timeline.                                            |
| 19 Robo-Advisor 2.0 AI Wealth                      | `data-chart` + `shimmer-sweep` on AUM               | Wealthfront $90B reveal.                                                       |
| 20 Embedded Finance YoY 2024–26                    | `data-chart`                                        | YoY growth bars with timeline scrub.                                           |
| 21 Closing                                         | `logo-outro`                                        | Course closing card.                                                           |

### Chapter 3 · Funding Fintech Start-Ups

| Slide                                              | Block / API                                         | Why                                                                            |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| 02 Growth Stages (Fig 3.1)                         | `flowchart` linear pipeline                         | Pre-seed → seed → A → B → C → IPO with stage payouts.                          |
| 03 Valley of Death                                 | `data-chart` (cash-flow curve)                      | Animated J-curve over time.                                                    |
| 09 Cap Table                                       | `data-chart` (stacked bar)                          | Shareholder pie/bar at each round.                                             |
| 10 Cap Table dilution                              | `apple-money-count` style ownership counter         | Founder share counts down 100% → 16% across rounds.                            |
| 11 Funding Climate 2024–2026                       | `data-chart`                                        | Replace hand-rolled timeline.                                                  |
| 13 2025 IPO Resurgence                             | `data-chart` + `shimmer-sweep`                      | Reddit, Klaviyo, Instacart, Astera arcs.                                       |
| 15 Wealthsimple Arc 2014→2025                      | `data-chart` (multi-axis)                           | AUM and valuation overlay.                                                     |
| 16 Stripe Valuation Arc 2014→2025                  | `apple-money-count`                                 | $1.75B → $95B → $70B → $91.5B.                                                 |
| 20 Plaid Down-Round to IPO 2021–2026               | `data-chart`                                        | $13.4B → $6.1B → $8–10B target IPO.                                            |
| 21 Class of 2025 IPOs Q1 2026                      | `data-chart`                                        | Day-1 pop / current price grid.                                                |
| 22 Closing                                         | `logo-outro`                                        |                                                                                |

### Chapter 4 · Valuation of Fintech Companies

| Slide                                              | Block / API                                         | Why                                                                            |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| 03 Four Steps (Fig 4.1)                            | `flowchart`                                         | Identify → Forecast → Discount → Divide pipeline.                              |
| 06 VC Valuation Method                             | `decision-tree` example                             | Backward-from-IRR walkthrough.                                                 |
| 08 DCF Model                                       | `data-chart` (waterfall)                            | FCFF formula → PV waterfall.                                                   |
| 11 Fintech Multiples comparison                    | `data-chart`                                        | EV/Sales, EV/EBITDA bars across firms.                                         |
| 14 Fintech Multiples Reset 2025                    | `data-chart`                                        | 2021 vs 2025 bar pairs.                                                        |
| 15 Multiples APR 2023–Q4 2025                      | `data-chart`                                        | Time-series with median band.                                                  |
| 16 AI-Native Premium 2025–26                       | `shimmer-sweep` on premium label                    | "AI-native" highlight reveal.                                                  |
| 17 Public Fintech Reset by Category                | `data-chart`                                        | Sub-sector grid.                                                               |
| 18 BTC Corporate Treasury 2020–2026                | `apple-money-count`                                 | MicroStrategy $X holdings counter.                                             |
| 19 Circle IPO 2025                                 | `data-chart` + `shimmer-sweep`                      | Circle arc + day-1 pop.                                                        |
| 20 Bank vs Neobank Multiples                       | `data-chart`                                        | Twin-bar comparison.                                                           |
| 21 Public Fintech Profitability Inflection Q1 2026 | `data-chart`                                        | SoFi $167M / +134% YoY, Robinhood $346M, R40=72%.                              |
| 22 Q1 2026 Multiples by Sub-Sector                 | `data-chart`                                        | Sector-by-sector multiples grid.                                               |
| 23 Closing                                         | `logo-outro`                                        |                                                                                |

---

## HTML-in-Canvas — when it's the right tool

`drawElementImage` (Chrome flag `chrome://flags/#canvas-draw-element`) lets
HyperFrames capture live HTML into a WebGL texture at 60 fps. The
catalog blocks that exploit this:

- **`vfx-text-cursor`** — chapter title-card opens
- **`vfx-portal`** — transitions into the "data view" hyperframe slides
- **`vfx-shatter`** — closing slides ("Old paradigm shatters")
- **`vfx-iphone-device`** — Wealthsimple / Robinhood / Klarna mobile-app showcases
- **`vfx-liquid-glass`** — overlay on the Pisano landscape quadrant reveal

Install them all:

```bash
npx hyperframes add html-in-canvas
```

The slides themselves keep working without the flag; the html-in-canvas
clips are produced separately as MP4s and dropped in as `<video>`
elements where appropriate.

---

## GSAP — replacing hand-coded keyframes

The fourth-wave "data view" slides (e.g. `ch1/slides/12-the-2024-2026-wave.html`,
`ch1/slides/20-spot-crypto-etfs-2024-2026.html`) currently use raw
CSS `@keyframes` with `animation-delay` chains. GSAP timelines give us:

- Deterministic seek (works inside HyperFrames render)
- Easier sequencing with labels (`tl.to('.hf-card', { ... }, 'reveal+=0.2')`)
- Stagger primitives (`stagger: { each: .15, from: 'start' }`)
- `quickTo` for cursor-following hover effects

Skill reference: `gsap` (already in `~/.claude/skills/gsap`).

Migration sketch for ch1/slide 12:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
<script>
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hf-card', { opacity: 0, y: 14, duration: 0.8, stagger: 0.2 })
    .from('.hf-bar',  { width: 0,                 duration: 1.4 }, '+=0.2')
    .to  ('.hf-live', { opacity: 0.4, duration: 0.8, repeat: -1, yoyo: true }, 0);
</script>
```

This timeline is seekable by HyperFrames during render, unlike CSS
keyframes which fire on `animation-delay` only.

---

## Recommended next steps (for a future PR)

1. Run `npx hyperframes init schulich-clips --example nyt-graph` in a
   sibling folder; produce ten `data-chart` clips for the highest-value
   slides (Ch1/12, Ch1/14, Ch3/16, Ch4/15, etc.).
2. Embed those clips as `<video autoplay muted loop>` inside the
   existing slide, behind the textual overlay.
3. Migrate the 8 fourth-wave hyperframe slides from CSS keyframes to a
   shared GSAP timeline registered on `window.__hfAnime` (the pattern
   the `animejs` adapter skill documents).
4. Add a `vfx-text-cursor` clip behind each chapter title slide.
5. Render an `ultrareview` ship checklist before the next lecture.
