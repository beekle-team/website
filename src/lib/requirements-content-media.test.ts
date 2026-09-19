import { describe, expect, it } from 'vitest';
import { upgradeRequirementsContent } from './requirements-content-upgrades.js';

describe('requirements content media', () => {
  it('preserves a CMS figure, caption and alt when its section is rewritten', () => {
    const figure =
      '<figure><img src="https://example.com/rfp.webp" alt="発注範囲"><figcaption>発注する範囲を確認する図</figcaption></figure>';
    const source = `<h2>RFPとは何か</h2><p>old</p>${figure}`;
    const result = upgradeRequirementsContent('how-to-write-rfp', source);
    expect(result).toContain(figure);
    expect(upgradeRequirementsContent('how-to-write-rfp', result).split(figure)).toHaveLength(2);
  });
});
