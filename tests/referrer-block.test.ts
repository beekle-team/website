// @vitest-environment node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import { describe, it } from 'vitest';

type Context = { request: Request; locals: Record<string, unknown> };
type Middleware = (context: Context, next: () => Promise<Response>) => Promise<Response>;

// Astro の仮想モジュール・キャッシュキー生成・外部通知を差し替え、onRequest 全体を実行する。
const compiled = transpileModule(readFileSync('src/middleware.ts', 'utf8'), {
  compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 },
}).outputText;

function loadMiddleware(): Middleware {
  const exports: { onRequest?: Middleware } = {};
  const dependencies: Record<string, unknown> = {
    'astro:middleware': {
      defineMiddleware: (handler: Middleware) => handler,
      sequence: (...handlers: Middleware[]): Middleware => {
        return async (context, next) => {
          const dispatch = async (index: number): Promise<Response> => {
            if (index === handlers.length) return next();
            return handlers[index](context, () => dispatch(index + 1));
          };
          return dispatch(0);
        };
      },
    },
    '@/lib/edge-cache': { resolveEdgeCacheKeyUrl: (url: URL) => url },
    '@/lib/error-notify': {
      notifyServerError: () => undefined,
      safeBodyExcerpt: async () => '',
    },
  };
  runInNewContext(compiled, {
    exports,
    Request,
    Response,
    Headers,
    URL,
    require: (id: string) => {
      assert.ok(Object.hasOwn(dependencies, id), `Unexpected dependency: ${id}`);
      return dependencies[id];
    },
  });
  assert.ok(exports.onRequest);
  return exports.onRequest;
}

async function requestPage({
  referer,
  method = 'GET',
  path = '/',
  cached = false,
  runtime = true,
  origin = 'https://beekle.jp',
}: {
  referer?: string;
  method?: string;
  path?: string;
  cached?: boolean;
  runtime?: boolean;
  origin?: string;
} = {}) {
  const calls = { next: 0, match: 0, put: 0 };
  const headers = new Headers({ origin });
  if (referer !== undefined) headers.set('referer', referer);
  if (method === 'POST') headers.set('content-type', 'application/x-www-form-urlencoded');
  const cache = {
    match: async () => {
      calls.match++;
      return cached ? new Response('Cached page', { status: 200 }) : undefined;
    },
    put: async () => {
      calls.put++;
    },
  };
  const response = await loadMiddleware()(
    {
      request: new Request(`https://beekle.jp${path}`, { method, headers }),
      locals: runtime ? { runtime: { caches: { default: cache } } } : {},
    },
    async () => {
      calls.next++;
      return new Response('Rendered page', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
  );
  return { response, calls };
}

function assertBlocked(response: Response, calls: { next: number; match: number; put: number }) {
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-edge-cache'), null);
  assert.deepEqual(calls, { next: 0, match: 0, put: 0 });
}

describe('sales-crowd.jp からの参照元アクセス制限', () => {
  for (const referer of [
    'https://sales-crowd.jp/',
    'http://sales-crowd.jp/company/123',
    'https://app.sales-crowd.jp/',
    'https://a.b.sales-crowd.jp/path?x=1',
    'https://SALES-CROWD.JP/',
    'https://sales-crowd.jp:8443/',
    'https://sales-crowd.jp./',
    'https://app.sales-crowd.jp./',
  ]) {
    it(`${referer} は描画・キャッシュ参照前に 403 を返す`, async () => {
      const { response, calls } = await requestPage({ referer });
      assertBlocked(response, calls);
      assert.equal(await response.text(), 'Forbidden');
    });
  }

  for (const referer of [
    undefined,
    '',
    'https://google.com/',
    'https://beekle.jp/services',
    'https://notsales-crowd.jp/',
    'https://sales-crowd.jp.example.com/',
    'https://example.com/sales-crowd.jp',
    'https://example.com/?ref=sales-crowd.jp',
    'https://sales-crowd.jp@example.com/',
    'not a URL',
    'sales-crowd.jp',
    '/sales-crowd.jp',
    'null',
    'ftp://sales-crowd.jp/',
    'blob:https://sales-crowd.jp/id',
  ]) {
    it(`${String(referer)} は誤遮断せず通常どおり描画・キャッシュする`, async () => {
      const { response, calls } = await requestPage({ referer });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('x-edge-cache'), 'miss');
      assert.deepEqual(calls, { next: 1, match: 1, put: 1 });
    });
  }

  for (const [method, path] of [
    ['GET', '/'],
    ['HEAD', '/'],
    ['OPTIONS', '/'],
    ['POST', '/api/contact'],
    ['GET', '/api/search'],
    ['POST', '/authorize'],
    ['POST', '/token'],
  ]) {
    it(`${method} ${path} でも参照元制限を適用する`, async () => {
      const { response, calls } = await requestPage({
        referer: 'https://sales-crowd.jp/',
        method,
        path,
      });
      assertBlocked(response, calls);
    });
  }

  it('キャッシュ済みページでも制限を回避できない', async () => {
    const { response, calls } = await requestPage({
      referer: 'https://sales-crowd.jp/',
      cached: true,
    });
    assertBlocked(response, calls);
  });

  it('通常のキャッシュヒットはそのまま返す', async () => {
    const { response, calls } = await requestPage({ cached: true });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-edge-cache'), 'hit');
    assert.equal(await response.text(), 'Cached page');
    assert.deepEqual(calls, { next: 0, match: 1, put: 0 });
  });

  it('Cloudflare の Cache API がなくても拒否する', async () => {
    const { response, calls } = await requestPage({
      referer: 'https://sales-crowd.jp/',
      runtime: false,
    });
    assertBlocked(response, calls);
  });

  it('Cache API がない通常アクセスは描画する', async () => {
    const { response, calls } = await requestPage({ runtime: false });
    assert.equal(response.status, 200);
    assert.deepEqual(calls, { next: 1, match: 0, put: 0 });
  });

  it('既存のクロスオリジンフォーム制限を維持する', async () => {
    const { response, calls } = await requestPage({
      method: 'POST',
      path: '/api/contact',
      origin: 'https://example.com',
      referer: 'https://example.com/',
    });
    assert.equal(response.status, 403);
    assert.match(await response.text(), /Cross-site POST form submissions are forbidden/);
    assert.deepEqual(calls, { next: 0, match: 0, put: 0 });
  });
});
