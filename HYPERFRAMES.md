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

References:
- HTML-in-Canvas API spec: `../hyperframeshtmlcanvas.md`
- Live composition (working proof): `hf/01-title/index.html`
- Live composition (data-view + GSAP): `hf/12-fourth-wave/index.html`

---

## Setup commands (one-time)

```bash
# Install the heygen-com/hyperframes skill bundle (Claude authoring
# patterns: gsap, animejs, css-animations, hyperframes-cli, …)
npx skills add heygen-com/hyperframes

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

Examples to scaffold from when picking a tone (each is a `--example`
arg to `npx hyperframes init my-video --example <name>`):

| Example         | Tone / use case                                                    | Init command                                                  |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `warm-grain`    | Documentary / archival — pairs with Fintech 1.0/2.0 history slides | `npx hyperframes init schulich-history --example warm-grain`  |
| `play-mode`     | Energetic kinetic intro — chapter title cards                      | `npx hyperframes init schulich-titles --example play-mode`    |
| `swiss-grid`    | Editorial typographic grid — paradigms, taxonomies, 8 categories   | `npx hyperframes init schulich-grids --example swiss-grid`    |
| `kinetic-type`  | Big-statement number reveals — $1.2T, $200B, $853B                 | `npx hyperframes init schulich-numbers --example kinetic-type`|
| `decision-tree` | Branching logic — VC method, valuation flow, capital structure     | `npx hyperframes init schulich-trees --example decision-tree` |
| `product-promo` | Product showcase — Stripe, Wealthsimple, Nubank, Plaid arcs        | `npx hyperframes init schulich-promo --example product-promo` |
| `nyt-graph`     | Newspaper-style charts — capital rebound, multiples reset          | `npx hyperframes init schulich-charts --example nyt-graph`    |
| `vignelli`      | Modernist editorial — closing cards, financial inclusion           | `npx hyperframes init schulich-vignelli --example vignelli`   |

Pick `nyt-graph` for the bulk of the data-view fourth-wave slides
(chapters 1/12, 1/14, 1/17, 2/19, 3/15, 3/16, 4/15, 4/22 etc.) and
fall back to `kinetic-type` only for the headline reveal slides
($1.2T cumulative, $200B AUM, $853B FedNow, $159B Stripe).

---

## Slide → block mapping

### Chapter 1 · Fintech Defined

| Slide                                              | Block / API                                         | Why                                                                            |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| 01 Title                                           | `vfx-text-cursor` (html-in-canvas)                  | Cinematic deck-open. Renders the slide's `<h1>` with chromatic shadow rays.    |
| 03 Growth $1.2T / 38K                              | `apple-money-count`                                 | Counts $0 → $1,200,000,000,000. Pairs with Fig. 1.1.                           |
| 04 Three Eras pipeline                             | `flowchart` block                                   | 1858 → 1967 → 2006 timeline as animated decision tree.                         |
| 12 The 2024–2026 Wave                              | `data-chart` (replace hand-written keyframes)       | Bar chart with staggered reveal for $85B / $2.8B / $853B figures.              |
| 13 Stablecoin & RWA Reset 2025–26                  | `data-chart` + `shimmer-sweep`                      | $27T stablecoin volume / $24B RWA / 350+ agentic pilots / 134 CBDCs grid.      |
| 14 2025 Capital Rebound                            | `data-chart` (line + bar)                           | Drop-in replacement for the bespoke scrub bar.                                 |
| 15 Global Fintech Hubs 2020→2025                   | `nyc-paris-flight` style map block (forked)         | World map ranking deltas as kinetic map annotations.                           |
| 16 Stablecoin Reg Inflection 2024–26               | `flowchart`                                         | EU MiCA → US GENIUS → HK/SG sandbox timeline as a regulatory decision tree.    |
| 17 Bank GenAI 2023→2025                            | `data-chart`                                        | JPMorgan / MS / Citi adoption bars.                                            |
| 18 BNPL 2020–2025 Evolution                        | `data-chart` + `vfx-iphone-device` (Klarna app)     | Klarna AI hybrid, Affirm GAAP-profitable arc; phone overlay for product shot.  |
| 19 Real-Time Rails 2023–2026                       | `data-chart` (multi-bar)                            | FedNow / UPI / Pix / FPS volumes with staggered reveal.                        |
| 20 Spot Crypto ETFs 2024–2026                      | `data-chart` + `shimmer-sweep` on the AUM number    | Inflow streak with shimmer highlight on $200B.                                 |
| 21 Cross-Border B2B Stablecoins 2023–2026          | `data-chart` (4-card stat reveal + comparison rows) | $400B / $6B-mo / $4.6B Visa / 57% Wise — staggered card reveal + table fade.   |
| 22 GENIUS Era Stablecoin Market 2025–26            | `data-chart` (4-card + comparison rows)             | $280B supply / USDT $187B / USDC $77B / $6.6T deposit relief.                  |
| 23 Live Poll · Revolution vs Evolution             | `vfx-portal` transition + `flowchart`               | In-class vote integration.                                                     |
| 24 Financial Inclusion (closing)                   | `logo-outro` + `grain-overlay`                      | Warm closing card with course mark.                                            |

### Chapter 2 · Theories & Business Models

| Slide                                              | Block / API                                         | Why                                                                            |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| 03 Five Dimensions (Fig 2.1)                       | `flowchart`                                         | Five-node radial diagram around "Financial intermediation".                    |
| 05 Disruptive Innovation                           | `data-chart` (line cross-over)                      | Performance-vs-time trajectories, Christensen 1997.                            |
| 06 Pisano Innovation Landscape                     | `flowchart` quadrant + `vfx-liquid-glass`           | 2×2 with animated quadrant labels and overlay reveal.                          |
| 09 Monetization (Tab 2.1)                          | `data-chart`                                        | Stacked bars: agency vs. principal revenue mix.                                |
| 10 AI Agents 2024–26                               | `data-chart`                                        | Klarna AI ROI / Stripe Agents volume / Visa Intelligent Commerce launch.       |
| 11 Agentic Commerce 2025–26                        | `flowchart` (agent → checkout)                      | Stripe Agents + Visa Intelligent Commerce + 47% adoption.                      |
| 12 Embedded Finance 2025                           | `data-chart` (TPV bars)                             | Stripe $1.4T / Bain $148B market.                                              |
| 13 2-puzzle 2015–2025                              | `data-chart` (line trajectories)                    | Marketplace evolution comparison.                                              |
| 14 Network Effects MSP 2025–26                     | `data-chart`                                        | Replace hand-rolled scrub timeline.                                            |
| 15 Broker Revenue Mix 2021–2025                    | `data-chart` (stacked bar)                          | Robinhood NII shift, SoFi deposits, Nubank.                                    |
| 16 P2P Payments Evolution 2020–2025                | `data-chart`                                        | Zelle / Venmo / Cash App volumes.                                              |
| 17 Open Banking Rule 1033 2024–26                  | `flowchart`                                         | CFPB rule timeline.                                                            |
| 18 Klarna AI Hybrid 2023–26                        | `data-chart` + `vfx-iphone-device`                  | Cost-per-transaction reduction; phone overlay for product.                     |
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
| 14 YC Fintech 2014–2025                            | `data-chart`                                        | 5,000+ alumni, $600B aggregate value.                                          |
| 15 Wealthsimple Arc 2014→2025                      | `data-chart` (multi-axis) + `vfx-iphone-device`     | AUM and valuation overlay; iPhone shows app.                                   |
| 16 Stripe Valuation Arc 2014→2025                  | `apple-money-count`                                 | $1.75B → $95B → $70B → $91.5B.                                                 |
| 17 AI-Native Fintech Funding 2023–25               | `data-chart`                                        | $ raised by AI-native fintechs vs. wider market.                               |
| 18 Nubank Arc 2014→2025                            | `data-chart` (multi-axis)                           | Customer count + revenue arc; 114M customers.                                  |
| 19 Secondary Tender Markets 2024–26                | `data-chart`                                        | Stripe / SpaceX-style tender pricing arcs.                                     |
| 20 Plaid Down-Round to IPO 2021–2026               | `data-chart`                                        | $13.4B → $6.1B → $8–10B target IPO.                                            |
| 21 Class of 2025 IPOs Q1 2026                      | `data-chart` (4-card stat + comparison rows)        | Chime / Klarna / Circle / eToro debut + Q1 2026 follow-through.                |
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

## HTML-in-Canvas — install + usage

Per `../hyperframeshtmlcanvas.md`, the `drawElementImage` API lets a
`<canvas layoutsubtree>` capture live DOM into a WebGL texture at
60fps. To install all blocks that exploit it:

```bash
npx hyperframes add html-in-canvas
```

Individual blocks (each is its own `npx hyperframes add <name>`):

| Block               | Slide candidates                                            |
| ------------------- | ----------------------------------------------------------- |
| `vfx-text-cursor`   | All chapter title cards (ch1/01, ch2/01, ch3/01, ch4/01)    |
| `vfx-iphone-device` | Ch1/18 BNPL Klarna, Ch2/19 Wealthfront app, Ch3/15 Wealthsimple arc  |
| `vfx-liquid-glass`  | Ch2/06 Pisano landscape quadrant reveal                     |
| `vfx-portal`        | Transitions into ch1/12, ch1/14 data-view boxes             |
| `vfx-shatter`       | Ch1/05 "Old paradigm shatters", ch2/21 closing              |
| `vfx-magnetic`      | Ch1/24 Financial inclusion field                            |

The Chrome flag `chrome://flags/#canvas-draw-element` must be enabled
for live preview; the `npx hyperframes render` command auto-enables
the flag inside its render harness.

