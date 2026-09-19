import {
  BookOpen,
  BriefcaseBusiness,
  FileCheck2,
  FolderOpen,
  Layers,
  MessageSquare,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeroProps {
  /** 日本語タイトル（h1） */
  title: string | ReactNode;
  /** サブタイトル/説明文（オプション） */
  subtitle?: string;
  /** バッジテキスト（オプション） */
  badge?: string;
  /** 追加コンテンツ（CTAボタンなど） */
  children?: ReactNode;
}

export function PageHero({ title, subtitle, badge, children }: PageHeroProps) {
  const text = typeof title === 'string' ? title : '';
  const Icon = /プライバシー/.test(text)
    ? ShieldCheck
    : /問い合わせ|相談/.test(text)
      ? MessageSquare
      : /採用|メンバー|会社/.test(text)
        ? Users
        : /流れ|フロー|プロセス/.test(text)
          ? Workflow
          : /資料/.test(text)
            ? FolderOpen
            : /要件|RFP|スコープ/.test(text)
              ? FileCheck2
              : /コラム|ナレッジ|ブログ/.test(text)
                ? BookOpen
                : /発注|パートナー/.test(text)
                  ? BriefcaseBusiness
                  : Layers;
  return (
    <section className="relative overflow-hidden border-b border-neutral-300 bg-neutral-100 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="max-w-4xl">
          {/* バッジ */}
          {badge && (
            <p className="border-l-8 border-primary-500 pl-5 text-sm font-bold text-primary-700">
              {badge}
            </p>
          )}

          <div
            className="mt-6 inline-flex rounded-md border border-primary-100 bg-white p-3 text-primary-600"
            aria-hidden="true"
          >
            <Icon size={32} strokeWidth={1.75} />
          </div>

          {/* タイトル */}
          <h1 className="mt-6 text-4xl font-bold leading-tight text-accent-950 sm:text-5xl">
            {title}
          </h1>

          {/* サブタイトル */}
          {subtitle && (
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-neutral-700 md:text-xl">
              {subtitle}
            </p>
          )}

          {/* 追加コンテンツ（CTAボタンなど） */}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
