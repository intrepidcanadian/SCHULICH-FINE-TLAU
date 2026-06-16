/* =============== Click-to-reveal pop-quiz cards ===============
   Each card reveals in stages on click:
     stage 0 → question + guess options only
     stage 1 → + an example
     stage 2 → + the study result (correct option highlighted) + citation
     (a fourth click resets to 0)
   Markup:
     <div class="quiz" data-stage="0">
       <div class="quiz-q">…question…</div>
       <div class="quiz-opts">
         <div class="quiz-opt" data-correct>Favor</div>
         <div class="quiz-opt">Disfavor</div>
       </div>
       <div class="quiz-example"><span class="quiz-tag">Example</span> …</div>
       <div class="quiz-answer"><span class="quiz-tag answer">Result</span> …
         <div class="quiz-cite">…footnote…</div></div>
       <div class="quiz-hint"></div>
     </div>
   Coexists with deck.js (keys), lightbox (.zoomable/.frame-img) and compare (.cmp-row). */
(function () {
  "use strict";
  var css = `
  .quiz{display:flex;flex-direction:column;gap:1.5vh;cursor:pointer;
    padding:2.6vh 1.9vw;border:1px solid rgba(127,127,127,.28);border-radius:12px;
    background:rgba(127,127,127,.06);transition:background .15s ease;min-height:0}
  .quiz:hover{background:rgba(127,127,127,.11)}
  .quiz-q{font-family:var(--serif-zh,Georgia,serif);font-weight:700;
    font-size:max(16px,1.7vw);line-height:1.24}
  .quiz-opts{display:flex;gap:1vw}
  .quiz-opt{flex:1;text-align:center;padding:1.25vh .5vw;border:1.5px solid rgba(127,127,127,.45);
    border-radius:8px;font-family:var(--mono,monospace);font-weight:700;
    font-size:max(12px,1.1vw);letter-spacing:.04em;text-transform:uppercase;transition:all .2s ease}
  .quiz[data-stage="1"] .quiz-opt[data-correct]{border-color:#1d9d6b;
    background:rgba(29,157,107,.20);color:#28b67e}
  .quiz[data-stage="1"] .quiz-opt:not([data-correct]){opacity:.38}
  .quiz-example,.quiz-answer{font-size:max(12px,1.04vw);line-height:1.45}
  /* the example stays visible to set up the guess; only the RESULT hides */
  .quiz .quiz-answer{display:none}
  .quiz[data-stage="1"] .quiz-answer{display:block}
  .quiz-tag{display:inline-block;font-family:var(--mono,monospace);font-size:max(8.5px,.64vw);
    letter-spacing:.16em;text-transform:uppercase;padding:.25vh .6vw;border-radius:4px;
    margin-right:.5vw;font-weight:700;vertical-align:middle}
  .quiz-tag{background:rgba(199,148,51,.22);color:#caa040}
  .quiz-tag.answer{background:rgba(29,157,107,.22);color:#28b67e}
  .quiz-illus{opacity:.55;font-style:italic;font-size:.86em}
  .quiz-cite{margin-top:.6vh;font-family:var(--mono,monospace);font-size:max(9px,.68vw);
    letter-spacing:.06em;opacity:.6}
  .quiz-hint{font-family:var(--mono,monospace);font-size:max(8.5px,.66vw);letter-spacing:.14em;
    text-transform:uppercase;opacity:.5;margin-top:auto;padding-top:.4vh}
  `;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function hintFor(s) {
    return s === 0 ? "▸ Click to reveal the result"
      : "▸ Click to hide the result";
  }
  // initialise hints
  function initHints() {
    document.querySelectorAll(".quiz").forEach(function (q) {
      if (!q.dataset.stage) q.dataset.stage = "0";
      var h = q.querySelector(".quiz-hint");
      if (h && !h.textContent.trim()) h.textContent = hintFor(parseInt(q.dataset.stage));
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initHints);
  else initHints();

  document.addEventListener("click", function (e) {
    var q = e.target.closest && e.target.closest(".quiz");
    if (!q) return;
    var s = (parseInt(q.dataset.stage || "0") + 1) % 2;
    q.dataset.stage = String(s);
    var h = q.querySelector(".quiz-hint");
    if (h) h.textContent = hintFor(s);
  });
})();
