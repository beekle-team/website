import type { ServiceVisual } from './service-visuals';

export const sectionVisuals: Record<string, ServiceVisual> = {
  'sales-coaching-v1': {
    name: 'sales-coaching-v1',
    alt: '架電・商談の記録を整理し、振り返りから次の行動を決める営業育成の流れ',
    caption:
      '営業の記録を同じ項目で整理し、担当者と管理者が課題を振り返ります。Beekleは、記録の統合と振り返りを支える仕組みを設計します。',
  },
  'parts-fit-v1': {
    name: 'parts-fit-v1',
    alt: '型番から仕様・図面・互換情報をたどり、担当者が部品の適合を確認する流れ',
    caption:
      '型番だけで決めず、仕様書・図面・互換情報を照合します。Beekleは適合条件をたどれる検索を設計し、最終的な採用は担当者が原本を確認して判断します。',
  },
  'manual-conditions-v1': {
    name: 'manual-conditions-v1',
    alt: '機種・構成・資料の版を確認し、適用できる作業手順を探す流れ',
    caption:
      '機種・構成・文書の版に合う資料を探し、適用できる手順かを確認します。Beekleは検索と出典表示を整え、作業判断に必要な根拠を示します。',
  },
  'helpdesk-routing-v1': {
    name: 'helpdesk-routing-v1',
    alt: '社内問い合わせをFAQの案内と、担当者の判断が必要な依頼に分ける図',
    caption:
      '手順やFAQの案内と、権限変更など人の判断が必要な依頼を分けます。BeekleはAIの回答範囲と担当者への引き継ぎ条件を設計します。',
  },
  'document-registration-v1': {
    name: 'document-registration-v1',
    alt: '帳票の受領、項目抽出、原本との照合、業務システム登録の流れ',
    caption:
      '帳票の受領から読み取り、原本との照合、登録までを一つの業務として設計します。自動化する範囲と人が確認する項目を実データで確かめます。',
  },
  'web-app-delivery-v1': {
    name: 'web-app-delivery-v1',
    alt: '業務と利用者の整理から、Web・モバイル画面の試作、開発・公開へ進む流れ',
    caption:
      '業務と利用者を確認し、試作画面で操作を確かめてから開発範囲を合意します。BeekleはWeb・モバイルの実装、テスト、公開まで支援します。',
  },
  'customer-data-v1': {
    name: 'customer-data-v1',
    alt: '営業・購買・問い合わせの情報を照合し、顧客単位で分析に使うデータ基盤',
    caption:
      '営業・購買・問い合わせに分かれた顧客情報を照合して分析に使います。Beekleは同一顧客とみなすルール、利用権限、更新方法を設計します。',
  },
  'chatbot-handoff-v1': {
    name: 'chatbot-handoff-v1',
    alt: 'FAQ・対応履歴を検索し、根拠のある回答と担当者への引き継ぎに分けるチャットボット',
    caption:
      'FAQや対応履歴から回答の根拠を探します。根拠が不足する場合や判断が必要な質問を担当者へ戻せるよう、Beekleが対応範囲と引き継ぎを設計します。',
  },
  'requirements-chain-v1': {
    name: 'requirements-chain-v1',
    alt: '業務の困りごとを、開発範囲・画面・完成の確認条件へ整理する要件定義',
    caption:
      '業務の困りごとを整理し、作る範囲、画面と操作、完成を確認する条件へ具体化します。Beekleは、依頼する側と作る側の認識を合わせます。',
  },
  'mvp-decision-v1': {
    name: 'mvp-decision-v1',
    alt: '仮説を試作品で確かめ、結果をもとに開発・変更・見送りを判断するMVP検証',
    caption:
      '確かめたい仮説に必要な範囲だけ試作し、利用者の反応を確認します。結果をもとに、本開発、範囲の変更、見送りのいずれかを判断します。',
  },
  'home-decision-v1': {
    name: 'home-decision-v1',
    alt: '業務と資料をもとに動くデモで確認し、開発範囲・費用・進め方を判断する流れ',
    caption:
      'Beekleは業務と資料を確認し、動くデモで実現性を確かめます。対象を絞った無料デモの結果から、開発範囲・費用・進め方を相談し、契約するかを判断します。',
  },
  'home-questions-v1': {
    name: 'home-questions-v1',
    alt: '改善する業務、現場での使いやすさ、費用と効果の3点を発注前に確認',
    caption:
      '発注前に、改善する業務、現場で使えるか、費用と期待する効果を確認します。動くものと判断材料を用意し、社内で検討できる状態にします。',
  },
  'delivery-handoff-v1': {
    name: 'delivery-handoff-v1',
    alt: '整理した要件を試作・実装・テスト・運用へ引き継ぐBeekleの開発支援',
    caption:
      'Beekleは整理した要件を画面・実装・テスト・運用へ引き継ぎます。決めた条件と確認結果を残し、変更があった場合も影響を追えるようにします。',
  },
  'risk-gates-v1': {
    name: 'risk-gates-v1',
    alt: 'AIの処理案を権限と確認条件で判定し、実行または担当者への引き継ぎを行う図',
    caption:
      'AIに許可する操作と、人が確認する条件を先に決めます。条件を満たさない処理は止めて担当者へ戻し、入力・判断・実行の履歴を残します。',
  },
  'evaluation-loop-v1': {
    name: 'evaluation-loop-v1',
    alt: '実データで品質・処理時間・費用・人の確認工数を測り、導入を判断する図',
    caption:
      '実際の業務データを使い、処理の品質、時間、費用、人の確認工数を測ります。合意した基準と比べ、導入するか、改善するか、見送るかを判断します。',
  },
  'knowledge-relations-v1': {
    name: 'knowledge-relations-v1',
    alt: '文章の内容から探す検索と、型番や適用条件の関係をたどる検索の比較',
    caption:
      '文章の内容から根拠を探す方法と、型番や適用条件などの関係をたどる方法があります。質問とデータに合う方式を選び、回答の出典を確認します。',
  },
  'support-roles-v1': {
    name: 'support-roles-v1',
    alt: '相談役、伴走支援、実行チームの役割の違い',
    caption:
      '相談役は方針や判断への助言、伴走支援は担当者と進める実行支援、実行チームは合意した範囲の開発を担います。必要な役割と体制を確認して契約します。',
  },
  'management-priorities-v1': {
    width: 1024,
    height: 1536,
    name: 'management-priorities-v1',
    alt: '経営数値と現場の状況から課題の優先順位と次の行動を整理する相談の流れ',
    caption:
      '経営数値と現場の状況を確認し、原因・制約・優先順位を整理します。有料相談で次の行動を具体化し、システムの実装は範囲と費用を別途合意します。',
  },
};
