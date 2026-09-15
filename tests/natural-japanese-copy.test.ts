import { describe, expect, it } from 'vitest';
import {
  NATURAL_JAPANESE_REPLACEMENTS,
  naturalizeJapaneseCopy,
  naturalizePublishedHtml,
  shouldNaturalizePublishedPath,
} from '../src/lib/natural-japanese-copy';

describe('natural Japanese published copy', () => {
  it('replaces all registered before phrases', () => {
    for (const { before, after } of NATURAL_JAPANESE_REPLACEMENTS) {
      expect(naturalizeJapaneseCopy(before)).toBe(after);
    }
  });

  it('keeps intentional caveats intact', () => {
    const text = 'ただし万能ではありません。完全自動化を目指すのではなく、人が確認します。';
    expect(naturalizeJapaneseCopy(text)).toBe(text);
  });

  it('does not rewrite code examples inside pre blocks', () => {
    const html = '<p>現実解です。</p><pre><code>現実解</code></pre>';
    expect(naturalizePublishedHtml(html)).toBe(
      '<p>現実的な選択肢です。</p><pre><code>現実解</code></pre>'
    );
  });

  it('targets columns and LP routes but not APIs', () => {
    expect(shouldNaturalizePublishedPath('/column/example')).toBe(true);
    expect(shouldNaturalizePublishedPath('/knowledge/example')).toBe(true);
    expect(shouldNaturalizePublishedPath('/services/ai-development')).toBe(true);
    expect(shouldNaturalizePublishedPath('/situations/ai-adoption')).toBe(true);
    expect(shouldNaturalizePublishedPath('/case-studies')).toBe(true);
    expect(shouldNaturalizePublishedPath('/api/contact')).toBe(false);
  });
});
