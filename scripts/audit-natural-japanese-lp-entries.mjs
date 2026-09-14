import fs from 'node:fs';
import { services } from '../src/data/service.ts';
import { aiServicePageConfig } from '../src/data/ai-service-page-config.ts';
import { consultationSituations, consultationHub } from '../src/data/consultation-situations.ts';
import { getSituationLpContent } from '../src/data/situation-lp-content.ts';

const CLICHE = /羅針盤|車の両輪|両輪|潤滑油|スパイス|レシピ|筋トレ|DNA|血肉|屋台骨|時限爆弾|最強の交渉カード|クラウドに移住/g;
const HYPE = /絶対に|必ず後悔|必ず失敗|最強|劇的|圧倒的|間違いなく|誰でも簡単|完全自動|万能/g;
const AI_TELL = /本質的(?:な|に)?|現実解|徹底(?:的に)?|網羅的|効果的かつ効率的/g;
const FORMAL = /いたします|させていただ|ご提供|ご提案|ご案内|ご支援/g;
const MECHANICAL = /確認する|確認できます|確認して|整理します|解説します|紹介します/g;
const JARGON = /一気通貫/g;
const BUYER_TERMS = /費用|料金|相場|見積|比較|選び方|会社|依頼|外注|委託|発注|導入|PoC|MVP|本番|相談|契約|期間|開発/g;

function collectStrings(value, current = '$', out = []) {
  if (typeof value === 'string') {
    if (/[ぁ-んァ-ヶ一-龠々]/.test(value)) out.push({ path: current, value });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectStrings(v, `${current}[${i}]`, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectStrings(v, `${current}.${k}`, out);
  }
  return out;
}

function matches(s, re) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return [...new Set(s.match(new RegExp(re.source, flags)) || [])];
}

function auditEntry(kind, id, url, value, meta = {}) {
  const strings = collectStrings(value);
  const joined = strings.map((s) => s.value).join('\n');
  const findings = [];
  const patternChecks = [
    ['cliche-metaphor', CLICHE, 3],
    ['overclaim', HYPE, 3],
    ['ai-boilerplate', AI_TELL, 2],
  ];
  for (const [type, re, severity] of patternChecks) {
    const rows = strings
      .map((s) => ({ ...s, hits: matches(s.value, re) }))
      .filter((s) => s.hits.length);
    if (rows.length) findings.push({ type, severity, count: rows.reduce((n, r) => n + r.hits.length, 0), samples: rows.slice(0, 12) });
  }
  const mechanicalRows = strings.filter((s) => matches(s.value, MECHANICAL).length >= 2);
  if (mechanicalRows.length >= 2) findings.push({ type: 'mechanical-wording', severity: 1, count: mechanicalRows.length, samples: mechanicalRows.slice(0, 12) });
  const formalCount = matches(joined, FORMAL).length;
  if (formalCount >= 4) {
    const rows = strings.filter((s) => matches(s.value, FORMAL).length);
    findings.push({ type: 'formal-sales-boilerplate', severity: 1, count: rows.length, samples: rows.slice(0, 12) });
  }
  const jargonRows = strings.filter((s) => matches(s.value, JARGON).length);
  if (jargonRows.length >= 3) findings.push({ type: 'repeated-jargon', severity: 1, count: jargonRows.length, samples: jargonRows.slice(0, 12) });

  const titleDesc = strings
    .filter((s) => /\.(?:title|seoTitle|description|seoDescription|headline|heroLead|subtitle|contactLabel)$/.test(s.path))
    .map((s) => s.value)
    .join(' ');
  const buyerCount = matches(titleDesc, BUYER_TERMS).length;
  if (kind === 'service' && buyerCount === 0) {
    findings.push({ type: 'buyer-intent-gap', severity: 2, count: 0, samples: [{ path: '$', value: 'title/description/headlineに買い手語なし' }] });
  }

  return {
    kind,
    id,
    url,
    ...meta,
    strings: strings.length,
    findings,
    score: findings.reduce((n, f) => n + f.severity * Math.max(1, Math.min(f.count || 1, 4)), 0),
  };
}

const serviceEntries = services.map((service) => {
  const config = aiServicePageConfig[service.id];
  return auditEntry('service', service.id, `/services/${service.id}`, { service, config }, { title: service.title });
});

const situationEntries = consultationSituations.map((situation) => {
  const content = getSituationLpContent(situation.slug);
  return auditEntry('situation', situation.slug, situation.href, { situation, content }, { title: situation.title });
});

const hub = auditEntry('situation-hub', 'situations', consultationHub.href, consultationHub, { title: consultationHub.title });
const entries = [...serviceEntries, ...situationEntries, hub].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
const payload = {
  generatedAt: new Date().toISOString(),
  summary: {
    serviceTotal: serviceEntries.length,
    serviceFlagged: serviceEntries.filter((x) => x.findings.length).length,
    situationTotal: situationEntries.length + 1,
    situationFlagged: [...situationEntries, hub].filter((x) => x.findings.length).length,
    totalEntries: entries.length,
    flaggedEntries: entries.filter((x) => x.findings.length).length,
  },
  entries,
};
fs.mkdirSync('.ops', { recursive: true });
fs.writeFileSync('.ops/natural-japanese-lp-entries.json', `${JSON.stringify(payload, null, 2)}\n`);
console.log(`NATURAL_JAPANESE_LP_ENTRIES services=${payload.summary.serviceTotal} situations=${payload.summary.situationTotal} total=${payload.summary.totalEntries} flagged=${payload.summary.flaggedEntries}`);
for (const row of entries.filter((x) => x.findings.length)) {
  console.log(`LP_ENTRY ${row.score}\t${row.kind}\t${row.id}\t${row.findings.map((f) => `${f.type}:${f.count ?? 1}`).join(',')}`);
}
