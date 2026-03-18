const playwrightPath = 'C:\\Users\\david\\AppData\\Local\\npm-cache\\_npx\\705bc6b22212b352\\node_modules\\playwright';
const { chromium } = require(playwrightPath);

const FIGURES = [
  { id: 'harry-reid',       out: 'reid-career-network-tab.png' },
  { id: 'chuck-schumer',    out: 'schumer-career-network-tab.png' },
  { id: 'tim-gallaudet',    out: 'gallaudet-career-network-tab.png' },
  { id: 'daniel-sheehan',   out: 'sheehan-career-network-tab.png' },
  { id: 'sean-kirkpatrick', out: 'kirkpatrick-career-network-tab.png' },
  { id: 'harald-malmgren',  out: 'malmgren-career-network-tab.png' },
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
