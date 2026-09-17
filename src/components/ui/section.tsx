import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

/**
 * Section コンポーネント
 */
const sectionVariants = cva('relative overflow-hidden', {
  variants: {
    variant: {
      white: 'bg-neutral-50',
      light: 'bg-neutral-100',
      lightPurple: 'bg-neutral-100',
      lightCyan: 'bg-neutral-100',
      primary: 'bg-primary-500',
      navy: 'bg-accent-950',
      cyan: 'bg-secondary-500',
      muted: 'bg-neutral-200',
    },

    // パディングバリアント
    padding: {
      none: '',
      sm: 'py-16 md:py-20',
      md: 'py-20 md:py-24',
      lg: 'py-24 md:py-32',
    },

    // 既存API互換用。新規デザインでは原則 none。
    grid: {
      none: '',
      light: '[&>.grid-pattern]:opacity-5',
      medium: '[&>.grid-pattern]:opacity-10',
      dark: '[&>.grid-pattern]:opacity-20',
    },
  },
  defaultVariants: {
    variant: 'white',
    padding: 'lg',
    grid: 'none',
  },
});

// 旧装飾名は互換性のため残し、現行デザインでは描画しない。
const decorationVariants = {
  blursPurple: null,
  blursCyan: null,
  blursMix: null,
  bars: null,
  barsDark: null,
  dots: null,
  dotsDark: null,
  full: null,
  fullDark: null,
  none: null,
};

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: 'section' | 'div' | 'article';
  container?: boolean;
  containerClass?: string;
  decoration?: keyof typeof decorationVariants;
  showGrid?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      variant,
      padding,
      grid,
      as: Component = 'section',
      container = true,
      containerClass,
      decoration = 'none',
      showGrid: _showGrid = false,
      children,
      ...props
    },
    ref
  ) => {
    void _showGrid;

    return (
      <Component
        className={cn(sectionVariants({ variant, padding, grid, className }))}
        ref={ref as React.Ref<HTMLElement>}
        {...props}
      >
        {/* 装飾要素 */}
        {decoration !== 'none' && (
          <div className="absolute inset-0 pointer-events-none">
            {decorationVariants[decoration]}
          </div>
        )}

        {/* コンテンツ */}
        {container ? (
          <div className={cn('container mx-auto px-8 lg:px-12 relative', containerClass)}>
            {children}
          </div>
        ) : (
          <div className="relative">{children}</div>
        )}
      </Component>
    );
  }
);
Section.displayName = 'Section';

const sectionLabelNotes: Record<string, string> = {
  CONTEXT: 'よくあるご相談',
  'WHY NOW': 'なぜ今、取り組むのか',
  'KNOWLEDGE SYSTEM': 'ナレッジシステムとは何か',
  'WHAT YOU GET': '導入すると、仕事がどう変わるのか',
  'THE PROBLEM': 'なぜ、作っただけでは使えないのか',
  'WHY RAG STOPS': 'なぜ、作っただけでは使えないのか',
  UNCERTAINTY: '何を作り、何を検証するか',
  'WHY BEEKLE': 'なぜBeekleに頼むのか',
  'HOW WE BUILD': 'どう設計し、どう作るのか',
  ARCHITECTURE: '検索方式の選び方',
  PROOF: '実績・導入事例',
  PROCESS: '進め方',
  CAPABILITIES: '対応できること',
  DELIVERABLES: '納品するもの',
  OPERATIONS: '本番運用・保守',
  'LIVE DEMOS': '実際のデモ',
  'RELATED COLUMNS': '関連記事',
  PRICE: '費用の目安',
  PRICING: '費用の目安',
  FAQ: 'よくある質問',
  'CLOUD DEPLOYMENT': 'クラウド構成',
  'RELATED GUIDES': '関連ガイド',
  'CASE STUDIES': '導入事例',
  'PAIN POINTS': '改善できる業務',
};

/**
 * SectionHeader コンポーネント
 *
 * セクションの見出し + サブテキスト + 番号ラベル
 */
interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  highlight?: string;
  centered?: boolean;
  dark?: boolean;
  className?: string;
  // 番号ラベル
  number?: string;
  label?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  highlight,
  centered = true,
  dark = false,
  className,
  number,
  label,
}) => {
  const labelNote = label ? sectionLabelNotes[label] : undefined;

  return (
    <div className={cn(centered && 'text-center', 'mb-16', className)}>
      {/* 番号ラベル */}
      {(number || label) && (
        <div className="mb-4">
          <div>
            {number && (
              <span
                className={cn(
                  'font-Poppins text-5xl font-bold',
                  dark ? 'text-white/80' : 'text-primary-500'
                )}
              >
                {number}
              </span>
            )}
            {label && (
              <span
                className={cn(
                  'ml-4 text-sm font-semibold tracking-wide uppercase',
                  dark ? 'text-white/70' : 'text-primary-500'
                )}
              >
                {label}
              </span>
            )}
          </div>
          {labelNote && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                dark ? 'text-white/65' : 'text-neutral-500'
              )}
            >
              {labelNote}
            </p>
          )}
        </div>
      )}
      <h2
        className={cn('text-4xl lg:text-5xl font-bold mb-6', dark ? 'text-white' : 'text-navy-950')}
      >
        {typeof title === 'string' && highlight ? (
          <>
            {title.split(highlight)[0]}
            <span className={dark ? 'text-secondary-400' : 'text-primary-500'}>{highlight}</span>
            {title.split(highlight)[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle && (
        <p className={cn('text-xl', dark ? 'text-white/90' : 'text-neutral-600')}>{subtitle}</p>
      )}
    </div>
  );
};

export { Section, SectionHeader, sectionVariants };