---

## Working compositions in this repo

| Path                                  | Slide      | Purpose                                                                        |
| ------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `hf/01-title/index.html`              | ch1/01     | GSAP-paused title reveal, three-scene composition, MP4 embedded as `<video>`   |
| `hf/12-fourth-wave/index.html`        | ch1/12     | data-chart-style stat reveal with GSAP timeline (replaces CSS keyframes)       |

Both compositions register a single paused GSAP timeline on
`window.__timelines[<composition-id>]` so `npx hyperframes render`
can drive the playhead frame-by-frame. To author a new one, copy
`hf/12-fourth-wave/index.html` and adjust the data, total duration,
and stat columns.

---

## Recommended next steps (for a future PR)

Status (updated 2026-05-10):
- ✅ ch1/01 title and ch1/12 fourth-wave hyperframes are live with paused GSAP timelines.
- ⏳ All other "data view" slides (ch1/13–22, ch2/10–20, ch3/11–21, ch4/12–22) still use raw CSS `@keyframes` with `animation-delay` chains, plus the deck.css `[class$="-scrub-fill"]` overrides to neutralise the legacy scrub animations during static viewing.
- 📌 Content audit complete; minor accuracy fixes landed (ch1/15 hub baseline clarified, ch1/22 USDT timeline disambiguated, ch2/19 Wealthfront 2020 AUM corrected, ch3/13 IPO-class composition matched to ch3/21, ch3/17 column header generalised, ch3/19 OpenAI delta math fixed).

