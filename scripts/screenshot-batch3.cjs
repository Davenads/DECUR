const playwrightPath = 'C:\\Users\\david\\AppData\\Local\\npm-cache\\_npx\\705bc6b22212b352\\node_modules\\playwright';
const { chromium } = require(playwrightPath);

const FIGURES = [
  { id: 'george-knapp',    out: 'knapp-career-network-tab.png' },
  { id: 'leslie-kean',     out: 'kean-career-network-tab.png' },
  { id: 'ross-coulthart',  out: 'coulthart-career-network-tab.png' },
  { id: 'jesse-michels',   out: 'michels-career-network-tab.png' },
  { id: 'richard-dolan',   out: 'dolan-career-network-tab.png' },
  { id: 'robert-hastings', out: 'hastings-career-network-tab.png' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const { id, out } of FIGURES) {
    await page.goto('http://localhost:3000/figures/' + id);
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Career Network' }).click();
    await page.waitForTimeout(4500);
    await page.screenshot({ path: 'C:/Projects/DECUR/screenshots/' + out });
    console.log('Saved:', out);
  }

  await browser.close();
})();
