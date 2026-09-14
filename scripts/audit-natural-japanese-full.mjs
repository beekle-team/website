import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://beekle.jp';
const outDir = '.ops';
fs.mkdirSync(outDir, { recursive: true });

const CATEGORY_SLUGS = new Set([
  'management-issues',
  'genai-adoption',
  'project-management',
  'communication',
  'estimate-concerns',
  'ai-development',
  'cdp-development',
  'dx',
  'knowledge',
]);
const BUYER_TERMS = /費用|料金|相場|見積|比較|選び方|会社|依頼|外注|委託|発注|導入|PoC|MVP|本番|相談|契約|期間|開発/g;
const BUYER_TOPIC = /AI|生成AI|CDP|システム開発|DX|PoC|MVP|RAG|チャットボット|FAQ|要件定義/i;
const CLICHE = /羅針盤|車の両輪|両輪|潤滑油|スパイス|レシピ|筋トレ|DNA|血肉|屋台骨|時限爆弾|最強の交渉カード|クラウドに移住/g;
const HYPE = /絶対に|必ず後悔|必ず失敗|最強|劇的|圧倒的|間違いなく|誰でも簡単|完全自動|万能/g;
const AI_BOILERPLATE = /本質的(?:な|に)?|現実解|徹底(?:的に)?|網羅的|効果的かつ効率的/g;
const META_PREAMBLE = /^(?:本記事|この記事|本稿|今回は)(?:では|で)[^。]{0,80}(?:解説|紹介|説明|整理|まとめ)/;
const LABEL_HEADING = /^(背景|課題|分析|提案|まとめ|結論|概要|メリット|デメリット|ポイント)$/;

function decode(text = '') {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
function stripHtml(html = '') {
  return decode(
    html
      .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}
function extractParagraphs(html = '') {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripHtml(m[1]));
}
function extractHeadings(html = '') {
  return [...html.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: Number(m[1]), text: stripHtml(m[2]) }));
}
function countMatches(text, re) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return (text.match(new RegExp(re.source, flags)) || []).length;
}
function uniqueMatches(text, re, max = 10) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return [...new Set(text.match(new RegExp(re.source, flags)) || [])].slice(0, max);
}
function repeatedSentences(text) {
  const counts = new Map();
  for (const s of text.split(/(?<=[。！？!?])/).map((x) => x.trim()).filter((x) => x.length >= 22)) {
    const key = s.replace(/\s+/g, ' ').replace(/[「」『』“”]/g, '');
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n >= 2).slice(0, 8).map(([sample, count]) => ({ sample, count }));
}
function shortParagraphRuns(paragraphs) {
  const runs = [];
  let run = [];
  for (const p of [...paragraphs, '']) {
    if (p && p.length <= 24 && !/[：:]/.test(p)) run.push(p);
    else {
      if (run.length >= 3) runs.push(run);
      run = [];
    }
  }
  return runs.slice(0, 5);
}
function extractMain(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
}
function extractTitle(html) {
  return stripHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}
