#!/usr/bin/env node
// container mx-auto の手書きpaddingがSection標準(px-8 lg:px-12)からズレていないか検査する。
// レイアウトぐちゃぐちゃ事故(2026-09, PR #249)の再発防止。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'src');
const TARGET_EXT = new Set(['.astro', '.tsx']);
// Section コンポーネント自体は標準の定義元なので対象外
const EXCLUDE = new Set([join(ROOT, 'components', 'ui', 'section.tsx')]);

const CONTAINER_RE =
  /class(?:Name)?=(?:"|'|\{`|\{cn\(\s*")([^"'`]*?\bcontainer\b[^"'`]*?)(?:"|'|`)/g;
// 他のレスポンシブユーティリティ(grid-cols等)が間に挟まっていても px-* トークンを順不同で拾う
const PX_TOKEN_RE = /(?:^|\s)(?:[a-z0-9]+:)?px-\d+/g;
const STANDARD = 'px-8 lg:px-12';

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
    } else if (TARGET_EXT.has(extname(full)) && !EXCLUDE.has(full)) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];
for (const file of walk(ROOT)) {
  const content = readFileSync(file, 'utf-8');
  let match = CONTAINER_RE.exec(content);
  while (match !== null) {
    const classList = match[1];
    if (/\bcontainer\b/.test(classList) && /\bmx-auto\b/.test(classList)) {
      const tokens = classList.match(PX_TOKEN_RE);
      const line = content.slice(0, match.index).split('\n').length;
      if (!tokens) {
        violations.push({ file, line, reason: 'container mx-auto に px-* が見つかりません' });
      } else {
        const joined = tokens.join(' ').replace(/\s+/g, ' ').trim();
        if (joined !== STANDARD) {
          violations.push({
            file,
            line,
            reason: `${joined} は標準 (${STANDARD}) と異なります`,
          });
        }
      }
    }
    match = CONTAINER_RE.exec(content);
  }
}

if (violations.length > 0) {
  console.error(
    'container 幅の不整合を検出しました（Section コンポーネントの標準 px-8 lg:px-12 に揃えてください）:\n'
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} - ${v.reason}`);
  }
  console.error(
    `\n${violations.length} 件。手書きの container mx-auto div を書かず、可能なら Section コンポーネントを使ってください。`
  );
  process.exit(1);
} else {
  console.log('container 幅チェック: 問題なし');
}
