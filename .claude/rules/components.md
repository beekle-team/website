# Component Rules

## UI Components (src/components/ui/)

共通UIコンポーネントは `@/components/ui/` から import

```typescript
import { Button, Card, Section, SectionHeader } from '@/components/ui';
```

## Section Component

```tsx
<Section variant="white" padding="lg" decoration="blursPurple">
  <SectionHeader
    title="タイトル"
    subtitle="サブタイトル"
    number="01"
    label="SERVICE"
  />
  {/* コンテンツ */}
</Section>
```

### Section Variants
- `white` - 白背景（デフォルト）
- `light` - ライトグレー
- `lightPurple` - 薄いパープルグラデーション
- `lightCyan` - 薄いシアングラデーション
- `navy` - ダークネイビー（白文字）
- `primary` - Beekle Purple（白文字）

### Decorations
- `blursPurple` - パープルぼかし
- `blursCyan` - シアンぼかし
- `bars` - 斜めバー
- `dots` - ドット装飾
- `none` - 装飾なし

## container mx-auto の幅は px-8 lg:px-12 で統一する（2026-09-19 事故対応）

`Section` コンポーネントの標準は `container mx-auto px-8 lg:px-12`。ページ内で `<div class="container mx-auto ...">` を手書きするとき、`px-6 lg:px-12` 等の別値を混ぜると同一ページ内でコンテナ幅がズレて「レイアウトぐちゃぐちゃ」に見える（本文と見出しの左右端が揃わない）。

- 事例: `/prooffirst` と全サービスページ配下 24ファイルで `px-6 lg:px-12` が混在し本番で目視できるレベルの崩れが発生。PR #249 で `px-8 lg:px-12` に統一。
- 新しいセクションを書く時は、まず `Section` コンポーネントで書けないか検討する。やむを得ず手書きする時は `container mx-auto px-8 lg:px-12` にする。
- 検証: `bun run check:container-width`（`scripts/check-container-width.mjs`）で `container mx-auto` を持つ全 `.astro`/`.tsx` の padding を機械チェックできる。**CI には未接続**（PR #249 修正時点で対象外の86箇所が残っており、strict化すると無関係なPRを巻き込んで壊れるため）。既存の残債を段階的に潰してから `check:ci` に組み込む。

## React Component Pattern

```tsx
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  // ...
}

export function MyComponent({ className, ...props }: Props) {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {/* ... */}
    </div>
  );
}
```

## Animation (Framer Motion)

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
>
```

# コラムの監修者(reviewer)はカテゴリ/スラッグ単位でコード管理。可視バイラインとJSON-LDは別経路

コラム記事の著者・監修情報は `src/data/authors.ts` で管理（MicroCMSフィールドではない）。
- `authors`: Person定義(tsuruoka=鶴岡/代表, nakamura=中村/外部技術顧問, sato=佐藤/データサイエンティスト)。`defaultAuthor=tsuruoka`, `defaultReviewer=nakamura`。
- `categoryReviewerMap`: カテゴリ→監修者。ai-development/genai-adoption/cdp-development/**knowledge**=sato（2026-07-05 knowledge追加）。未マッピングのカテゴリは defaultReviewer(中村)。
- `slugReviewerMap`(2026-07-05新設): スラッグ単位上書き(カテゴリより優先)。knowledgeのうち要件系 ears-gherkin-workflow/gherkin-bdd-introduction/ears-requirements-syntax-guide は中村に据え置き(PM領域)。
- `src/pages/column/[...slug].astro:250` で `reviewerId = slugReviewerMap[id] ?? categoryReviewerMap[category]` を解決。

## 表示は2経路、両方に reviewerId を渡すこと(2026-07-05のバグ)
1. 可視バイライン `components/seo/author-byline.astro`(compact+detailed) ← reviewerId を props で受け正しく表示。
2. 構造化データ `components/seo/json-ld.astro`(type="article" の reviewedBy) ← **data.reviewerId から生成**。slug側で article JsonLd の data に reviewerId を渡していなかったため、reviewedBy が常に defaultReviewer(中村)固定で、可視バイライン(佐藤等)と不一致だった。→ `[...slug].astro` の article JsonLd data に `reviewerId,` を追加して修正(PR #80)。
- 教訓: 著者・監修を変えたら**可視バイラインとJSON-LDの両方**を確認する(curlで `"reviewedBy":...#sato` と表示名の両方をgrep)。片方だけ直すとE-A-T不整合。
- コード変更なのでデプロイ必須(Cloudflare gitビルド)。関連: [[project_llmo_content_map]](著者情報明示=E-E-A-T)。
