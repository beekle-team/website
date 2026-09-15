export type CopyReplacement = {
  before: string;
  after: string;
  reason: string;
};

// 公開文面だけに適用する保守的な置換。
// 事実・数値・検索意図は変えず、AI的な比喩や定型表現だけを直す。
// 本人の主張として意図的に強く言っている断定や、「一気通貫」のような事業上の訴求は弱めない。
export const NATURAL_JAPANESE_REPLACEMENTS: CopyReplacement[] = [
  {
    before: '最強の交渉カード',
    after: '有効な交渉材料',
    reason: '煽りの強い比喩を、意味を保った通常のビジネス表現へ変更',
  },
  {
    before: '時限爆弾',
    after: '将来のリスク要因',
    reason: '刺激の強い比喩を具体的な意味へ置換',
  },
  {
    before: 'クラウドに移住しただけです',
    after: 'システム上に移しただけです',
    reason: 'AI的な比喩を直接的な表現へ変更',
  },
  {
    before: 'クラウドに移住しただけ',
    after: 'システム上に移しただけ',
    reason: 'AI的な比喩を直接的な表現へ変更',
  },
  {
    before: '現実解',
    after: '現実的な選択肢',
    reason: '定型的なAI表現を、意味が明確な日本語へ変更',
  },
  {
    before: '本質的な価値',
    after: '実際の価値',
    reason: '抽象語を減らし、判断対象を直接示す',
  },
  {
    before: '本質的価値',
    after: '実際の価値',
    reason: '抽象語を減らし、判断対象を直接示す',
  },
  {
    before: '圧倒的に',
    after: '大幅に',
    reason: '誇張を避け、程度を示す通常表現へ変更',
  },
  {
    before: '圧倒的な',
    after: '大きな',
    reason: '誇張を避け、程度を示す通常表現へ変更',
  },
  {
    before: '劇的に',
    after: '大きく',
    reason: '誇張を避け、変化量を示す通常表現へ変更',
  },
  {
    before: '劇的な',
    after: '大きな',
    reason: '誇張を避け、変化量を示す通常表現へ変更',
  },
  {
    before: '手書きは完全自動化を狙うと事故ります。',
    after: '手書きを完全自動化すると、誤読を見逃しやすくなります。',
    reason: '口語的な「事故る」を、具体的なリスクへ変更',
  },
  {
    before: '推測で答えない設計を徹底します。',
    after: '推測で答えないようにします。',
    reason: '強調語を減らし、挙動を直接説明',
  },
];

export function naturalizeJapaneseCopy(text: string): string {
  let result = text;
  for (const replacement of NATURAL_JAPANESE_REPLACEMENTS) {
    result = result.split(replacement.before).join(replacement.after);
  }
  return result;
}

const TARGET_PATH_PREFIXES = ['/column/', '/knowledge/', '/services/', '/situations/'];
const TARGET_EXACT_PATHS = new Set([
  '/',
  '/solutions',
  '/prooffirst',
  '/case-studies',
  '/strengths',
]);

export function shouldNaturalizePublishedPath(pathname: string): boolean {
  return (
    TARGET_EXACT_PATHS.has(pathname) ||
    TARGET_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function naturalizePublishedHtml(html: string): string {
  // 記事のコード例は文章校正の対象外。退避してから本文・見出し・meta/JSON-LDを揃えて直す。
  const protectedBlocks: string[] = [];
  const protectedHtml = html.replace(/<pre\b[\s\S]*?<\/pre>/gi, (block) => {
    const marker = `__NATURAL_JAPANESE_PRE_${protectedBlocks.length}__`;
    protectedBlocks.push(block);
    return marker;
  });

  let result = naturalizeJapaneseCopy(protectedHtml);
  protectedBlocks.forEach((block, index) => {
    result = result.replace(`__NATURAL_JAPANESE_PRE_${index}__`, block);
  });
  return result;
}
