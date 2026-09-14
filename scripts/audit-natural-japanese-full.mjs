import fs from 'node:fs';
import path from 'node:path';
import { createClient } from 'microcms-js-sdk';

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
if (!serviceDomain || !apiKey) {
  throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY are required');
}

const client = createClient({ serviceDomain, apiKey });
const outDir = '.ops';
fs.mkdirSync(outDir, { recursive: true });

const BUYER_CATEGORIES = new Set([
  'estimate-concerns',
  'ai-development',
  'genai-adoption',
  'cdp-development',
  'dx',
  'project-management',
]);
const BUYER_TERMS = /費用|料金|相場|見積|比較|選び方|会社|依頼|外注|委託|発注|導入|PoC|MVP|本番|相談|契約|期間|失敗|開発/g;
const CLICHE = /羅針盤|車の両輪|両輪|潤滑油|スパイス|レシピ|筋トレ|DNA|血肉|屋台骨|時限爆弾|最強の交渉カード|クラウドに移住/g;
const HYPE = /絶対に|必ず後悔|必ず失敗|最強|劇的|圧倒的|間違いなく|誰でも簡単|完全自動|万能/g;
const AI_BOILERPLATE = /本質的(?:な|に)?|現実解|徹底(?:的に)?|網羅的|〜ではありません|と言えるでしょう|といえるでしょう|重要(?:な|です)|ポイント(?:です|になります)|効果的かつ効率的/g;
const META_PREAMBLE = /^(?:本記事|この記事|本稿|今回は)(?:では|で)[^。]{0,70}(?:解説|紹介|説明|整理|まとめ)/;
const LABEL_HEADING = /^(背景|課題|分析|提案|まとめ|結論|概要|メリット|デメリット|ポイント)$/;
const PROCESS_PHRASE = /一気通貫/g;

function stripHtml(html = '') {
  return html
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractParagraphs(html = '') {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripHtml(m[1]));
}

function extractHeadings(html = '') {
  return [...html.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: stripHtml(m[2]),
  }));
}

function sentences(text) {
  return text
    .split(/(?<=[。！？!?])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 18);
}

function repeatedSentences(text) {
  const counts = new Map();
  for (const s of sentences(text)) {
    const key = s.replace(/\s+/g, ' ').replace(/[「」『』“”]/g, '');
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([sample, count]) => ({ sample, count }));
}

function shortParagraphRuns(paragraphs) {
  const runs = [];
  let start = -1;
  for (let i = 0; i <= paragraphs.length; i += 1) {
    const p = paragraphs[i] || '';
    const short = p.length > 0 && p.length <= 24 && !/[：:]/.test(p);
    if (short && start < 0) start = i;
    if ((!short || i === paragraphs.length) && start >= 0) {
      const end = i - 1;
      if (end - start + 1 >= 3) runs.push(paragraphs.slice(start, end + 1));
      start = -1;
    }
  }
  return runs.slice(0, 5);
}

function countMatches(text, re) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return (text.match(new RegExp(re.source, flags)) || []).length;
}

function uniqueMatches(text, re, max = 8) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return [...new Set(text.match(new RegExp(re.source, flags)) || [])].slice(0, max);
}

async function fetchColumns() {
  const all = [];
  let offset = 0;
  while (true) {
    const r = await client.get({
      endpoint: 'columns',
      queries: {
        fields: 'id,title,description,content,category,updatedAt,publishedAt',
        limit: 100,
        offset,
      },
    });
    all.push(...r.contents);
    if (all.length >= r.totalCount) break;
    offset += 100;
  }
  return all;
}

