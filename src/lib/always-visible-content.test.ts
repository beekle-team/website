import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const contentFiles = [
  'components/careers-contact-form.tsx',
  'components/contact-form.tsx',
  'components/process-steps.tsx',
  'components/rfp-builder.tsx',
  'components/services/ai-dx-service-page.astro',
  'components/services/service-faq.astro',
  'components/services/service-pain-points.astro',
  'components/services/service-solutions.astro',
  'components/testimonial-section.tsx',
  'pages/column/[...slug].astro',
  'pages/contact.astro',
  'pages/index.astro',
  'pages/partner.astro',
  'pages/prooffirst.astro',
  'pages/qa.astro',
  'pages/services/ai-development.astro',
  'pages/strengths.astro',
] as const;

describe('読むための情報を常時表示する', () => {
  it.each(contentFiles)('%s で開閉操作を要求しない', (path) => {
    const source = readFileSync(resolve(process.cwd(), 'src', path), 'utf8');

    expect(source).not.toMatch(/<details\b/);
    expect(source).not.toMatch(/<summary\b/);
    expect(source).not.toMatch(/クリックで詳細/);
    if (path === 'components/testimonial-section.tsx') {
      expect(source).not.toMatch(/全文を見る|全文を閉じる|expanded/);
    }
  });
});
