#!/usr/bin/env node
// container mx-auto の手書きpaddingがSection標準(px-8 lg:px-12)からズレていないか検査する。
// レイアウトぐちゃぐちゃ事故(2026-09, PR #249)の再発防止。
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'src');
const TARGET_EXT = new Set(['.astro', '.tsx']);
// Section コンポーネント自体は標準の定義元なので対象外
const EXCLUDE = new Set([join(ROOT, 'components', 'ui', 'section.tsx')]);

const CONTAINER_RE = /class(?:Name)?=(?:"|'|\{`|\{cn\(\s*")([^"'`]*?\bcontainer\b[^"'`]*?)(?:"|'|`)/g;
const PADDING_RE = /\bpx-(\d+)(?:\s+lg:px-(\d+))?\b/;
const EXPECTED = { base: '8', lg: '12' };

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
      const padding = classList.match(PADDING_RE);
      const line = content.slice(0, match.index).split('\n').length;
      if (!padding) {
        violations.push({ file, line, reason: 'container mx-auto に px-* が見つかりません' });
      } else if (padding[1] !== EXPECTED.base || padding[2] !== EXPECTED.lg) {
        violations.push({
          file,
          line,
          reason: `px-${padding[1]}${padding[2] ? ` lg:px-${padding[2]}` : ''} は標準 (px-8 lg:px-12) と異なります`,
        });
      }
    }
    match = CONTAINER_RE.exec(content);
  }
}

if (violations.length > 0) {
  console.error('container 幅の不整合を検出しました（Section コンポーネントの標準 px-8 lg:px-12 に揃えてください）:\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} - ${v.reason}`);
  }
  console.error(`\n${violations.length} 件。手書きの container mx-auto div を書かず、可能なら Section コンポーネントを使ってください。`);
  process.exit(1);
} else {
  console.log('container 幅チェック: 問題なし');
}
