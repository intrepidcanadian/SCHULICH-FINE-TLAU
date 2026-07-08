const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ALL_CHAPTERS = [
  { dir: 'ch1', title: 'Chapter 1 — Fintech Defined' },
  { dir: 'ch2', title: 'Chapter 2 — Theories & Business Models' },
  { dir: 'ch3', title: 'Chapter 3 — Financing Fintech Ventures' },
  { dir: 'ch4', title: 'Chapter 4 — Valuation' },
  { dir: 'ch5', title: 'Chapter 5 — Bitcoin, Blockchain & Cryptocurrencies' },
  { dir: 'ch6', title: 'Chapter 6 — Ethereum, Smart Contracts & DeFi' },
  { dir: 'ch7', title: 'Chapter 7 — Crowdfunding & P2P Lending' },
  { dir: 'ch8', title: 'Chapter 8 — Digital Wealth Management' },
  { dir: 'ch9', title: 'Chapter 9 — Payments, FX & Insurance' },
  { dir: 'ch10', title: 'Chapter 10 — Digital Banking & Personal Finance' },
  { dir: 'ch11', title: 'Chapter 11 — Chinese Techfins & North American Bigtech' },
  { dir: 'chblockchain', title: 'Blockchain Businesses — DeFi vs. TradFi' },
  { dir: 'chqa', title: 'Q&A Review — Chapters 5–11' },
];

// Optionally restrict to chapters named on the command line, e.g.
//   node generate-pdfs.js ch7 chblockchain
const wanted = process.argv.slice(2);
const chapters = wanted.length
  ? ALL_CHAPTERS.filter(c => wanted.includes(c.dir))
  : ALL_CHAPTERS;

const BASE = path.resolve(__dirname);
const OUT = path.join(BASE, 'pdf');

async function generateChapterPDF(browser, chapter) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  const htmlPath = `file://${path.join(BASE, chapter.dir, 'index.html')}`;
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('.slide', { timeout: 10000 });

  // Wait for fonts and rendering
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  const slideCount = await page.evaluate(() =>
    document.querySelectorAll('.slide').length
  );

  console.log(`  ${chapter.dir}: ${slideCount} slides`);

  const screenshots = [];

  for (let i = 0; i < slideCount; i++) {
    // Navigate to slide
    await page.evaluate((idx) => {
      const deck = document.getElementById('deck');
      const slides = deck.querySelectorAll('.slide');
      const el = slides[idx];
      // Instant jump — no transition
      deck.style.transition = 'none';
      deck.style.transform = `translateX(${-idx * 100}vw)`;
      // Update theme
      const th = el.dataset.theme || (el.classList.contains('light') ? 'light' : 'dark');
      document.body.classList.toggle('light-bg', th === 'light');
      slides.forEach((s, j) => s.classList.toggle('active', j === idx));
    }, i);

    await new Promise(r => setTimeout(r, 600));

    // Hide navigation chrome for clean capture
    await page.evaluate(() => {
      const nav = document.getElementById('nav');
      const hint = document.getElementById('hint');
      const back = document.getElementById('back-home');
      if (nav) nav.style.display = 'none';
      if (hint) hint.style.display = 'none';
      if (back) back.style.display = 'none';
    });

    const buf = await page.screenshot({ type: 'png', encoding: 'binary' });
    screenshots.push(buf);
  }

  await page.close();

  // Build a single-page HTML with all slide images, then print to PDF
  const imgPage = await browser.newPage();

  const imgTags = screenshots.map((buf, i) => {
    const b64 = Buffer.from(buf).toString('base64');
    return `<div class="slide-page">
      <img src="data:image/png;base64,${b64}" />
      <div class="slide-number">${i + 1} / ${slideCount}</div>
    </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  @page {
    size: 1920px 1080px;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; }
  .slide-page {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }
  .slide-page:last-child { page-break-after: auto; }
  .slide-page img {
    width: 1920px;
    height: 1080px;
    display: block;
  }
  .slide-number {
    position: absolute;
    bottom: 8px;
    right: 16px;
    font: 11px/1 monospace;
    color: rgba(255,255,255,0.25);
  }
</style>
</head>
<body>${imgTags}</body>
</html>`;

  await imgPage.setContent(html, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 500));

  const outFile = path.join(OUT, `${chapter.dir}-slides.pdf`);
  await imgPage.pdf({
    path: outFile,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await imgPage.close();
  console.log(`  ✓ ${outFile}`);
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  console.log('Launching browser…');
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 300000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security',
           '--disable-gpu', '--disable-dev-shm-usage', '--use-gl=swiftshader'],
  });

  for (const ch of chapters) {
    console.log(`\nGenerating ${ch.title}…`);
    try {
      await generateChapterPDF(browser, ch);
    } catch (err) {
      console.error(`  ✗ ${ch.dir}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\nDone! PDFs saved to ./pdf/');
})();
