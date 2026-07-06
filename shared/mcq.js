/* =============== Click-to-answer multiple-choice cards ===============
   Each MCQ starts with 4 options hidden-answer. Click an option to answer:
     - the correct option turns green
     - if you picked wrong, your pick turns red
     - the full worked answer (.mcq-reveal) is revealed
   Click any option again to change your pick; the answer stays revealed.
   Markup:
     <div class="mcq" data-answer="B">
       <div class="mcq-opts">
         <button class="mcq-opt" data-key="A"><span class="mcq-key">A</span><span class="mcq-txt">…</span></button>
         … B, C, D …
       </div>
       <div class="mcq-reveal"> …lead + points… </div>
       <div class="mcq-hint"></div>
     </div>
   Isolated from quiz.js (.quiz) — different classes, safe to load alongside. */
(function () {
  "use strict";
  var css = `
  .mcq{display:flex;flex-direction:column;gap:1.4vh;min-height:0}
  .mcq-opts{display:flex;flex-direction:column;gap:1vh}
  .mcq-opt{display:flex;align-items:center;gap:1vw;width:100%;text-align:left;cursor:pointer;
    font-family:inherit;color:inherit;
    padding:1.05vh 1.3vw;border:1.5px solid rgba(127,127,127,.34);border-radius:9px;
    background:rgba(127,127,127,.05);transition:background .15s ease,border-color .15s ease}
  .mcq-opt:hover{background:rgba(127,127,127,.12)}
  .mcq-key{flex:0 0 auto;width:1.9vw;min-width:26px;height:1.9vw;min-height:26px;
    display:flex;align-items:center;justify-content:center;border-radius:6px;
    font-family:var(--mono,monospace);font-weight:700;font-size:max(12px,1vw);
    background:rgba(127,127,127,.16);letter-spacing:0}
  .mcq-txt{font-family:var(--serif-body-en,Georgia,serif);font-size:max(13px,1.12vw);line-height:1.35}
  /* answered states */
  .mcq.answered .mcq-opt{cursor:default}
  .mcq.answered .mcq-opt:not(.is-correct):not(.is-wrong){opacity:.5}
  .mcq-opt.is-correct{border-color:#1a7f5a;background:rgba(26,127,90,.16)}
  .mcq-opt.is-correct .mcq-key{background:#1a7f5a;color:#fff}
  .mcq-opt.is-wrong{border-color:#b4472d;background:rgba(180,71,45,.14)}
  .mcq-opt.is-wrong .mcq-key{background:#b4472d;color:#fff}
  .mcq-reveal{display:none;margin-top:.4vh}
  .mcq.answered .mcq-reveal{display:block;animation:mcqfade .25s ease}
  @keyframes mcqfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .mcq-hint{font-family:var(--mono,monospace);font-size:max(9px,.72vw);letter-spacing:.14em;
    text-transform:uppercase;opacity:.55}
  .mcq-hint.correct{color:#1a7f5a;opacity:.95}
  .mcq-hint.wrong{color:#b4472d;opacity:.95}
  `;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var PROMPT = "▸ Click an option to reveal the answer";

  function initHints() {
    document.querySelectorAll(".mcq").forEach(function (m) {
      var h = m.querySelector(".mcq-hint");
      if (h && !h.textContent.trim()) h.textContent = PROMPT;
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initHints);
  else initHints();

  document.addEventListener("click", function (e) {
    var opt = e.target.closest && e.target.closest(".mcq-opt");
    if (!opt) return;
    var mcq = opt.closest(".mcq");
    if (!mcq) return;
    e.preventDefault();
    var answer = (mcq.dataset.answer || "").trim();
    var picked = (opt.dataset.key || "").trim();
    // clear previous marks
    mcq.querySelectorAll(".mcq-opt").forEach(function (o) {
      o.classList.remove("is-correct", "is-wrong");
    });
    // mark the correct one, and the wrong pick if any
    mcq.querySelectorAll(".mcq-opt").forEach(function (o) {
      if ((o.dataset.key || "").trim() === answer) o.classList.add("is-correct");
    });
    var right = picked === answer;
    if (!right) opt.classList.add("is-wrong");
    mcq.classList.add("answered");
    var h = mcq.querySelector(".mcq-hint");
    if (h) {
      h.textContent = right ? "✓ Correct" : "✗ Not quite — correct answer highlighted below";
      h.className = "mcq-hint " + (right ? "correct" : "wrong");
    }
  });
})();
