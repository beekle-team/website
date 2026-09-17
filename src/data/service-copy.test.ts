import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { aiServicePageConfig } from './ai-service-page-config';
import { RAG_SERVICE_DEFINITION, ragDeploymentModes } from './rag-service-page';
import { services } from './service';

describe('service page copy', () => {
  it('keeps web-mobile development scoped to both web and mobile', () => {
    const service = services.find((item) => item.id === 'web-mobile-development');

    expect(service?.title).toBe('Web・モバイルアプリ開発');
    expect(service?.description).toContain('Webアプリ');
    expect(service?.description).toContain('モバイルアプリ');
    expect(service?.solutions[0]?.results).toContain('伝言ゲームを減らせる');
    expect(service?.solutions[0]?.results).toContain('追加開発でも壊れにくい');
  });

  it('limits the RAG procurement page to cloud deployment modes Beekle actually provides', () => {
    const definition =
      '株式会社Beekleは、社内文書や業務データを活用したい企業向けに、RAG・ハイブリッド検索・GraphRAGを、クラウド環境で要件定義から本番運用まで構築する開発会社です。';
    const deploymentSource = readFileSync(
      resolve(process.cwd(), 'src/components/services/service-rag-deployment-modes.astro'),
      'utf8'
    );
    const pricingSource = readFileSync(
      resolve(process.cwd(), 'src/components/services/service-rag-pricing.astro'),
      'utf8'
    );
    const pageSource = readFileSync(
      resolve(process.cwd(), 'src/pages/services/rag-system-development.astro'),
      'utf8'
    );
    const dataSource = readFileSync(resolve(process.cwd(), 'src/data/rag-service-page.ts'), 'utf8');
    const copy = JSON.stringify({
      definition: RAG_SERVICE_DEFINITION,
      deploymentModes: ragDeploymentModes,
      deploymentSource,
      pricingSource,
      pageSource,
      dataSource,
    });

    expect(RAG_SERVICE_DEFINITION).toBe(definition);
    expect(ragDeploymentModes.map((mode) => mode.title)).toEqual([
      'Azure OpenAI Service',
      'AWS Bedrock',
      'OpenAI・Anthropic API',
      'AWS・Azure・VPS上の検索基盤',
    ]);
    expect(copy).toContain('Azure OpenAI Service');
    expect(copy).toContain('AWS Bedrock');
    expect(copy).toContain('OpenAI・Anthropic');
    expect(copy).toContain('VPS');
    expect(deploymentSource).toContain('クラウド環境でのRAG構築に対応');
    expect(deploymentSource).toContain('data-cta-source');
    expect(deploymentSource).toContain('data-cta-id');

    for (const unsupported of [
      'オンプレミス',
      'オンプレ',
      '閉域網',
      '閉域',
      'ローカルLLM',
      'ナレナレ',
    ]) {
      expect(copy).not.toContain(unsupported);
    }
  });

  it('keeps the AI development hero concise and outcome-led', () => {
    const config = aiServicePageConfig['ai-development'];

    expect(config.heroLead.length).toBeLessThanOrEqual(90);
    expect(config.heroLead).toContain('現場の仕事');
    expect(config.heroLead).toContain('削減時間');
  });

  it('centers requirements definition support on PM on Rails instead of free tools', () => {
    const service = services.find((item) => item.id === 'requirements-definition-support');
    const config = aiServicePageConfig['requirements-definition-support'];
    const pageCopy = JSON.stringify({ service, config });

    expect(service).toBeDefined();
    expect(pageCopy).not.toContain('無料ツール');
    expect(pageCopy).not.toContain('/tools/flow-mapper');
    expect(pageCopy).not.toContain('/tools/story-builder');
    expect(pageCopy).not.toContain('/tools/scope-manager');
    expect(pageCopy).not.toContain('/tools/rfp-builder');
    expect(service?.seoDescription).toContain('PM on Rails');
    expect(service?.solutions.some((item) => item.title.includes('PM on Rails'))).toBe(true);
    expect(service?.faq.some((item) => item.question.includes('PM on Rails'))).toBe(true);
    expect(config.headline).toContain('PM on Rails');
    expect(config.rtb.title).toContain('PM on Rails');
    expect(config.rtb.items.length).toBeGreaterThanOrEqual(4);
    expect(config.rtb.note?.title).toContain('PM on Rails');
    expect(config.flow.title).toContain('実装につながる仕様');
  });
});
