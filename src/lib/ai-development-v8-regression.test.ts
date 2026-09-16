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
  it('keeps the approved pricing and technical terms without the old 200〜400万円 wording', () => {
    for (const copy of [
      '100〜200万円程度',
      '200〜500万円程度',
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

  it('pairs decorative English labels with Japanese explanations', () => {
    for (const [label, note] of [
      ['CONTEXT', 'よくあるご相談'],
      ['WHY NOW', 'なぜ今、生成AI開発に取り組むのか'],
      ['UNCERTAINTY', '何を作り、何を検証するか'],
      ['WHY BEEKLE', 'なぜBeekleに頼むのか'],
      ['PROOF', '実績・導入事例'],
      ['PROCESS', '開発の進め方'],
      ['CAPABILITIES', '対応できること'],
      ['LIVE DEMOS', '実際のAIデモ'],
      ['RELATED COLUMNS', '関連記事'],
      ['PRICE', '費用の目安'],
      ['FAQ', 'よくある質問'],
    ]) {
      expect(source).toContain(`label=\"${label}\"`);
      expect(source).toContain(`labelNote=\"${note}\"`);
    }

    expect(source).toContain('GENERATIVE AI DEVELOPMENT</p>\n          <p class=\"mt-1 text-sm font-medium text-neutral-600\">生成AI受託開発</p>');
    expect(source).toContain('NEXT STEP</p>\n        <p class=\"mb-4 text-sm font-medium text-white/70\">ご相談について</p>');
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
