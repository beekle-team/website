import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const BK = '.tmp/cms-backup-pricing';
mkdirSync(BK, { recursive: true });
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// 挿入位置: 指定 h2 見出しの直前。marker はその記事の主題に合う変種。
const TARGETS = [
  { slug: 'web-system-cost-by-scale', marker: 'BEEKLE_PRICING_WEB', beforeH2: 'まとめ' },
  {
    slug: 'ai-development-cost-guide',
    marker: 'BEEKLE_PRICING_AI',
    beforeH2: '結局、生成AI開発にはいくら用意すればよいのか',
  },
  { slug: 'cdp-cost-and-period', marker: 'BEEKLE_PRICING_DATA', beforeH2: '関連記事' },
  {
    slug: 'genai-roi-investment',
    marker: 'BEEKLE_PRICING_AI',
    beforeH2: '最初に聞くべきなのは「何を作りますか？」ではない',
  },
  { slug: 'what-is-faq-system', marker: 'BEEKLE_PRICING_AI', beforeH2: 'よくある質問' },
];

for (const t of TARGETS) {
  const cur = await client.get({
    endpoint: 'columns',
    contentId: t.slug,
    queries: { fields: 'id,content' },
  });
  const html = cur.content || '';
  writeFileSync(`${BK}/${t.slug}.html`, html);

  if (html.includes(`{{${t.marker}}}`)) {
    console.log(`SKIP ${t.slug}: already has ${t.marker}`);
    continue;
  }
  if (/\{\{BEEKLE_PRICING_/.test(html)) {
    console.log(`SKIP ${t.slug}: has another pricing marker`);
    continue;
  }

  // 見出しは MicroCMS が id を自動付与するので属性を許容する
  const re = new RegExp(`<h2[^>]*>\\s*${t.beforeH2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  const m = html.match(re);
  if (!m) {
    console.log(`MISS ${t.slug}: h2 "${t.beforeH2}" not found`);
    continue;
  }

  const at = m.index;
  const block = `\n<p>{{${t.marker}}}</p>\n`;
  const next = html.slice(0, at) + block + html.slice(at);

  console.log(
    `${APPLY ? 'PATCH' : 'DRY  '} ${t.slug}: insert ${t.marker} before "${t.beforeH2}" (at ${at}/${html.length})`
  );
  console.log(
    `   context: ...${html.slice(Math.max(0, at - 90), at).replace(/\s+/g, ' ')} ⟪HERE⟫ ${html.slice(at, at + 70).replace(/\s+/g, ' ')}...`
  );

  if (APPLY) {
    await client.update({ endpoint: 'columns', contentId: t.slug, content: { content: next } });
    const after = await client.get({
      endpoint: 'columns',
      contentId: t.slug,
      queries: { fields: 'content' },
    });
    const ok = (after.content || '').includes(`{{${t.marker}}}`);
    console.log(
      `   verify: marker present = ${ok}, len ${html.length} -> ${(after.content || '').length}`
    );
    if (!ok) console.log('   !! PATCH DID NOT TAKE EFFECT');
  }
}
