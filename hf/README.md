# HyperFrames embeds

This directory holds standalone [HyperFrames](https://github.com/heygen-com/hyperframes)
compositions whose rendered MP4s are embedded as background videos in selected
slides. Most slides in `ch1`–`ch4` keep their existing CSS-keyframed
animations — HyperFrames is reserved for high-impact moments where a
cinematic intro or transition adds meaning (titles, chapter pivots, the
hero closings).

## How a slide opts in

A slide includes a single `<video>` element marked with `data-hf`:

```html
<section class="slide hero dark" data-screen-label="01 Title">
  <video class="hf-bg" data-hf playsinline muted preload="auto"
    style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2">
    <source src="../hf/01-title/output.mp4" type="video/mp4">
  </video>
  …existing slide chrome and frame content…
</section>
```

`shared/deck.js` automatically plays the active slide's `data-hf` video from
frame zero whenever the slide becomes `.active`, and pauses + resets it on
leave. If the MP4 is missing, the slide degrades silently to its WebGL
background — nothing breaks.

`z-index:-2` keeps the video behind the slide's `::before` overlay (which
applies the brand-tinted dark wash for hero slides) and behind the frame
content, so the existing static title text renders crisply on top.

## Rendering a composition

```bash
cd hf/01-title
npx hyperframes lint        # verify structural validity
npx hyperframes preview     # live-preview in Chrome (needs --enable-features=CanvasDrawElement
                            #   if the composition uses HTML-in-Canvas; this one doesn't)
npx hyperframes render --output output.mp4
```

The `render` command launches headless Chrome with the right flags, drives
the paused GSAP timeline frame-by-frame, and writes `output.mp4` (~5 MB for
a 5-second 1920×1080 H.264 file). Commit the MP4 alongside the source HTML
so the deck works for anyone who clones the repo without re-running render.

## Authoring conventions

Each composition is a single `index.html` with:
- `<div id="stage" data-composition-id data-start data-duration data-width data-height>`
- One or more `<div class="scene clip" data-start data-duration data-track-index="0" data-scene="N">`
- A `.scene-content` wrapper inside each scene for readable content
- A single paused GSAP timeline registered on
  `window.__timelines["<composition-id>"]`
- Inline CSS only; assets via `data:` URIs or files committed in the
  composition directory
- All tweens must have finite duration. No `repeat: -1` — HyperFrames
  needs a bounded `tl.totalDuration()` to seek frame-by-frame
- Scene visibility is owned by the timeline (`tl.set("[data-scene='N']",
  { opacity: 1 }, start)`), not by CSS pseudo-classes. CSS sets
  `.scene { opacity: 0 }` initially; the timeline reveals each scene
  at its `data-start`

Bind brand colors and typography from the deck's `:root` (Indigo
Porcelain — `#0a1f3d`, `#f1f3f5`, Playfair Display, IBM Plex Mono). Don't
freestyle a palette.

### Browser-preview autoplay

Each composition ends with:

```js
if (!window.__hfRender) {
  tl.eventCallback('onComplete', () => { gsap.delayedCall(0.6, () => tl.seek(0).play()); });
  tl.play();
}
```

This auto-loops the timeline when you open `index.html` directly in a
browser, so you can review motion without spinning up the HyperFrames
preview server. The render harness sets `window.__hfRender = true` before
the timeline initialises, which short-circuits this block so the engine
can drive the playhead deterministically.

## When to add a new HyperFrames embed

Good candidates:
- Cover/title slides for each chapter
- Major section pivots (e.g., the "fourth wave" intro on ch1/12)
- Closing slides where you want a cinematic exhale
- Data-view reveals where a 3-second motion sequence makes a stat land
  harder than a CSS fade-up

Bad candidates:
- Dense layout slides (tables, multi-pillar grids) — readers need
  static text to scan
- Slides users frequently revisit (videos restart on re-entry, which
  becomes annoying)

Keep the total to ≤ 6 across the whole course. Every embed is ~5 MB; the
deck should still load over a hotel-Wi-Fi connection.

## Catalog

| Slide                    | Composition                  | Status                                |
| ------------------------ | ---------------------------- | ------------------------------------- |
| ch1/01 Title             | `hf/01-title/`               | Source committed; render pending      |
| ch1/12 Fourth-Wave Reveal| `hf/12-fourth-wave/`         | Source committed; render pending      |
| ch1/14 Capital Rebound   | `hf/14-capital-rebound/`     | Source committed; render pending      |

(Add a row each time you ship a new composition.)
