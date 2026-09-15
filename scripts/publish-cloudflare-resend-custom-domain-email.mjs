import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const slug = 'cloudflare-resend-custom-domain-email';
const title = '独自ドメインメールをほぼ無料で運用する方法｜Cloudflare + Resend + Gmail【2026年版】';
const description = '独自ドメインメールの受信をCloudflare Email Routing、送信をResendに分けると、小規模用途なら固定費をほぼかけずに運用できます。2026年9月時点のGmail連携の注意点も含めて解説します。';

const content = `
<p>独自ドメインを取ったあと、地味に悩むのがメールです。</p>
<p><code>info@example.com</code> や <code>contact@example.com</code> を使いたいだけなのに、そのためだけにメールサービスの月額費用が増える。個人開発や小規模なサービスでは、少しもったいなく感じる場面があります。</p>
<p>そこで使えるのが、<strong>Cloudflare Email Routingで受信し、Resendで送信する</strong>構成です。2026年9月現在は条件が合えばGmailの画面にまとめることもできます。</p>
<p>この構成で面白いのは、メールを「受信」「送信」「操作画面」に分けて考えるところです。専用のメールボックスを1つのサービスから買わなくても、それぞれ得意なサービスを組み合わせれば成立します。</p>

<h2>先に結論。役割はこの3つです</h2>
<ul>
<li><strong>Cloudflare Email Routing</strong>：独自ドメイン宛のメールを受信して、普段使っているメールアドレスへ転送する</li>
<li><strong>Resend</strong>：独自ドメイン名義でメールをSMTP送信する</li>
<li><strong>GmailなどのメールUI</strong>：実際にメールを読んだり、返信したりする画面として使う</li>
</ul>
<p>受信側は次の流れです。</p>
<pre><code>相手
  ↓
info@example.com
  ↓
Cloudflare Email Routing
  ↓
普段使っているGmail</code></pre>
<p>送信側はこうなります。</p>
<pre><code>GmailなどのメールUI
  ↓
Resend SMTP
  ↓
From: info@example.com
  ↓
相手</code></pre>
<p>Cloudflareは転送係、Resendは発送係です。メールの機能を分けるだけで、専用メールボックスの固定費を抑えられます。</p>

<h2>Cloudflare Email Routingで独自ドメイン宛のメールを受け取る</h2>
<p>Cloudflareには <strong>Email Routing</strong> という機能があります。独自ドメイン宛に届いたメールを、確認済みのメールアドレスへ転送できます。</p>
<p>たとえば <code>info@example.com</code> に来たメールを、普段使っている <code>myaccount@gmail.com</code> へ転送できます。</p>
<p>Cloudflareの公式ドキュメントでは、Email Routingの転送先として確認済みメールアドレスを設定できることが案内されています。転送自体は無料で利用できます。</p>
<p><a href="https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/">Cloudflare公式：Email routing rules and addresses</a></p>

<h2>Catch-allを使えばアドレスを毎回作らなくていい</h2>
<p>さらに便利なのが <strong>Catch-all</strong> です。</p>
<p>Catch-allを有効にすると、特定のアドレスだけでなく、そのドメイン宛のメールをまとめて1つの転送先へ流せます。</p>
<pre><code>info@example.com
sales@example.com
invoice@example.com
github@example.com
anything@example.com
        ↓
同じ受信箱へ転送</code></pre>
<p>たとえばサービス登録ごとに <code>github@example.com</code>、<code>aws@example.com</code> のようにアドレスを変えても、見る受信箱は1つです。</p>
<p>Cloudflareは公式にCatch-allルールをサポートしています。ただし、存在しないローカルパート宛のメールも受けるため、迷惑メールが増えやすい点には注意が必要です。不要ならCatch-allを使わず、必要なアドレスだけ個別に作れば問題ありません。</p>

<h2>送信はResendに任せる</h2>
<p>Cloudflare Email Routingは受信と転送の仕組みです。<code>info@example.com</code> 名義で送信する機能は別に用意する必要があります。</p>
<p>そこで使えるのが <strong>Resend</strong> です。</p>
<p>Resendは開発者向けのメール送信サービスですが、APIだけでなくSMTPにも対応しています。そのため、SMTPを設定できるメールクライアントから独自ドメイン名義で送信できます。</p>
<p>2026年9月時点のFreeプランは、<strong>月3,000通、1日100通、確認済みドメイン3個まで</strong>です。個人開発や小規模サービスの連絡用途なら、無料枠に収まるケースも多いでしょう。</p>
<p><a href="https://resend.com/pricing">Resend公式：Pricing</a></p>

<h2>Resend側ではドメイン認証をする</h2>
<p>Resendから独自ドメイン名義で送信するには、先にドメインを追加してDNS認証を行います。</p>
<p>Resendの管理画面に表示されるDNSレコードをCloudflare側へ追加し、ドメイン所有を確認します。送信ドメイン認証ではSPFやDKIMなどが使われます。</p>
<p>ここを省略すると、なりすまし判定や迷惑メール判定の原因になります。「Fromだけ独自ドメインに変えればいい」という話ではなく、DNS側の認証まで含めて設定するのが前提です。</p>

<h2>ResendのSMTPを使う</h2>
<p>ResendのSMTPホストは次の通りです。</p>
<pre><code>SMTP host: smtp.resend.com
Username: resend
Password: Resend API Key
Port: 465 または 587</code></pre>
<p>つまり、送信側はResend専用アプリである必要がありません。SMTPサーバーを指定できるメールクライアントなら利用できます。</p>

<h2>2026年現在はGmailの「別のアドレスから送信」も使える</h2>
<p>Gmailには、所有している別のメールアドレスを送信元として追加する「送信元」機能があります。</p>
<p>設定できるアカウントでは、Gmailの「アカウントとインポート」から独自ドメインのメールアドレスを追加し、SMTPサーバーとしてResendを指定できます。</p>
<p>これが設定できれば、受信はCloudflareからGmailへ転送し、返信はGmailからResend SMTP経由で送信できます。普段の操作画面をGmailにまとめられるわけです。</p>
<p>ただし、ここには2026年9月時点で大きな注意点があります。</p>

<h2>重要：Gmailのサードパーティ「送信元」は2027年1月に終了予定</h2>
<p>Googleは、<strong>2027年1月からGmailでサードパーティメールアドレスを「送信元」として使う機能を終了する</strong>と案内しています。</p>
<p>さらに2026年第3四半期から第4四半期の移行期間には、新規設定を制限する可能性も案内されています。この記事を書いている2026年9月は、まさにその移行期間です。</p>
<p>そのため、今からこの構成を作る場合に「Gmailまで必ず設定できる」とは言えません。既存設定では利用できても、新規設定が制限される可能性があります。</p>
<p><a href="https://support.google.com/mail/answer/17101213?hl=ja">Google公式：Gmailでのサードパーティメールアカウントのサポート変更について</a></p>
<p>ここは記事の公開時点で必ず押さえておきたいポイントです。</p>

<h2>それでもCloudflare + Resendは使える</h2>
<p>Gmailの仕様変更で、この考え方自体が使えなくなるわけではありません。</p>
<p>本体はあくまで次の2つです。</p>
<ul>
<li>受信：Cloudflare Email Routing</li>
<li>送信：Resend SMTP</li>
</ul>
<p>Gmailは、その2つをまとめて扱うための操作画面の1候補です。Gmailの「送信元」が使えなくなった後は、複数の受信アカウントとカスタムSMTPの送信Identityを扱えるメールクライアントなどへ移行することになります。</p>
<p>つまり、<strong>Cloudflare + Resendをメール基盤として使い、UIは交換可能にしておく</strong>のが長期的には分かりやすい設計です。</p>

<h2>Google Workspaceの代替になるのか</h2>
<p>完全な代替ではありません。</p>
<p>Google Workspaceにはメールだけでなく、Google Drive、Calendar、Meet、ユーザー管理、組織のセキュリティ管理などがあります。社員が複数いてアカウント管理まで必要なら、Google Workspaceを使った方が運用は楽です。</p>
<p>一方で、次のような用途ならCloudflare + Resendはかなり相性が良いです。</p>
<ul>
<li>個人開発の問い合わせアドレス</li>
<li>PoCや新規サービスの連絡先</li>
<li>LP用に取得した新しいドメイン</li>
<li>小規模法人の代表アドレス</li>
<li>一時的なプロジェクト用アドレス</li>
</ul>
<p>「メールアドレスが1つ欲しいだけなのに、最初から人数分のメールサービスを契約するのは重い」という状況で特に効きます。</p>

<h2>この構成でできないこともある</h2>
<p>安いからといって、普通のメールサービスと同じではありません。</p>
<ul>
<li>Cloudflare Email Routingはメールボックスではなく転送サービスです</li>
<li>Resendも一般的なIMAPメールボックスではなく送信基盤です</li>
<li>送受信の履歴をサーバー側で1つのメールボックスとして同期する構成ではありません</li>
<li>組織のユーザー管理や退職者アカウント管理には向きません</li>
<li>Catch-allは便利ですが迷惑メールも拾いやすくなります</li>
</ul>
<p>企業の正式なメール基盤を全部これに置き換えるというより、<strong>小さく始めたい用途の固定費を減らす方法</strong>として考えるのが適切です。</p>

<h2>メールも「全部入り」を買わずに分解できる</h2>
<p>この構成で一番面白いのは、無料ということよりも考え方です。</p>
<p>Webシステムでは、認証、データベース、ストレージ、CDN、メール送信を別サービスに分けることが普通になりました。メールも同じように、受信、送信、操作画面を分けて組み合わせられます。</p>
<pre><code>受信  Cloudflare Email Routing
送信  Resend SMTP
UI    Gmailなどのメールクライアント</code></pre>
<p>「独自ドメインメールが必要だから、メールボックスを契約する」と決めつけず、必要な機能だけを組み合わせる。小規模な用途では、それだけで固定費をかなり小さくできます。</p>

<h2>まとめ</h2>
<p>独自ドメインメールは、必ずしも1つのメールサービスですべてを用意する必要はありません。</p>
<ul>
<li>Cloudflare Email Routingで受信する</li>
<li>Resendで送信する</li>
<li>必要に応じて普段使っているメールUIへまとめる</li>
</ul>
<p>CloudflareはCatch-allにも対応し、ResendのFreeプランは2026年9月時点で月3,000通、1日100通、3ドメインまで利用できます。</p>
<p>一方、Gmailのサードパーティ「送信元」は2027年1月に終了予定です。今後はCloudflare + Resendを本体として考え、操作画面は交換できるものとして設計しておくのがよいでしょう。</p>
<p>個人開発や新規サービスで「とりあえず独自ドメインのメールが欲しい」というときには、覚えておいて損のない構成です。</p>

<p><small>※料金や無料枠、Gmailの仕様は2026年9月16日時点の情報です。各サービスの最新情報は公式ドキュメントをご確認ください。</small></p>
`.trim();

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY is required');
}

try {
  await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'id' } });
  console.log(`SKIP: ${slug} already exists`);
  process.exit(0);
} catch (_) {
  // Not found: continue and create.
}

await client.create({
  endpoint: 'columns',
  contentId: slug,
  content: {
    title,
    description,
    category: 'knowledge',
    content,
  },
});

console.log(`PUBLISHED: ${slug}`);
