/* =============== Click-to-reveal comparison rows ===============
   Markup:
     <div class="cmp" style="--cmp-cols: 2.6fr 4.6fr 4.6fr">
       <div class="cmp-head"><div>Factor</div><div>DeFi</div><div>TradFi</div></div>
       <div class="cmp-row">
         <div class="cmp-cat">Interest rates</div>
         <div class="cmp-cell cmp-a">…DeFi description…</div>
         <div class="cmp-cell cmp-b">…TradFi description…</div>
       </div>
       …
     </div>
   Click a row to reveal/hide its two description cells. A control with
   class "cmp-all" toggles every row in the same slide.
   Coexists with deck.js (which only uses keys/wheel/touch, not click) and
   the lightbox (which targets .zoomable/.frame-img). */
(function () {
  "use strict";
  var css = `
  /* the table flex-fills the slide so rows spread to use the full height */
  .cmp{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;gap:.3vh;margin-top:1.5vh}
  .cmp-head{flex:0 0 auto;display:grid;grid-template-columns:var(--cmp-cols,2.6fr 4.6fr 4.6fr);gap:1vw;
    font-family:var(--mono,monospace);font-size:max(10px,.74vw);letter-spacing:.16em;
    text-transform:uppercase;opacity:.55;padding:0 .7vw .7vh}
  .cmp-head > :nth-child(2){color:#2dd4bf}
  .cmp-row{flex:1 1 0;min-height:0;display:grid;grid-template-columns:var(--cmp-cols,2.6fr 4.6fr 4.6fr);gap:1vw;
    align-items:center;cursor:pointer;border-top:1px solid rgba(127,127,127,.16);
    padding:.4vh .7vw;border-radius:4px;transition:background .15s ease}
  .cmp-row:hover{background:rgba(127,127,127,.09)}
  .cmp-cat{font-weight:700;font-size:max(14px,1.2vw);line-height:1.2;display:flex;gap:.5vw;align-items:baseline}
  .cmp-cat::before{content:"+";color:#2dd4bf;font-weight:700;width:.9em;flex:0 0 auto;
    font-family:var(--mono,monospace);transition:transform .15s ease}
  .cmp-row.on .cmp-cat::before{content:"\\2212"} /* minus */
  .cmp-cell{font-size:max(12.5px,1vw);line-height:1.32;padding-left:.8vw;
    border-left:2px solid transparent;
    opacity:0;transform:translateY(3px);transition:opacity .22s ease,transform .22s ease}
  .cmp-row.on .cmp-cell{opacity:1;transform:none}
  .cmp-row:not(.on) .cmp-cell{position:relative}
  .cmp-row:not(.on) .cmp-cell::after{content:"";position:absolute;left:.7vw;right:8%;top:.55em;
    height:1px;border-top:1px dashed rgba(127,127,127,.4)}
  .cmp-a{border-left-color:#2dd4bf}      /* DeFi accent (mint) */
  .cmp-b{border-left-color:#7e93b0}      /* TradFi accent (slate) */
  .cmp-all{display:inline-flex;align-items:center;gap:.4vw;cursor:pointer;user-select:none;
    font-family:var(--mono,monospace);font-size:max(10px,.72vw);letter-spacing:.14em;
    text-transform:uppercase;padding:.5vh 1vw;border-radius:999px;
    border:1px solid rgba(127,127,127,.4);opacity:.8;transition:background .15s ease,opacity .15s}
  .cmp-all:hover{opacity:1;background:rgba(127,127,127,.12)}
  `;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function setAll(cmp, on) {
    cmp.querySelectorAll(".cmp-row").forEach(function (r) { r.classList.toggle("on", on); });
  }

  document.addEventListener("click", function (e) {
    var all = e.target.closest && e.target.closest(".cmp-all");
    if (all) {
      var slide = all.closest(".slide") || document;
      var cmp = slide.querySelector(".cmp");
      if (!cmp) return;
      var anyOff = !!cmp.querySelector(".cmp-row:not(.on)");
      setAll(cmp, anyOff);
      all.dataset.state = anyOff ? "on" : "off";
      var lbl = all.querySelector(".cmp-all-label");
      if (lbl) lbl.textContent = anyOff ? "Hide all" : "Reveal all";
      return;
    }
    var row = e.target.closest && e.target.closest(".cmp-row");
    if (row) row.classList.toggle("on");
  });
})();
