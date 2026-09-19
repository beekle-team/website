// 同じ説明画像をページ内で繰り返さず、課題と対応の違いが見える組み合わせ。
export const serviceReadingVisuals: Record<string, { pain: string; solution: string }> = {
  'web-mobile-development': { pain: 'unclear-scope-v1', solution: 'prototype-feedback-v1' },
  'mvp-poc-development': { pain: 'unclear-scope-v1', solution: 'decision-materials-v1' },
  'requirements-definition-support': {
    pain: 'unclear-scope-v1',
    solution: 'prototype-feedback-v1',
  },
  'rfp-creation-support': { pain: 'unclear-scope-v1', solution: 'decision-materials-v1' },
  'cdp-development': { pain: 'scattered-information-v1', solution: 'data-action-v1' },
  'sales-data-coaching': { pain: 'scattered-information-v1', solution: 'sales-next-action-v1' },
  'internal-document-ai-search': { pain: 'scattered-information-v1', solution: 'data-quality-v1' },
  'manufacturing-parts-knowledge-search': {
    pain: 'scattered-information-v1',
    solution: 'knowledge-relations-v1',
  },
  'technical-manual-knowledge-search': {
    pain: 'scattered-information-v1',
    solution: 'knowledge-handover-v1',
  },
  'internal-it-helpdesk-ai': { pain: 'scattered-information-v1', solution: 'chatbot-handoff-v1' },
  'ai-chatbot-development': {
    pain: 'ai-evaluation-before-after-v1',
    solution: 'helpdesk-routing-v1',
  },
  'ocr-ai-development': { pain: 'manual-transfer-v1', solution: 'data-quality-v1' },
  'document-processing-automation': { pain: 'manual-transfer-v1', solution: 'data-quality-v1' },
  'ai-agent-development': {
    pain: 'ai-evaluation-before-after-v1',
    solution: 'demo-business-logic-v1',
  },
  'ai-development': { pain: 'ai-evaluation-before-after-v1', solution: 'prototype-feedback-v1' },
  'rag-system-development': { pain: 'scattered-information-v1', solution: 'data-quality-v1' },
};