Next concrete tasks:

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

---

## Integration recipes (copy-paste templates)

Three concrete patterns cover ~95% of the slide-clip work. Each
recipe is self-contained — copy, edit the inputs, run the build.

### Recipe A · drop-in `data-chart` clip behind a data-view slide

Use when the slide already has a hand-rolled bar/line chart (e.g.
`ch1/slides/12-the-2024-2026-wave.html`). The clip plays as the
visual layer; the slide keeps the text overlay.

```bash
# 1. Scaffold a one-off project rooted in nyt-graph (newspaper bars)
npx hyperframes init schulich-ch1-12 --example nyt-graph
cd schulich-ch1-12
npx hyperframes add data-chart           # bar/line/stacked
npx hyperframes add shimmer-sweep        # optional highlight

# 2. Edit src/composition.tsx — point data-chart at the same numbers
#    used in the slide ($85B, $2.8B, $853B, etc.) and set total = 6s.

# 3. Render to a 1920×1080 mp4 and copy into the deck
npx hyperframes render --output output.mp4
cp output.mp4 ../SCHULICH-FINE-TLAU/hf/12-fourth-wave/output.mp4
```

In the slide, layer it behind the text the same way `ch1/01-title.html`
already does:

```html
<video class="hf-bg" data-hf playsinline muted loop preload="auto"
  style="position:absolute;inset:0;width:100%;height:100%;
         object-fit:cover;z-index:-2;background:transparent">
  <source src="../hf/12-fourth-wave/output.mp4" type="video/mp4">
</video>
```

