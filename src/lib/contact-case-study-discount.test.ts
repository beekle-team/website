import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const contactPage = readFileSync(resolve(process.cwd(), 'src/pages/contact.astro'), 'utf8');

describe('contact case-study discount offer', () => {
  it('shows the anonymous and named-publication discount tiers', () => {
    expect(contactPage).toContain('匿名の導入事例公開');
    expect(contactPage).toContain('5%OFF');
    expect(contactPage).toContain('社名・ロゴ付きで導入実績を公開');
    expect(contactPage).toContain('10%OFF');
    expect(contactPage).toContain('掲載内容・公開時期は事前に確認');
  });
});
