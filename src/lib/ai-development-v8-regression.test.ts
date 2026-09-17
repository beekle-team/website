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

describe('AI development v8 LP regression', () => {
  it('keeps the approved pricing and technical terms without the old PoC price floors', () => {
    for (const copy of [
      '50〜200万円程度',
      '50〜500万円程度',
      '300〜1,000万円程度',
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

    expect(source).not.toContain('100〜200万円程度');
    expect(source).not.toContain('200〜500万円程度');
    expect(source).not.toContain('200〜400万円前後');
  });

  it('preserves the existing AI-development assets around the approved v8 narrative', () => {
    for (const copy of [
      "import { AskAiButton } from '@/components/ask-ai-button';",
      "import { AskAiSection } from '@/components/ask-ai-section';",
      "import ServiceCaseStudies from '@/components/services/service-case-studies.astro';",
      "import { services } from '@/data/service';",
      '<ServiceCaseStudies',
      'caseStudies={aiDevelopmentService.caseStudies}',
      '/demos/it-advisor',
      '/demos/ocr',
      'relatedColumns.map',
      '<AskAiSection',
      '<AskAiButton',
    ]) {
      expect(source).toContain(copy);
    }
  });

  it('keeps proof and existing cases before process, then capabilities, price, FAQ, AI Q&A, and final CTA', () => {
    const positions = [
      indexOfCopy('label="PROOF"'),
      indexOfCopy('<ServiceCaseStudies'),
      indexOfCopy('label="PROCESS"'),
      indexOfCopy('label="CAPABILITIES"'),
      indexOfCopy('label="PRICE"'),
      indexOfCopy('label="FAQ"'),
      indexOfCopy('<AskAiSection'),
      indexOfCopy('services-ai-development-final'),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});
