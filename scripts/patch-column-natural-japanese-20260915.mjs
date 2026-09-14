import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const patches = {
  'data-company-learning-sensor': [
    [
      '近頃はAIがかなり役に立ってくれるのですが、AIも現状を把握するものがないとうまい壁打ちしてくれません。',
      '近頃はAIがかなり役に立ってくれますが、現状を把握できるデータがなければ、AIとの壁打ちも十分には機能しません。',
    ],
    [
      '他には、市場調査やユーザーインタビューなどもしたりします、そういったものはdriveに入れておいて連携してAIが見れるようにします。',
      '市場調査やユーザーインタビューの記録もDriveに保存し、AIから参照できるようにしています。',
    ],
    [
      'こうした事実の多くは、ga4とか、アプリのデータベースにあります。',
      'こうした事実の多くは、GA4やアプリのデータベースに残っています。',
    ],
    [
      '個人情報や機密情報は、用途に応じてマスキングやアクセス制御を行うのがいい気がしますね。まあ中小企業とかだったらデータベースさえ分けておけば、ガンガン繋げちゃって分析していい気がしますが',
      '個人情報や機密情報には、用途に応じてマスキングやアクセス制御を行います。中小企業でも、本番環境と分析用のデータベースを分けたうえで、必要なデータを連携して分析する方が扱いやすいと考えています。',
    ],
    [
      '最近はAIの構築コストも安くなってきてますからね、結構おすすめです。まあ、分析のために現場によっては、データを整理したりクレンジング（データのお掃除）する方がコストだったりする時もあるんですが。',
      '最近はAIを使った分析環境も作りやすくなっています。一方で、現場によっては分析基盤そのものより、データの整理やクレンジングにコストがかかることもあります。',
    ],
    [
      '営業を重視すると決めたのに、一日中プロダクトの細部を直していた。仕組み化すると決めたのに、また個別の問題を自分で回収していたとか、あんまり仕事しないで趣味のプロダクトやっていたとか。',
      '営業を重視すると決めたのに、一日中プロダクトの細部を直していた。仕組み化すると決めたのに、また個別の問題を自分で回収していた。あるいは、優先度の低い個人プロダクトに時間を使っていた。こうしたずれは普通に起きます。',
    ],
    [
      'ここまでデータを整備したら、mcpとかで繋げちゃえば、チャット形式で永遠と分析とか仮説出しとかできます。超便利です。周りの友人捕まえて電話で壁打ちしてもらうことが減りました。',
      'ここまでデータを整備したら、MCPなどでAIにつなぎ、チャット形式で継続的に分析や仮説出しができます。実際、自分も人に毎回壁打ちを頼む場面が減りました。',
    ],
    [
      '会社の強さをループの設計が決めるなら、そのループを現実につなぐのがデータですかね。直感をサポートして実際にちゃんと上向いてるのかって数字の世界で経営をとらえるように私はしています。AIで楽になってきているので。（じゃないと私もやってないと思います、昔はやってなかった）',
      '会社の強さをループの設計が決めるなら、そのループを現実につなぐのがデータです。自分も、直感だけで判断せず、実際に数字が上向いているかを確認しながら経営するようにしています。AIのおかげで、この確認は以前よりかなり楽になりました。',
    ],
  ],
  'ai-development-vendor-selection': [
    [
      'ここを見ずにシステムだけ作ると、今の面倒な仕事をそのまま電子化することがあります。',
      'ここを見ずにシステムだけ作ると、今の面倒な仕事を、そのままシステム上に移すことがあります。',
    ],
    ['面倒がクラウドに移住しただけです。', '業務の面倒さが、そのままシステム上に残るだけです。'],
    [
      '撤退できる契約は弱気ではなく、普通に経営です。',
      '途中でやめられる契約は、弱気なのではなく、投資判断として合理的です。',
    ],
  ],
  'company-strength-customer-project-profit-data': [
    [
      '会社名や「AI開発会社」という単語だけで探したのではなく、自分たちの状況と、やりたいことを生成AIへ説明し、その条件で候補としてBeekleを勧められて問い合わせた。',
      '会社名や「AI開発会社」という単語だけで探したのではなく、自分たちの状況とやりたいことを生成AIへ説明し、その条件に合う候補としてBeekleを勧められ、問い合わせに至ったそうです。',
    ],
    [
      'ここまでの技術の話を経営やマーケティングへ戻すと、かなり単純です。',
      'ここまでの技術の話を、経営やマーケティングの言葉に置き換えるとシンプルです。',
    ],
    [
      'これらの論文がCEP、KBF、RTBというマーケティング用語を使っているわけではありません。ただ、実務へ翻訳するとかなり分かりやすい。',
      'これらの論文がCEP、KBF、RTBというマーケティング用語を使っているわけではありません。ただ、実務に当てはめると整理しやすくなります。',
    ],
  ],
};

function replaceOnce(html, from, to, slug) {
  const count = html.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${slug}: replacement source count is ${count}: ${from.slice(0, 40)}...`);
  }
  return html.replace(from, to);
}

async function main() {
  for (const [slug, rules] of Object.entries(patches)) {
    const current = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'content' },
    });

    let next = current.content;
    for (const [from, to] of rules) next = replaceOnce(next, from, to, slug);

    console.log(`\n=== ${slug} ===`);
    console.log(`replacements: ${rules.length}`);

    if (!APPLY) continue;

    await client.update({
      endpoint: 'columns',
      contentId: slug,
      content: { content: next },
    });
    console.log('PATCH complete');
  }

  if (!APPLY) console.log('\n[dry-run] add --apply to update MicroCMS');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
