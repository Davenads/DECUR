const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/figures/ryan-graves');
  await page.waitForTimeout(1500);
  // Click the Career Network tab
  await page.click('text=Career Network');
  await page.waitForTimeout(3000); // wait for React Flow to load
  await page.screenshot({ path: 'screenshots/graves-career-network-tab.png', fullPage: false });
  await browser.close();
  console.log('Done');
})();
