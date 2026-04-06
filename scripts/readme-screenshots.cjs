const { chromium } = require('playwright');
const path = require('path');

const BASE = 'https://decur.org';
const OUT = path.join(__dirname, '..', 'public', 'screenshots');
const VP = { width: 1280, height: 820 };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VP, colorScheme: 'dark' });

  async function go(url, file, waitFor, delay) {
    console.log('-> ' + url);
    const page = await ctx.newPage();
    await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    if (waitFor) await page.waitForSelector(waitFor, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(delay || 2000);
    await page.screenshot({ path: path.join(OUT, file) });
    console.log('   saved: ' + file);
    await page.close();
  }

  // Static pages
  await go('/', 'home-dark.png', 'h1', 1500);
  await go('/data?category=key-figures', 'key-figures.png', 'main', 2500);
  await go('/data?category=cases', 'cases.png', 'main', 2500);
  await go('/data?category=programs', 'programs.png', 'main', 2500);

  // Explore: network graph (hero)
  await go('/explore', 'explore-network.png', 'canvas', 5000);

  // Explore: Programs tab -> lineage + oversight; Cases tab -> evidence tiers
  {
    const page = await ctx.newPage();
    await page.goto(BASE + '/explore', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Click "Programs" tab (label is "Programs" in TAB_VIEWS)
    try {
      const prog = page.locator('button').filter({ hasText: /^Programs$/ }).first();
      await prog.click({ timeout: 5000 });
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(OUT, 'flow-lineage.png') });
      console.log('   saved: flow-lineage.png');

      const oversight = page.locator('button').filter({ hasText: /Oversight Structure/ }).first();
      await oversight.click({ timeout: 5000 });
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(OUT, 'flow-oversight.png') });
      console.log('   saved: flow-oversight.png');
    } catch (e) {
      console.log('   (Programs tab error: ' + e.message + ')');
    }

    // Click "Cases" tab -> Evidence Tier flow
    try {
      const cases = page.locator('button').filter({ hasText: /^Cases$/ }).first();
      await cases.click({ timeout: 5000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(OUT, 'flow-evidence-tiers.png') });
      console.log('   saved: flow-evidence-tiers.png');
    } catch (e) {
      console.log('   (Cases tab error: ' + e.message + ')');
    }

    await page.close();
  }

  await browser.close();
  console.log('\nDone.');
})();