function extractDescription(html) {
  return decode(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '');
}
async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'BeekleNaturalJapaneseAudit/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}
async function fetchPublishedColumns() {
  const sitemap = await fetchText(`${SITE}/sitemap.xml`);
  const urls = [...sitemap.matchAll(/<loc>(https:\/\/beekle\.jp\/(?:column|knowledge)\/([^<\/]+))<\/loc>/g)]
    .map((m) => ({ url: m[1], id: m[2], section: m[1].includes('/knowledge/') ? 'knowledge' : 'column' }))
    .filter((x) => !CATEGORY_SLUGS.has(x.id));
  const unique = [...new Map(urls.map((x) => [x.id, x])).values()];
  const results = [];
  for (let i = 0; i < unique.length; i += 8) {
    const rows = await Promise.all(unique.slice(i, i + 8).map(async (item) => {
      const html = await fetchText(item.url);
      return { ...item, content: extractMain(html), title: extractTitle(html), description: extractDescription(html) };
    }));
    results.push(...rows);
  }
  return results;
}
function auditColumn(c) {
  const html = c.content || '';
  const text = stripHtml(html);
  const paragraphs = extractParagraphs(html);
  const headings = extractHeadings(html);
  const intro = paragraphs.slice(0, 3).join(' ');
  const combined = `${c.title}\n${c.description}\n${text}`;
  const findings = [];
  if (META_PREAMBLE.test(intro)) findings.push({ type: 'empty-preamble', severity: 2, samples: paragraphs.slice(0, 3).filter((p) => META_PREAMBLE.test(p)) });
  const explainCount = countMatches(combined, /解説します|紹介します|説明します|整理します|まとめます/g);
  if (explainCount >= 5) findings.push({ type: 'explain-boilerplate', severity: 1, count: explainCount, samples: uniqueMatches(combined, /[^。]{0,45}(?:解説します|紹介します|説明します|整理します|まとめます)[。]?/g) });
  for (const [type, re, severity] of [['cliche-metaphor', CLICHE, 3], ['overclaim', HYPE, 3], ['ai-boilerplate', AI_BOILERPLATE, 2]]) {
    const hits = uniqueMatches(combined, re);
    if (hits.length) findings.push({ type, severity, count: countMatches(combined, re), samples: hits });
  }
  const ichi = countMatches(combined, /一気通貫/g);
  if (ichi >= 4) findings.push({ type: 'repeated-jargon', severity: 1, count: ichi, samples: ['一気通貫'] });
  const labels = headings.filter((h) => h.level === 2 && LABEL_HEADING.test(h.text)).map((h) => h.text);
  if (labels.length) findings.push({ type: 'label-only-heading', severity: 1, count: labels.length, samples: labels });
  const repeated = repeatedSentences(text);
  if (repeated.length) findings.push({ type: 'repeated-sentence', severity: 3, count: repeated.reduce((n, r) => n + r.count - 1, 0), samples: repeated });
  const runs = shortParagraphRuns(paragraphs);
  if (runs.length) findings.push({ type: 'choppy-short-paragraphs', severity: 2, count: runs.length, samples: runs });
  const punctuation = countMatches(combined, /——|“[^”]{1,80}”/g);
  if (punctuation >= 2) findings.push({ type: 'ai-punctuation', severity: 2, count: punctuation, samples: uniqueMatches(combined, /——|“[^”]{1,80}”/g) });
  const buyerTermCount = countMatches(`${c.title} ${c.description} ${headings.map((h) => h.text).join(' ')}`, BUYER_TERMS);
  if (BUYER_TOPIC.test(c.title) && buyerTermCount === 0) findings.push({ type: 'buyer-intent-gap', severity: 1, count: 0, samples: ['買い手語なし（要人手確認）'] });
  return { id: c.id, url: c.url, section: c.section, title: c.title, findings, score: findings.reduce((n, f) => n + f.severity * Math.max(1, Math.min(f.count || 1, 4)), 0) };
}
function collectFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const p = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(p));
    else if (/\.(?:astro|ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}
function isLpFile(file) {
  if (/^src\/pages\/(?:index|solutions|prooffirst|case-studies|company|careers|contact)\.astro$/.test(file)) return true;
  if (file.startsWith('src/pages/services/') || file.startsWith('src/pages/situations/') || file.startsWith('src/components/services/')) return true;
  return ['src/data/service.ts', 'src/data/ai-service-page-config.ts', 'src/data/industry-services.ts', 'src/data/industry-page-config.ts', 'src/data/consultation-situations.ts', 'src/data/situation-lp-content.ts'].includes(file);
}
function auditLpFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const findings = [];
  for (const [type, re, severity] of [['cliche-metaphor', CLICHE, 3], ['overclaim', HYPE, 3], ['ai-boilerplate', AI_BOILERPLATE, 2]]) {
    const hits = uniqueMatches(source, re);
    if (hits.length) findings.push({ type, severity, count: countMatches(source, re), samples: hits });
  }
  const confirmCount = countMatches(source, /確認する|確認できます|ご確認/g);
  if (confirmCount >= 8) findings.push({ type: 'mechanical-confirm-wording', severity: 2, count: confirmCount, samples: uniqueMatches(source, /[^'"`\n]{0,30}(?:確認する|確認できます|ご確認)[^'"`\n]{0,30}/g) });
  const ichi = countMatches(source, /一気通貫/g);
  if (ichi >= 4) findings.push({ type: 'repeated-jargon', severity: 1, count: ichi, samples: ['一気通貫'] });
  return { file, findings, score: findings.reduce((n, f) => n + f.severity * Math.max(1, Math.min(f.count || 1, 4)), 0) };
}

const columns = await fetchPublishedColumns();
const columnAudit = columns.map(auditColumn).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
const candidateFiles = [...collectFiles('src/pages'), ...collectFiles('src/components/services')];
for (const f of ['src/data/service.ts', 'src/data/ai-service-page-config.ts', 'src/data/industry-services.ts', 'src/data/industry-page-config.ts', 'src/data/consultation-situations.ts', 'src/data/situation-lp-content.ts']) if (fs.existsSync(f)) candidateFiles.push(f);
const lpFiles = [...new Set(candidateFiles)].filter(isLpFile).sort();
const lpAudit = lpFiles.map(auditLpFile).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));
const payload = {
  generatedAt: new Date().toISOString(),
  source: 'published beekle.jp pages',
  summary: {
    columnsTotal: columns.length,
    columnsFlagged: columnAudit.filter((x) => x.findings.length).length,
    columnsClean: columnAudit.filter((x) => !x.findings.length).length,
    lpFilesTotal: lpFiles.length,
    lpFilesFlagged: lpAudit.filter((x) => x.findings.length).length,
    lpFilesClean: lpAudit.filter((x) => !x.findings.length).length,
  },
  columns: columnAudit,
  lpFiles: lpAudit,
};
fs.writeFileSync(path.join(outDir, 'natural-japanese-audit.json'), `${JSON.stringify(payload, null, 2)}\n`);
console.log(`NATURAL_JAPANESE_AUDIT columns=${payload.summary.columnsTotal} flagged=${payload.summary.columnsFlagged} clean=${payload.summary.columnsClean}`);
console.log(`NATURAL_JAPANESE_AUDIT lpFiles=${payload.summary.lpFilesTotal} flagged=${payload.summary.lpFilesFlagged} clean=${payload.summary.lpFilesClean}`);
for (const row of columnAudit.filter((x) => x.findings.length)) console.log(`COLUMN ${row.score}\t${row.id}\t${row.findings.map((f) => `${f.type}:${f.count ?? 1}`).join(',')}`);
for (const row of lpAudit.filter((x) => x.findings.length)) console.log(`LP ${row.score}\t${row.file}\t${row.findings.map((f) => `${f.type}:${f.count ?? 1}`).join(',')}`);
