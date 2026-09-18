// 開発サーバー起動後: node tests/e2e/service-hero-responsive.spec.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium, webkit } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4321';
const failures = [];
const serviceIds = ['service.ts', 'industry-services.ts'].flatMap((file) =>
  [
    ...readFileSync(new URL(`../../src/data/${file}`, import.meta.url), 'utf8').matchAll(
      /^ {4}id: '([^']+)'/gm
    ),
  ].map((match) => match[1])
);
const paths = [
  '/',
  '/services/management-dx',
  '/services/ai-adoption',
  ...serviceIds.map((id) => `/services/${id}`),
];

for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage();
    for (const path of paths) {
      for (const width of [320, 390, 640, 768, 1024, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const response = await page.goto(`${baseUrl}${path}`);
        assert.equal(response.status(), 200);
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => {
          const elements = [
            ...document.querySelectorAll(
              'main h1, main h2, main h3, main p, main a, main aside, main table, header a, footer a'
            ),
          ];
          return elements.flatMap((element) => {
            const bounds = element.getBoundingClientRect();
            if (
              !bounds.width ||
              !bounds.height ||
              getComputedStyle(element).visibility === 'hidden'
            )
              return [];
            // 意図的に横スクロールさせる比較表は、外側の枠を別途確認する。
            for (let parent = element.parentElement; parent; parent = parent.parentElement) {
              if (['auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) return [];
            }
            const range = document.createRange();
            range.selectNodeContents(element);
            const boxes = [bounds, ...range.getClientRects()];
            return boxes.some((box) => box.left < -1 || box.right > window.innerWidth + 1)
              ? [`${element.tagName}: ${element.textContent.trim().slice(0, 45)}`]
              : [];
          });
        });
        if (overflow.length) failures.push({ engine: engine.name(), path, width, overflow });
        if (path === '/' && width >= 1024) {
          for (const trigger of await page.locator('header.fixed nav > ul button:visible').all()) {
            await trigger.hover();
            const panel = trigger.locator('..').locator('div').first();
            const bounds = await panel.boundingBox();
            if (bounds.x < 0 || bounds.x + bounds.width > width + 1) {
              failures.push({ engine: engine.name(), width, menu: await trigger.innerText() });
            }
          }
          await page.mouse.move(0, 899);
        }
      }
      console.log(`${engine.name()} ${path}: checked`);
    }
  } finally {
    await browser.close();
  }
}

assert.deepEqual(failures, [], 'サービスの見出し・本文・CTAが画面内に収まること');
