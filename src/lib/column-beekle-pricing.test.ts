import { describe, expect, it } from 'vitest';
import { renderColumnVisuals } from './column-visuals';

describe('Beekle pricing block in market-rate columns', () => {
  it('renders each variant with amounts derived from the published rate table', () => {
    const ai = renderColumnVisuals('<p>{{BEEKLE_PRICING_AI}}</p>');
    const web = renderColumnVisuals('<p>{{BEEKLE_PRICING_WEB}}</p>');
    const data = renderColumnVisuals('<p>{{BEEKLE_PRICING_DATA}}</p>');

    // AIエンジニア128 + エンジニア80 = 208/月 → 3〜4か月で624〜832
    expect(ai).toContain('約208万円〜（税別）');
    expect(ai).toContain('約624万〜832万円（税別）');
    // エンジニア80 + デザイナー64 = 144/月 → 432〜576
    expect(web).toContain('約144万円〜（税別）');
    expect(web).toContain('約432万〜576万円（税別）');
    // エンジニア2名 = 160/月 → 480〜640
    expect(data).toContain('約160万円〜（税別）');
    expect(data).toContain('約480万〜640万円（税別）');
  });

  it('keeps the zero-start entry and points at the published rates', () => {
    const html = renderColumnVisuals('{{BEEKLE_PRICING_AI}}');
    expect(html).toContain('合わなければここで終了し、費用は発生しません');
    expect(html).toContain('href="/strengths#rates"');
    expect(html).toContain('固定の価格表は置いていません');
    expect(html).not.toContain('{{');
  });

  it('leaves unrelated markers untouched', () => {
    expect(renderColumnVisuals('<p>{{UNKNOWN_MARKER}}</p>')).toContain('{{UNKNOWN_MARKER}}');
  });
});
