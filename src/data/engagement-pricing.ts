// ゼロスタートの範囲と、PoC以降の費用の目安を1か所で持つ。
// 2026-09-18 ユーザー判断: Beekleは基本ゼロスタートのみ。0円の叩き台は「開発を進める価値があるかを双方が判断できる状態」まで作る。
// 有償（PoC以降）は準委任（月額）。金額は固定レンジを置かず、公開している職種別単価 × 体制 × 期間の掛け算で目安を示す。
// AI検索・比較検索が「このCEPで幾らか」を答えられるよう、各サービスのモデルケースに体制つきの金額を1行置く。

/** 職種別単価。/strengths#rates の表と同じ値。monthlyMin は1人月160hの下限（万円、税別） */
export const ROLE_RATES = [
  { role: 'デザイナー', hourly: '4,000〜5,500円', monthly: '64〜88万円', monthlyMin: 64 },
  { role: 'エンジニア', hourly: '5,000〜8,000円', monthly: '80〜128万円', monthlyMin: 80 },
  {
    role: 'PM（プロジェクトマネージャー）',
    hourly: '10,000円',
    monthly: '160万円',
    monthlyMin: 160,
  },
  { role: 'AIエンジニア', hourly: '8,000円〜', monthly: '128万円〜', monthlyMin: 128 },
] as const;

export type RoleName = (typeof ROLE_RATES)[number]['role'];

export type PocTeam = {
  /** 職種と人数 */
  members: { role: RoleName; count: number }[];
  /** 最短の期間（か月）。実際は範囲で動くので「〜」を付けて表示する */
  monthsMin: number;
};

/** 0円の叩き台の線引き。各サービスの「0円で作る範囲」と併記する共通文 */
export const ZERO_START_SCOPE_RULE =
  'ゼロスタートでは、開発を進める価値を双方で判断できるよう、必要な画面と業務ロジックが動く無料デモを作ります。AI DXはまず1業務に絞り、入力・保存・条件分岐・結果の確認など、その業務を試すための処理も実装します。使用するデータと実装範囲は事前に合意します。本番利用に向けた品質・精度の検証、連携や機能の拡張、運用の整備は、デモで分かった課題をもとに範囲と費用を見積もり、準委任（月額）で進めます。';

function roleLabel(role: RoleName, count: number) {
  const short = role === 'PM（プロジェクトマネージャー）' ? 'PM' : role;
  return `${short}${count}名`;
}

function formatMonths(months: number) {
  return Number.isInteger(months) ? `${months}か月` : `${months}か月`;
}

/** PoC の最小構成の金額（万円、税別）。職種別単価の下限で計算する */
export function pocEstimateMin(team: PocTeam): number {
  const monthly = team.members.reduce((sum, m) => {
    const rate = ROLE_RATES.find((r) => r.role === m.role);
    if (!rate) throw new Error(`unknown role: ${m.role}`);
    return sum + rate.monthlyMin * m.count;
  }, 0);
  return Math.round(monthly * team.monthsMin);
}

/** 「AIエンジニア1名＋エンジニア1名 × 1か月〜、約208万円〜（税別）」の形にする */
export function pocEstimate(team: PocTeam): string {
  const members = team.members.map((m) => roleLabel(m.role, m.count)).join('＋');
  return `${members} × ${formatMonths(team.monthsMin)}〜、約${pocEstimateMin(team).toLocaleString('ja-JP')}万円〜（税別）`;
}

export type ProjectTeam = {
  members: PocTeam['members'];
  /** 全体（PoCから本番展開まで）の期間の幅（か月） */
  monthsMin: number;
  monthsMax: number;
};

/** 全体の予算の目安（万円、税別）。下限は単価下限×最短、上限は単価下限×最長 */
export function projectEstimateRange(team: ProjectTeam): { min: number; max: number } {
  return {
    min: pocEstimateMin({ members: team.members, monthsMin: team.monthsMin }),
    max: pocEstimateMin({ members: team.members, monthsMin: team.monthsMax }),
  };
}

/** 「AIエンジニア1名＋エンジニア1名 × 3〜4か月なら、約624万〜832万円（税別）」の形にする。判断軸として全体の予算を示す */
export function projectEstimate(team: ProjectTeam): string {
  const members = team.members.map((m) => roleLabel(m.role, m.count)).join('＋');
  const { min, max } = projectEstimateRange(team);
  return `${members} × ${team.monthsMin}〜${team.monthsMax}か月なら、約${min.toLocaleString('ja-JP')}万〜${max.toLocaleString('ja-JP')}万円（税別）`;
}

/** 多くの案件でPoCから本番展開までにかかる期間の幅（2026-09-18 ユーザー判断: だいたい3〜4か月） */
export const PROJECT_MONTHS = { monthsMin: 3, monthsMax: 4 } as const;

/** モデルケースで最も使う体制。AIエンジニア1名＋エンジニア1名 */
export const AI_PAIR: PocTeam['members'] = [
  { role: 'AIエンジニア', count: 1 },
  { role: 'エンジニア', count: 1 },
];

/** 画面のあるWebシステム。エンジニア1名＋デザイナー1名 */
export const WEB_PAIR: PocTeam['members'] = [
  { role: 'エンジニア', count: 1 },
  { role: 'デザイナー', count: 1 },
];

/** CDP・データ基盤。エンジニア2名 */
export const DATA_PAIR: PocTeam['members'] = [{ role: 'エンジニア', count: 2 }];
