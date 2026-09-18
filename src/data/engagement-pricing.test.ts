import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AI_PAIR,
  PROJECT_MONTHS,
  ROLE_RATES,
  pocEstimate,
  pocEstimateMin,
  projectEstimate,
} from './engagement-pricing';
import { serviceModelCases } from './service-model-cases';

const root = resolve(import.meta.dirname, '../..');
const strengthsSource = readFileSync(resolve(root, 'src/pages/strengths.astro'), 'utf8');

describe('engagement pricing (zero-start scope + PoC estimate)', () => {
  it('computes the PoC estimate from the published rate floors only', () => {
    expect(pocEstimateMin({ members: AI_PAIR, monthsMin: 1 })).toBe(128 + 80);
    expect(pocEstimateMin({ members: AI_PAIR, monthsMin: 1.5 })).toBe(Math.round((128 + 80) * 1.5));
    expect(pocEstimate({ members: AI_PAIR, monthsMin: 1 })).toBe(
      'AIエンジニア1名＋エンジニア1名 × 1か月〜、約208万円〜（税別）'
    );
    expect(pocEstimate({ members: AI_PAIR, monthsMin: 1.5 })).toBe(
      'AIエンジニア1名＋エンジニア1名 × 1.5か月〜、約312万円〜（税別）'
    );
  });

  it('states the whole-project budget as a decision axis (3〜4か月 at the same team)', () => {
    expect(PROJECT_MONTHS).toEqual({ monthsMin: 3, monthsMax: 4 });
    expect(projectEstimate({ members: AI_PAIR, ...PROJECT_MONTHS })).toBe(
      'AIエンジニア1名＋エンジニア1名 × 3〜4か月なら、約624万〜832万円（税別）'
    );
  });

  it('keeps /strengths#rates as the single source of the role rates', () => {
    expect(strengthsSource).toContain("from '../data/engagement-pricing'");
    expect(strengthsSource).not.toMatch(/hourly: '4,000/);
    for (const rate of ROLE_RATES) {
      expect(rate.monthlyMin).toBeGreaterThan(0);
      expect(rate.monthly.startsWith(String(rate.monthlyMin))).toBe(true);
    }
  });

  it('gives every service model case a zero-yen scope and a computed PoC estimate', () => {
    for (const [id, section] of Object.entries(serviceModelCases)) {
      const text = section.paragraphs?.join('\n') ?? '';
      expect(text, id).toContain('0円の叩き台で作る範囲:');
      expect(text, id).toMatch(
        /PoCの体制と費用の目安: AIエンジニア1名＋エンジニア1名 × 1(\.5)?か月〜、約\d+万円〜（税別）/
      );
      const contractCard = section.cards?.find(
        (card) => card.title === '期間・契約（モデルケース）'
      );
      expect(text, id).toContain(
        '全体の予算の目安（PoCから本番展開まで）: 多くの案件はAIエンジニア1名＋エンジニア1名 × 3〜4か月なら、約624万〜832万円（税別）'
      );
      expect(contractCard?.description, id).toMatch(
        /PoCの目安は.*万円〜（税別）。全体は.*約624万〜832万円（税別）。$/
      );
    }
  });
});
