import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8');

describe('画像で読み進める構成の追加修正', () => {
  it('AI開発の説明カードと工程を2列以内にする', () => {
    const page = read('pages/services/ai-development.astro');

    expect(page).not.toContain('lg:grid-cols-4');
    expect(page).not.toContain('md:grid-cols-3');
    expect(page).not.toContain('sm:grid-cols-4');
    expect(page).not.toContain('md:grid-cols-5');
  });

  it('経営DXの実績は判断までの図を先に見せ、カードを2列以内にする', () => {
    const component = read('components/services/management-dx-evidence.astro');
    const visuals = read('data/section-visuals.ts');

    expect(component).toContain('<SectionVisual name="management-data-flow-v1" />');
    expect(visuals).toContain("'management-data-flow-v1': {");
    expect(component).not.toContain('lg:grid-cols-3');
  });

  it('相談場面とソリューションの詳細情報を2列以内にする', () => {
    const situations = read('pages/situations/index.astro');
    const situation = read('pages/situations/[slug].astro');
    const solutions = read('pages/solutions.astro');

    expect(situations).not.toContain('sm:grid-cols-3');
    expect(situation).not.toContain('lg:grid-cols-3');
    expect(solutions).not.toContain('sm:grid-cols-3');
  });

  it('プライバシーポリシーの長いURLをスマートフォン幅で折り返す', () => {
    const page = read('pages/privacy.astro');

    expect(page).toContain('[overflow-wrap:anywhere]');
  });

  it('RAGとAI導入の説明カードも2列以内にする', () => {
    const rag = read('pages/services/rag-system-development.astro');
    const overview = read('components/services/ai-development-overview.astro');
    const session = read('components/services/management-dx-session.astro');

    expect(rag).not.toContain('md:grid-cols-3');
    expect(overview).not.toContain('md:grid-cols-4');
    expect(session).not.toContain('md:grid-cols-3');
  });

  it('コラムの最初の図を目次より前に見せ、本文では重複させない', () => {
    const page = read('pages/column/[...slug].astro');
    const leadVisual = page.indexOf('<Fragment set:html={leadFigureHtml} />');
    const toc = page.indexOf('{/* Table of Contents */}');

    expect(page).toContain('const leadFigureMatch = htmlContent.match(');
    expect(leadVisual).toBeGreaterThan(0);
    expect(leadVisual).toBeLessThan(toc);
    expect(page).toContain('!leadFigureHtml && !/<img\\b/i.test(htmlContent)');
    expect(page).toContain('<main class="overflow-x-clip bg-neutral-100 pt-20">');
  });
});
