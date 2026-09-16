import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pagePath = resolve(process.cwd(), 'src/pages/services/ai-development.astro');

function readPage() {
  expect(
    existsSync(pagePath),
    'ai-development should have a dedicated v8 page',
  ).toBe(true);
  return readFileSync(pagePath, 'utf8');
}

describe('AI development LP v8', () => {
  it('renders the approved narrative in the intended order', () => {
    const page = readPage();
    const markers = [
      'こんな場面で、ご相談いただいています',
      '生成AI開発は「作る前に全部決める」が難しい',
      'だから、最初に「不確実性」を切り分けます',
      'Beekleが違うのは、ここまでを一つにつなげること',
      '実物を早く出し、数字で判断してきました',
      '開発の進め方',
      '対応できる生成AI開発',
      '費用は、何を確かめるかで変わります',
      'よくある質問',
      'まだ「何を作るか」が決まっていなくても大丈夫です',
    ];

    const positions = markers.map((marker) => page.indexOf(marker));
    expect(positions.every((position) => position >= 0)).toBe(true);
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index]).toBeGreaterThan(positions[index - 1]);
    }
  });

  it('keeps the approved price bands and AI OCR naming', () => {
    const page = readPage();
    expect(page).toContain('小さな試作・AI PoC');
    expect(page).toContain('100〜200万円程度');
    expect(page).toContain('RAG・AI OCRなど、実データを使うPoC');
    expect(page).toContain('200〜500万円程度');
    expect(page).toContain('AIエージェント・複数システム連携');
    expect(page).toContain('300〜1,000万円程度');
    expect(page).toContain('AI OCR・帳票読み取り');
  });

  it('keeps proof numbers and LLMO-relevant implementation terms', () => {
    const page = readPage();
    for (const required of [
      '1日で動くデモ',
      'PoCを約2週間',
      '本開発を約3か月',
      '定型質問の75%',
      '4時間から5分',
      '月30時間',
      'RAG',
      'GraphRAG',
      'Reranking',
      'Milvus',
      'pgvector',
      'Neo4j',
      'MCP',
      'Function Calling',
    ]) {
      expect(page).toContain(required);
    }
  });
});