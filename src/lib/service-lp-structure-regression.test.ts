import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');

const indexOfCopy = (source: string, copy: string) => {
  const index = source.indexOf(copy);
  expect(index, `${copy} should exist`).toBeGreaterThanOrEqual(0);
  return index;
};

describe('service LP structure regression', () => {
  it('keeps the current RAG LP in the approved buyer-story order', () => {
    const source = readSource('../pages/services/rag-system-development.astro');
    const positions = [
      indexOfCopy(source, '<ServiceHero'),
      indexOfCopy(source, 'label="USE CASES"'),
      indexOfCopy(source, 'label="WHY NOW"'),
      indexOfCopy(source, 'label="WHY BEEKLE"'),
      indexOfCopy(source, '<ServiceCaseStudies'),
      indexOfCopy(source, 'label="PLAN & PRICING"'),
      indexOfCopy(source, 'label="DELIVERY & OPERATIONS"'),
      indexOfCopy(source, '<ServiceRagDeploymentModes'),
      indexOfCopy(source, '<ServiceFaq'),
      indexOfCopy(source, 'label="RELATED GUIDES"'),
      indexOfCopy(source, '<AskAiSection'),
    ];

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('does not inject Japanese label notes into every SectionHeader site-wide', () => {
    const source = readSource('../components/ui/section.tsx');
    expect(source).not.toContain('sectionLabelNotes');
  });

  it('keeps the general AI-development page broader than RAG', () => {
    const source = readSource('../pages/services/ai-development.astro');
    for (const copy of ['AIエージェント', 'AI OCR・帳票読み取り', 'RAG / GraphRAG']) {
      expect(source).toContain(copy);
    }
    expect(source).not.toContain('label="WHY RAG STOPS"');
  });
});
