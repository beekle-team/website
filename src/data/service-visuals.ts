import { sectionVisuals } from './section-visuals';

export type ServiceVisual = {
  name: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
};

const prototype: ServiceVisual = {
  name: 'prototype-review-v2',
  alt: '業務整理から動く試作品の確認、開発範囲の合意までを進める様子を表したイラストです。画像内に文字はありません。',
  caption:
    'Beekleの開発支援は、業務の整理、動くプロトタイプでの確認、開発範囲の合意という順に進めます。画面や操作を確かめ、要望と完成条件の認識を合わせます。',
};
const knowledge: ServiceVisual = {
  name: 'knowledge-search-v2',
  alt: '資料を検索し、回答と参照元を確認する業務の様子を表したイラストです。画像内に文字はありません。',
  caption:
    'Beekleの社内文書AI検索は、業務の質問に関連する資料を探し、回答案と参照元を提示する仕組みです。担当者が資料の版や適用条件を確認してから業務に使います。',
};
const documents: ServiceVisual = {
  name: 'document-review-v2',
  alt: '帳票をスキャンし、画面で内容を確認してから業務システムへ登録するまでの様子を表したイラストです。画像内に文字はありません。',
  caption:
    'Beekleの帳票処理支援では、AI-OCRによる項目抽出と、担当者の確認、既存システムへの登録をつなぎます。確認が必要な項目と自動処理できる範囲は、実際の帳票で検証して決めます。',
};
const approval: ServiceVisual = {
  name: 'agent-approval-v2',
  alt: '複数システムの情報から作業案を準備し、担当者の承認を得てから実行して、履歴を残す流れを表したイラストです。',
  caption:
    'BeekleのAIエージェント開発では、情報収集や作業案の準備をAIが支援し、重要な操作は担当者の承認後に実行します。操作の権限と実行履歴を管理することで、任せる範囲を明確にします。',
};

export const serviceVisuals: Record<string, ServiceVisual> = {
  'web-mobile-development': prototype,
  'mvp-poc-development': prototype,
  'requirements-definition-support': prototype,
  'rfp-creation-support': {
    ...prototype,
    caption:
      'BeekleのRFP作成支援では、業務と要望を整理し、必要に応じて画面イメージで認識を合わせます。依頼する範囲と完成条件を明確にし、開発会社が見積もり・提案しやすい資料にまとめます。',
  },
  'internal-document-ai-search': knowledge,
  'rag-system-development': knowledge,
  'manufacturing-parts-knowledge-search': {
    ...knowledge,
    caption:
      '製造業の部品検索では、型番・仕様書・適合条件を対応づけて検索します。Beekleは、回答の根拠となる資料と適用条件を担当者が確認できる仕組みを設計します。',
  },
  'technical-manual-knowledge-search': {
    ...knowledge,
    caption:
      '技術マニュアル検索では、機種・構成・文書の版に合う手順を探します。Beekleは、参照した原本と適用条件を確認できる仕組みを設計し、担当者が作業の可否を判断できるようにします。',
  },
  'ai-chatbot-development': {
    ...knowledge,
    caption:
      'BeekleのAIチャットボット開発では、FAQや対応履歴をもとに回答し、根拠が不足する質問は担当者へ引き継ぐ流れを設計します。AIに任せる質問の範囲は、実際の問い合わせで検証します。',
  },
  'internal-it-helpdesk-ai': {
    ...knowledge,
    caption:
      '社内ITヘルプデスクでは、利用手順やFAQをAIで検索し、担当者への問い合わせを減らします。Beekleは、権限変更など人の判断が必要な依頼を情シスへ引き継ぐ運用まで設計します。',
  },
  'ocr-ai-development': documents,
  'document-processing-automation': documents,
  'ai-agent-development': approval,
  'sales-data-coaching': {
    name: 'management-data-flow-v1',
    alt: '経営データを次の判断につなげます。営業・会計・顧客対応の情報を集め、同じ基準で集計・変化を確認し、課題を選んで対応を決めます。',
    caption:
      '営業データを活用するには、架電・商談・受注の記録を同じ基準で整理する必要があります。Beekleは、担当者ごとの状況を確認し、具体的な振り返りや育成につなげる仕組みを支援します。',
  },
  'cdp-development': {
    name: 'management-data-flow-v1',
    alt: '営業・会計・顧客対応の情報を集約し、集計結果から対応を決める流れ',
    caption:
      'Beekleの顧客データ基盤開発では、複数システムに分かれた顧客情報を整理し、分析や施策に利用できる状態にします。顧客を照合するルール、利用権限、更新方法を業務に合わせて設計します。',
  },
};

// ページの業務に合わせた専用図。
Object.assign(serviceVisuals, {
  'sales-data-coaching': sectionVisuals['sales-coaching-v1'],
  'manufacturing-parts-knowledge-search': sectionVisuals['parts-fit-v1'],
  'technical-manual-knowledge-search': sectionVisuals['manual-conditions-v1'],
  'internal-it-helpdesk-ai': sectionVisuals['helpdesk-routing-v1'],
  'document-processing-automation': sectionVisuals['document-registration-v1'],
  'web-mobile-development': sectionVisuals['web-app-delivery-v1'],
  'cdp-development': sectionVisuals['customer-data-v1'],
  'ai-chatbot-development': sectionVisuals['chatbot-handoff-v1'],
  'requirements-definition-support': sectionVisuals['requirements-chain-v1'],
  'mvp-poc-development': sectionVisuals['mvp-decision-v1'],
  'rfp-creation-support': sectionVisuals['requirements-chain-v1'],
});
