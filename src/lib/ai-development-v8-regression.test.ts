import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(import.meta.dirname, '../pages/services/ai-development.astro'),
  'utf8'
);

const indexOfCopy = (copy: string) => {
  const index = source.indexOf(copy);
  expect(index, `${copy} should exist in ai-development.astro`).toBeGreaterThanOrEqual(0);
  return index;
};

describe('AI development LP regression', () => {
  it('keeps the zero-start pricing flow and technical terms without fixed price tiers', () => {
    for (const copy of [
      "price: '0円'",
      "price: '準委任（月額）'",
      '単価は職種別に公開',
      'AI OCR・帳票読み取り',
      'GraphRAG',
      'Reranking',
      'Milvus',
      'pgvector',
      'Neo4j',
      'MCP',
      'Function Calling',
    ]) {
      expect(source).toContain(copy);
    }

    expect(source).not.toContain('200〜400万円前後');
    for (const fixedTier of [
      '30〜80万円程度',
      '100〜200万円程度',
      '200〜500万円程度',
      '300〜1,000万円程度',
      '600〜1,200万円程度',
    ]) {
      expect(source).not.toContain(fixedTier);
    }
  });

  it('keeps access to cases, demos, guidance, and the existing conversion routes', () => {
    for (const copy of [
      "import { AskAiButton } from '@/components/ask-ai-button';",
      "import { services } from '@/data/service';",
      'href="/case-studies"',
      '/demos/it-advisor',
      '/demos/ocr',
      '/column/genai-introduction-complete-guide',
      '/downloads/beekle-zero-start-sales-deck.pdf',
      'services-ai-development-hero&intent=ai-development',
      'services-ai-development-price&intent=ai-development',
      'services-ai-development-final&intent=ai-development',
      'relatedColumns.map',
      '<AskAiButton',
    ]) {
      expect(source).toContain(copy);
    }
  });

  it('connects business value, Beekle strengths, proof, pricing, and contact in reading order', () => {
    const positions = [
      indexOfCopy('id="why-now"'),
      indexOfCopy('id="why-beekle"'),
      indexOfCopy('id="how"'),
      indexOfCopy('id="proof"'),
      indexOfCopy('id="plan-pricing"'),
      indexOfCopy('id="capabilities"'),
      indexOfCopy('id="faq"'),
      indexOfCopy('services-ai-development-final'),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});
