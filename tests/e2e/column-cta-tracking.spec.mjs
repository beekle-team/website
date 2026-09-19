// 開発サーバー起動後: BASE_URL=http://127.0.0.1:4321 node tests/e2e/column-cta-tracking.spec.mjs
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(
    `${process.env.BASE_URL || 'http://127.0.0.1:4321'}/column/project-management-02`,
    {
      waitUntil: 'networkidle',
    }
  );
  await page.evaluate(() => {
    window.auditEvents = [];
    window.gtag = (...args) => window.auditEvents.push(args);
    document.addEventListener('click', (event) => event.preventDefault(), true);
  });
  await page.locator('.column-cta-primary').click();
  const events = await page.evaluate(() =>
    window.auditEvents.filter((args) => args[1] === 'cta_click')
  );
  assert.equal(events.length, 1, '1回のCTAクリックを1件として計測する');
  console.log('CTAクリックの重複なし');
} finally {
  await browser.close();
}
