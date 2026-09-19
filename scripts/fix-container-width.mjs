#!/usr/bin/env node
// check-container-width.mjs が検出した「container mx-auto の px-* が標準(px-8 lg:px-12)とズレている」箇所を
// 機械的に是正する。container mx-auto を含む class 文字列に含まれる px-* トークン(レスポンシブ接頭辞含む)を
// すべて取り除いてから標準(px-8 lg:px-12)を1回だけ差し込む。それ以外の class には触れない。
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'src');
const TARGET_EXT = new Set(['.astro', '.tsx']);
const EXCLUDE = new Set([join(ROOT, 'components', 'ui', 'section.tsx')]);

const CONTAINER_RE =
  /class(?:Name)?=(?:"|'|\{`|\{cn\(\s*")([^"'`]*?\bcontainer\b[^"'`]*?)(?:"|'|`)/g;
const PX_TOKEN_RE = /(?:^|\s)(?:[a-z0-9]+:)?px-\d+/g;
const STANDARD = 'px-8 lg:px-12';

function normalize(classList) {
  const tokens = classList.match(PX_TOKEN_RE);
  if (!tokens) {
    return `${classList.trim()} ${STANDARD}`;
  }
  const joined = tokens.join(' ');
  if (joined.replace(/\s+/g, ' ').trim() === STANDARD) return null; // already compliant

  const firstIndex = classList.search(PX_TOKEN_RE);
  let stripped = classList.replace(PX_TOKEN_RE, '');
  stripped = stripped.replace(/\s{2,}/g, ' ').trim();

  // 元のpxトークン群があった位置relative順を保つため、strippedを前後に分割して差し込む
  const before = classList.slice(0, firstIndex).replace(/\s+$/, '');
  const afterRaw = classList.slice(firstIndex).replace(PX_TOKEN_RE, '').trim();
  const parts = [before, STANDARD, afterRaw].filter(Boolean);
  return parts.join(' ').replace(/\s{2,}/g, ' ').trim();
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (TARGET_EXT.has(extname(full)) && !EXCLUDE.has(full)) files.push(full);
  }
  return files;
}

const apply = process.argv.includes('--apply');
let totalFixed = 0;
let filesTouched = 0;

for (const file of walk(ROOT)) {
  const original = readFileSync(file, 'utf-8');
  let content = original;
  let fixedInFile = 0;

  // 後方の位置ズレを避けるため、逆順(ファイル末尾から)に置換する
  const matches = [...original.matchAll(CONTAINER_RE)].reverse();
  for (const match of matches) {
    const classList = match[1];
    if (!(/\bcontainer\b/.test(classList) && /\bmx-auto\b/.test(classList))) continue;

    const newClassList = normalize(classList);
    if (newClassList === null) continue; // already compliant

    const classStart = match.index + match[0].indexOf(classList);
    content =
      content.slice(0, classStart) + newClassList + content.slice(classStart + classList.length);
    fixedInFile += 1;
  }

  if (fixedInFile > 0) {
    filesTouched += 1;
    totalFixed += fixedInFile;
    console.log(`${apply ? 'FIXED' : 'WOULD FIX'} ${fixedInFile} in ${file}`);
    if (apply) writeFileSync(file, content, 'utf-8');
  }
}

console.log(
  `\n${totalFixed} 件 / ${filesTouched} ファイル ${apply ? '修正しました' : '修正予定（--apply で反映）'}`
);