function auditColumn(c) {
  const html = c.content || '';
  const text = stripHtml(html);
  const paragraphs = extractParagraphs(html);
  const headings = extractHeadings(html);
  const intro = paragraphs.slice(0, 3).join(' ');
  const combined = `${c.title || ''}\n${c.description || ''}\n${text}`;
  const findings = [];

  if (META_PREAMBLE.test(intro)) {
    findings.push({ type: 'empty-preamble', severity: 2, samples: paragraphs.slice(0, 3).filter((p) => META_PREAMBLE.test(p)) });
  }
  const boilerplateCount = countMatches(combined, /解説します|紹介します|説明します|整理します|まとめます/g);
  if (boilerplateCount >= 5) {
    findings.push({ type: 'explain-boilerplate', severity: 1, count: boilerplateCount, samples: uniqueMatches(combined, /[^。]{0,45}(?:解説します|紹介します|説明します|整理します|まとめます)[。]?/g) });
  }
  const cliche = uniqueMatches(combined, CLICHE);
  if (cliche.length) findings.push({ type: 'cliche-metaphor', severity: 3, count: countMatches(combined, CLICHE), samples: cliche });
  const hype = uniqueMatches(combined, HYPE);
  if (hype.length) findings.push({ type: 'overclaim', severity: 3, count: countMatches(combined, HYPE), samples: hype });
  const aiTells = uniqueMatches(combined, AI_BOILERPLATE);
  const aiTellCount = countMatches(combined, AI_BOILERPLATE);
  if (aiTellCount >= 5) findings.push({ type: 'ai-boilerplate', severity: 2, count: aiTellCount, samples: aiTells });
  const processCount = countMatches(combined, PROCESS_PHRASE);
  if (processCount >= 4) findings.push({ type: 'repeated-jargon', severity: 1, count: processCount, samples: ['一気通貫'] });
  const labels = headings.filter((h) => h.level === 2 && LABEL_HEADING.test(h.text)).map((h) => h.text);
  if (labels.length) findings.push({ type: 'label-only-heading', severity: 1, count: labels.length, samples: labels });

  const repeated = repeatedSentences(text);
  if (repeated.length) findings.push({ type: 'repeated-sentence', severity: 3, count: repeated.reduce((n, r) => n + r.count - 1, 0), samples: repeated });

  const runs = shortParagraphRuns(paragraphs);
  if (runs.length) findings.push({ type: 'choppy-short-paragraphs', severity: 2, count: runs.length, samples: runs });

  const emdash = countMatches(combined, /——/g);
  const smartQuotes = countMatches(combined, /“[^”]{1,80}”/g);
  const fullSlash = countMatches(combined, /[^\s>]／[^\s<]/g);
  if (emdash + smartQuotes >= 2) findings.push({ type: 'ai-punctuation', severity: 2, count: emdash + smartQuotes, samples: uniqueMatches(combined, /——|“[^”]{1,80}”/g) });
  if (fullSlash >= 4) findings.push({ type: 'concept-slash-overuse', severity: 1, count: fullSlash, samples: uniqueMatches(combined, /[^\s>]／[^\s<]/g) });

  const category = c.category?.id || '';
  const buyerTermCount = countMatches(`${c.title || ''} ${c.description || ''} ${headings.map((h) => h.text).join(' ')}`, BUYER_TERMS);
  if (BUYER_CATEGORIES.has(category) && buyerTermCount === 0) {
    findings.push({ type: 'buyer-intent-gap', severity: 2, count: 0, samples: [`category=${category}`] });
  }

  return {
    id: c.id,
    title: c.title,
    category,
    updatedAt: c.updatedAt,
    findings,
    score: findings.reduce((n, f) => n + f.severity * Math.max(1, Math.min(f.count || 1, 4)), 0),
  };
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
  if (file.startsWith('src/pages/services/')) return true;
  if (file.startsWith('src/pages/situations/')) return true;
  if (file.startsWith('src/components/services/')) return true;
  return [
    'src/data/service.ts',
    'src/data/ai-service-page-config.ts',
    'src/data/industry-services.ts',
    'src/data/industry-page-config.ts',
    'src/data/consultation-situations.ts',
    'src/data/situation-lp-content.ts',
  ].includes(file);
}

function auditLpFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const findings = [];
  const cliche = uniqueMatches(source, CLICHE);
  if (cliche.length) findings.push({ type: 'cliche-metaphor', severity: 3, count: countMatches(source, CLICHE), samples: cliche });
  const hype = uniqueMatches(source, HYPE);
  if (hype.length) findings.push({ type: 'overclaim', severity: 3, count: countMatches(source, HYPE), samples: hype });
  const aiTellCount = countMatches(source, AI_BOILERPLATE);
  if (aiTellCount >= 5) findings.push({ type: 'ai-boilerplate', severity: 2, count: aiTellCount, samples: uniqueMatches(source, AI_BOILERPLATE) });
  const confirmCount = countMatches(source, /確認する|確認できます|ご確認/g);
  if (confirmCount >= 8) findings.push({ type: 'mechanical-confirm-wording', severity: 2, count: confirmCount, samples: uniqueMatches(source, /[^'"`\n]{0,30}(?:確認する|確認できます|ご確認)[^'"`\n]{0,30}/g) });
  const ichi = countMatches(source, /一気通貫/g);
  if (ichi >= 4) findings.push({ type: 'repeated-jargon', severity: 1, count: ichi, samples: ['一気通貫'] });
  return { file, findings, score: findings.reduce((n, f) => n + f.severity * Math.max(1, Math.min(f.count || 1, 4)), 0) };
}

const columns = await fetchColumns();
const columnAudit = columns.map(auditColumn).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
const candidateFiles = [...collectFiles('src/pages'), ...collectFiles('src/components/services')];
for (const f of [
  'src/data/service.ts',
  'src/data/ai-service-page-config.ts',
  'src/data/industry-services.ts',
  'src/data/industry-page-config.ts',
  'src/data/consultation-situations.ts',
  'src/data/situation-lp-content.ts',
]) if (fs.existsSync(f)) candidateFiles.push(f);
const lpFiles = [...new Set(candidateFiles)].filter(isLpFile).sort();
const lpAudit = lpFiles.map(auditLpFile).sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

const payload = {
  generatedAt: new Date().toISOString(),
  criteria: {
    columns: columns.length,
    lpFiles: lpFiles.length,
    buyerCategories: [...BUYER_CATEGORIES],
  },
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
for (const row of columnAudit.filter((x) => x.findings.length).slice(0, 80)) {
  console.log(`COLUMN ${row.score}\t${row.id}\t${row.findings.map((f) => `${f.type}:${f.count ?? 1}`).join(',')}`);
}
for (const row of lpAudit.filter((x) => x.findings.length).slice(0, 80)) {
  console.log(`LP ${row.score}\t${row.file}\t${row.findings.map((f) => `${f.type}:${f.count ?? 1}`).join(',')}`);
}
