#!/usr/bin/env python3
"""Generate the Q&A Review deck slide partials from chqa/answers/chN.json."""
import json, re, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ANS = HERE / "answers"
SLIDES = HERE / "slides"

CHAPTERS = [
    (5,  "Bitcoin, Blockchain &amp; Cryptocurrencies", "Bitcoin, Blockchain &amp; Crypto"),
    (6,  "Ethereum, Smart Contracts &amp; DeFi",        "Ethereum &amp; DeFi"),
    (7,  "Crowdfunding &amp; P2P Lending",              "Crowdfunding &amp; P2P"),
    (8,  "Digital Wealth Management",                   "Digital Wealth"),
    (9,  "Payments, FX &amp; Insurance",                "Payments &amp; Insurance"),
    (10, "Digital Banking &amp; Personal Finance",      "Digital Banking"),
    (11, "Chinese Techfins &amp; North American Bigtech","Techfins &amp; Bigtech"),
]

ENT = re.compile(r'&(?!amp;|lt;|gt;|#\d+;|nbsp;|mdash;|ndash;|rsquo;|lsquo;|middot;|hellip;|deg;|asymp;|divide;)')

def esc(t):
    """Escape for HTML without double-escaping existing entities."""
    t = ENT.sub('&amp;', t)
    return t.replace('<', '&lt;').replace('>', '&gt;')

def cover(total):
    return f'''<section class="slide hero dark" data-screen-label="01 Cover">
  <div class="chrome">
    <div>FINE 6280 &middot; Fintech</div>
    <div>Q&amp;A Review</div>
  </div>
  <div class="frame" style="display:grid; gap:3vh; align-content:center; min-height:72vh">
    <div class="kicker">Special Topic &middot; End-of-Chapter Questions</div>
    <h1 class="h-hero" style="font-size:6.2vw">Questions &amp; Answers</h1>
    <h2 class="h-sub" style="max-width:66vw; font-size:2.4vw">Worked answers to every &ldquo;Questions for Discussion&rdquo; item from Chapters 5 through 11 &mdash; each grounded in the text of <em>Fintech Explained</em>.</h2>
    <div class="meta-row" style="margin-top:1vh">
      <span>70 questions</span><span>&middot;</span><span>7 chapters</span><span>&middot;</span><span>Review deck</span>
    </div>
  </div>
  <div class="foot">
    <div>Review &middot; Chapters 5&ndash;11 &middot; FINE 6280</div>
    <div>&mdash; &middot; &mdash;</div>
  </div>
</section>
'''

def divider(chn, title, short, num, total):
    return f'''<section class="slide hero dark" data-screen-label="{num:02d} Ch{chn} Divider">
  <div class="chrome">
    <div>Q&amp;A Review &middot; Chapter {chn}</div>
    <div>{num:02d} / {total}</div>
  </div>
  <div class="frame" style="display:grid; gap:2.4vh; align-content:center; min-height:70vh">
    <div class="kicker">Chapter {chn} &middot; 10 questions</div>
    <h1 class="h-hero" style="font-size:5.2vw">{title}</h1>
    <div class="meta-row"><span>Questions for Discussion</span><span>&middot;</span><span>Q1&ndash;Q10</span></div>
  </div>
  <div class="foot">
    <div>Chapter {chn} &middot; Q&amp;A</div>
    <div>{short}</div>
  </div>
</section>
'''

def qslide(chn, short, qi, item, mcq, num, total):
    q = esc(item["q"])
    lead = esc(item["lead"])
    pts = "".join(
        f'<div style="display:flex; gap:.8vw; font-size:max(12px,1.0vw); line-height:1.45">'
        f'<span style="color:#1a7f5a; font-weight:800; flex:0 0 auto">&mdash;</span>'
        f'<span>{esc(p)}</span></div>\n        '
        for p in item["points"]
    )
    correct = mcq["correct"].strip()
    opts = "".join(
        f'<button class="mcq-opt" data-key="{k}"><span class="mcq-key">{k}</span>'
        f'<span class="mcq-txt">{esc(mcq["options"][k])}</span></button>\n        '
        for k in ("A", "B", "C", "D")
    )
    return f'''<section class="slide light" data-screen-label="{num:02d} Ch{chn} Q{qi}">
  <div class="chrome">
    <div>&sect;{chn} &middot; Question {qi} of 10</div>
    <div>{num:02d} / {total}</div>
  </div>
  <div class="frame" style="padding-top:2.2vh; display:flex; flex-direction:column">
    <div class="kicker">Chapter {chn} &middot; {short}</div>
    <h2 class="h-xl" style="font-size:2.1vw; max-width:90vw; line-height:1.13">{q}</h2>
    <div class="mcq" data-answer="{correct}" style="flex:1; justify-content:center; margin-top:1.2vh">
      <div class="mcq-opts">
        {opts.rstrip()}
      </div>
      <div class="mcq-reveal">
        <div class="callout" style="padding:1.3vh 1.6vw; font-size:max(13px,1.16vw); line-height:1.46"><strong>{lead}</strong></div>
        <div style="display:flex; flex-direction:column; gap:.85vh; padding-left:.4vw; margin-top:1vh">
        {pts.rstrip()}
        </div>
      </div>
      <div class="mcq-hint"></div>
    </div>
  </div>
  <div class="foot">
    <div>Chapter {chn} &middot; Question {qi} &middot; multiple choice</div>
    <div>Pick an option to reveal the answer</div>
  </div>
</section>
'''

# ---- build sequence ----
total = 1 + sum(1 + len(json.loads((ANS / f"ch{c}.json").read_text())) for c, _, _ in CHAPTERS)

# clear old slides
for f in SLIDES.glob("*.html"):
    f.unlink()

num = 0
def write(html):
    global num
    num += 1
    (SLIDES / f"{num:03d}.html").write_text(html, encoding="utf-8")

write(cover(total))
for chn, title, short in CHAPTERS:
    items = json.loads((ANS / f"ch{chn}.json").read_text())
    mcqs = json.loads((HERE / "mcq" / f"ch{chn}.json").read_text())
    assert len(items) == len(mcqs), f"ch{chn}: {len(items)} answers vs {len(mcqs)} mcqs"
    num += 1
    (SLIDES / f"{num:03d}.html").write_text(divider(chn, title, short, num, total), encoding="utf-8")
    for qi, (item, mcq) in enumerate(zip(items, mcqs), 1):
        num += 1
        (SLIDES / f"{num:03d}.html").write_text(qslide(chn, short, qi, item, mcq, num, total), encoding="utf-8")

print(f"generated {num} slides (expected {total})")