If the MP4 is missing the slide degrades to its existing CSS, so the
clip is purely additive — no risk to the live deck.

### Recipe B · `html-in-canvas` overlay (vfx-* blocks)

Use when you want a shader/3D effect on the slide's *own* DOM —
chapter title chromatic-shadow reveals, Pisano-quadrant liquid-glass,
"old paradigm shatters" closing transitions. Requires the Chrome
flag `chrome://flags/#canvas-draw-element` for live preview;
`npx hyperframes render` enables it automatically.

```bash
# 1. Install all html-in-canvas blocks at once
npx hyperframes add html-in-canvas

# 2. Or only the one you need
npx hyperframes add vfx-text-cursor      # title chromatic shadows
npx hyperframes add vfx-liquid-glass     # voronoi parallax reveal
npx hyperframes add vfx-shatter          # glass-fragment break-up
npx hyperframes add vfx-iphone-device    # 3D iPhone with live HTML
```

Minimal capture pattern (from `hyperframeshtmlcanvas.md`):

```html
<canvas id="capture" layoutsubtree width="1920" height="1080">
  <div class="my-dashboard">
    <h1>Revenue: $4.2M</h1>
    <div class="chart">…</div>
  </div>
</canvas>
<canvas id="theater" width="1920" height="1080"></canvas>
```

```javascript
const cap = document.getElementById('capture');
const ctx = cap.getContext('2d');
ctx.drawElementImage(cap.querySelector('.my-dashboard'), 0, 0, 1920, 1080);
const tex = new THREE.CanvasTexture(cap);
// …feed tex into a vfx-text-cursor / vfx-liquid-glass shader pass
```

Always feature-detect — the slide must keep working on Safari /
Firefox / Chrome-without-the-flag:

```javascript
const isSupported = (() => {
  const tc = document.createElement('canvas');
  if (!('layoutSubtree' in tc)) return false;
  tc.setAttribute('layoutsubtree', '');
  const ctx = tc.getContext('2d');
  return ctx && typeof ctx.drawElementImage === 'function';
})();
if (isSupported) ctx.drawElementImage(el, 0, 0, w, h);
// else: fall through to the static image already in the slide
```

For animated re-capture (scroll-counters, ticker reveals), call
`drawElementImage` inside the GSAP/RAF render loop and set
`tex.needsUpdate = true` on the Three.js texture each frame.

### Recipe C · replace CSS `@keyframes` with a paused GSAP timeline

