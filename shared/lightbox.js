/* =============== Click-to-zoom lightbox ===============
   Any element with class "zoomable" becomes clickable to open a full-screen
   modal of a chart or table image. The big image comes from:
     - data-zoom-src="<url>"   (preferred; e.g. a high-res table screenshot)
     - otherwise the element's own <img> src (e.g. a figure thumbnail)
   Optional data-zoom-cap="<caption>" shows a caption under the image.

   Coexists with shared/deck.js: while the modal is open, capture-phase
   key/wheel handlers swallow ESC + arrows + scroll so the deck behind does
   NOT navigate or open its overview. ESC closes the modal instead. */
(function () {
  "use strict";

  // ---- inject styles ----
  var css = `
  .zoomable{cursor:zoom-in;position:relative}
  .lb-badge{
    position:absolute;top:.6vh;right:.6vw;z-index:5;
    font-family:var(--mono,"IBM Plex Mono",monospace);
    font-size:max(9px,.62vw);letter-spacing:.12em;text-transform:uppercase;
    padding:.35vh .6vw;border-radius:999px;
    background:rgba(10,10,20,.62);color:#f4f1eb;
    border:1px solid rgba(255,255,255,.28);
    opacity:0;transition:opacity .18s ease;pointer-events:none;white-space:nowrap}
  .zoomable:hover .lb-badge,[data-lb-ready]:hover .lb-badge{opacity:1}
  .lb-overlay{
    position:fixed;inset:0;z-index:1000;display:none;
    align-items:center;justify-content:center;flex-direction:column;gap:1.6vh;
    background:rgba(6,8,14,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
    padding:4vh 4vw;opacity:0;transition:opacity .22s ease}
  .lb-overlay.open{display:flex;opacity:1}
  .lb-overlay img{
    max-width:94vw;max-height:86vh;width:auto;height:auto;object-fit:contain;
    background:#fff;border-radius:6px;box-shadow:0 24px 80px rgba(0,0,0,.6);
    transform:scale(.97);transition:transform .22s ease}
  .lb-overlay.open img{transform:scale(1)}
  .lb-cap{
    font-family:var(--mono,"IBM Plex Mono",monospace);
    font-size:max(11px,.85vw);letter-spacing:.14em;text-transform:uppercase;
    color:#e8eef5;opacity:.8;text-align:center;max-width:80vw}
  .lb-close{
    position:fixed;top:2.2vh;right:2vw;z-index:1001;
    font-family:var(--mono,"IBM Plex Mono",monospace);font-size:max(12px,.9vw);
    letter-spacing:.14em;text-transform:uppercase;cursor:pointer;
    color:#f4f1eb;background:rgba(10,10,20,.6);
    border:1px solid rgba(255,255,255,.28);border-radius:999px;
    padding:.7vh 1.1vw;transition:background .18s ease}
  .lb-close:hover{background:rgba(40,40,70,.9)}
  .lb-hint{position:fixed;bottom:2.4vh;left:50%;transform:translateX(-50%);z-index:1001;
    font-family:var(--mono,"IBM Plex Mono",monospace);font-size:max(9px,.66vw);
    letter-spacing:.18em;text-transform:uppercase;color:#cdd6e2;opacity:.5}
  `;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---- build overlay ----
  var overlay = document.createElement("div");
  overlay.className = "lb-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  var img = document.createElement("img");
  img.alt = "";
  var cap = document.createElement("div");
  cap.className = "lb-cap";
  var closeBtn = document.createElement("div");
  closeBtn.className = "lb-close";
  closeBtn.textContent = "✕ Close";
  var hint = document.createElement("div");
  hint.className = "lb-hint";
  hint.textContent = "Click anywhere or press ESC to close";
  overlay.appendChild(img);
  overlay.appendChild(cap);
  overlay.appendChild(closeBtn);
  overlay.appendChild(hint);
  document.body.appendChild(overlay);

  var isOpen = false;

  function open(src, caption) {
    if (!src) return;
    img.src = src;
    if (caption) { cap.textContent = caption; cap.style.display = ""; }
    else { cap.style.display = "none"; }
    overlay.classList.add("open");
    isOpen = true;
  }
  function close() {
    overlay.classList.remove("open");
    isOpen = false;
    // release the (potentially large) image after the fade
    setTimeout(function () { if (!isOpen) img.src = ""; }, 240);
  }

  // Any explicit .zoomable, plus the decks' standard image cards (.frame-img),
  // are clickable. This makes every figure/table image in ch1–11 expandable
  // with no per-slide markup.
  var ZOOM_SEL = ".zoomable, .frame-img";

  // ---- add hover badges to zoomable elements ----
  function decorate(root) {
    (root || document).querySelectorAll(ZOOM_SEL).forEach(function (el) {
      if (el.dataset.lbReady) return;
      // skip an image card that is nested inside an explicit .zoomable wrapper
      // (avoid a double badge / double trigger)
      if (!el.classList.contains("zoomable") && el.closest(".zoomable")) return;
      el.dataset.lbReady = "1";
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      if (el.dataset.zoomNobadge === undefined) {
        var b = document.createElement("span");
        b.className = "lb-badge";
        b.textContent = el.dataset.zoomBadge || "⤢ Click to enlarge";
        el.appendChild(b);
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { decorate(); });
  } else {
    decorate();
  }

  // ---- open on click of a zoomable ----
  document.addEventListener("click", function (e) {
    if (isOpen) return; // overlay handles its own clicks below
    var z = e.target.closest && e.target.closest(ZOOM_SEL);
    if (!z) return;
    var src = z.dataset.zoomSrc;
    if (!src) { var im = z.querySelector("img"); src = im && im.src; }
    if (!src) return;
    // caption: explicit data-zoom-cap, else the adjacent .frame-cap / .img-cap
    var cap = z.dataset.zoomCap;
    if (!cap) {
      var capEl = (z.nextElementSibling &&
        z.nextElementSibling.matches && z.nextElementSibling.matches(".frame-cap, .img-cap"))
        ? z.nextElementSibling
        : z.querySelector(".frame-cap, .img-cap");
      if (capEl) {
        var parts = capEl.children.length
          ? Array.prototype.map.call(capEl.children, function (c) { return c.textContent.trim(); })
          : [capEl.textContent];
        cap = parts.filter(Boolean).join("  ·  ").replace(/\s+/g, " ").trim();
      }
    }
    e.preventDefault();
    open(src, cap || "");
  });

  // close when clicking the overlay (incl. the image / close button)
  overlay.addEventListener("click", function (e) { e.stopPropagation(); close(); });

  // ---- swallow keys/scroll while open so the deck doesn't move ----
  var NAV_KEYS = ["Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
    " ", "PageUp", "PageDown", "Home", "End"];
  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); close(); return; }
    if (NAV_KEYS.indexOf(e.key) !== -1) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true); // capture: runs before deck.js's bubble-phase handler
  document.addEventListener("wheel", function (e) {
    if (isOpen) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, { capture: true, passive: false });
})();
