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
  it('keeps the RAG LP in the approved buyer-story order', () => {
    const source = readSource('../pages/services/rag-system-development.astro');
    const positions = [
      indexOfCopy(source, 'label="KNOWLEDGE SYSTEM"'),
      indexOfCopy(source, 'label="WHAT YOU GET"'),
      indexOfCopy(source, 'label="WHY NOW"'),
      indexOfCopy(source, 'label="WHY RAG STOPS"'),
      indexOfCopy(source, 'label="WHY BEEKLE"'),
      indexOfCopy(source, 'label="HOW WE BUILD"'),
      indexOfCopy(source, '<ServiceCaseStudies'),
      indexOfCopy(source, '<ServiceSolutions'),
      indexOfCopy(source, '<ServiceFeatures'),
      indexOfCopy(source, 'label="DELIVERABLES"'),
      indexOfCopy(source, 'label="OPERATIONS"'),
      indexOfCopy(source, '<ServiceRagPricing'),
      indexOfCopy(source, 'label="ARCHITECTURE"'),
      indexOfCopy(source, '<ServiceRagDeploymentModes'),
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