The fourth-wave slides today rely on `animation-delay` chains, which
are not seekable by `npx hyperframes render`. Re-author them as a
single paused timeline registered on `window.__timelines[<id>]`.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
<script>
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.from('.hf-card', { opacity: 0, y: 14, duration: 0.8, stagger: 0.2 })
    .from('.hf-bar',  { width: 0,                  duration: 1.4 }, '+=0.2')
    .to  ('.hf-live', { opacity: 0.4, duration: 0.8, repeat: -1, yoyo: true }, 0);

  // Expose for the HyperFrames render harness:
  window.__timelines = window.__timelines || {};
  window.__timelines['ch1-slide12'] = tl;

  // For live preview, just play it:
  tl.play();
</script>
```

`npx hyperframes render` walks `window.__timelines`, drives each
playhead frame-by-frame at 60 fps, and writes a deterministic MP4 —
no flicker, no off-by-one in the stagger.

Working examples in this repo:

- `hf/01-title/index.html` — three-scene title with a paused master timeline
- `hf/12-fourth-wave/index.html` — data-card reveal that replaces CSS keyframes

Copy either as a starting point.

### Recipe D · pick the right `--example` template

Each `--example` arg seeds a different visual grammar. Choose by the
slide's role, not its data:

| Slide intent                                  | `--example`     | Slides this fits                                     |
| --------------------------------------------- | --------------- | ---------------------------------------------------- |
| Big single number reveal                      | `kinetic-type`  | Ch1/03 ($1.2T), Ch3/22 ($159B Stripe), Ch4/18 (BTC)  |
| Multi-bar / line / stacked chart              | `nyt-graph`     | Ch1/12, Ch1/14, Ch1/17, Ch3/15, Ch4/15, Ch4/22       |
| Branching logic / decision flow               | `decision-tree` | Ch1/04 eras, Ch4/06 VC method, Ch3/02 growth stages  |
| Editorial typographic grid                    | `swiss-grid`    | Ch1/05 paradigms, Ch1/08 categories, Ch2/06 Pisano   |
| Documentary archive feel                      | `warm-grain`    | Ch1/04 1858–1967 history, Ch2 prefatory historical   |
| Energetic chapter open                        | `play-mode`     | All chapter title cards (ch1/01 → ch4/01)            |
| Product / app showcase                        | `product-promo` | Ch3/05 Wealthsimple, Ch3/16 Stripe, Ch3/18 Nubank    |
| Closing card                                  | `vignelli`      | Ch1/24, Ch2/21, Ch3/22, Ch4/23                       |

Default to `nyt-graph` for data-view slides (the bulk of the
fourth-wave content) and reserve `kinetic-type` for the headline
reveals where one number carries the slide.

---

## Layout regression check (1920×1080)

Before pushing the deck, run a one-shot natural-height check to make
sure no content extends past the visible 1080 area on a 16:9 screen.
Drop this into the browser console with the deck loaded:

```js
(() => {
  const out = [];
  document.querySelectorAll('.slide').forEach((s, i) => {
    const clone = s.cloneNode(true);
    clone.style.cssText = 'position:absolute; left:0; top:0; width:1920px; height:auto; min-height:0; max-height:none; overflow:visible; flex:initial; visibility:hidden';
    document.body.appendChild(clone);
    let maxBottom = 0;
    clone.querySelectorAll('*').forEach(el => {
      if (el.closest('.foot') || el.closest('.chrome')) return;
      const cs = getComputedStyle(el);
      if (cs.position === 'absolute' || cs.position === 'fixed') return;
      const r = el.getBoundingClientRect();
      if (r.height === 0) return;
      const relB = r.bottom - clone.getBoundingClientRect().top;
      if (relB > maxBottom) maxBottom = relB;
    });
    document.body.removeChild(clone);
    if (maxBottom > 1080 + 4) out.push({ idx: i+1, label: s.dataset.screenLabel, over: Math.round(maxBottom - 1080) });
  });
  return out;
})()
```

Expected output: `[]`. Anything reported is content bleeding past the
slide bottom — usually fixable by trimming the lead paragraph or
shrinking the dense-table row padding.
