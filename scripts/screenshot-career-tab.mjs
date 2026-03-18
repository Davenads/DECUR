import { chromium } from '/c/Users/david/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';

const execAsync = promisify(exec);

// Find playwright executable
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://localhost:3000/figures/ryan-graves');
await page.waitForTimeout(2000);
await page.click('button:has-text("Career Network")');
await page.waitForTimeout(4000);
await page.screenshot({ path: 'screenshots/graves-career-network-tab.png' });
await browser.close();
console.log('Screenshot saved.');
