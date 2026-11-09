import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createApp } from '../src/app.mjs';
import { safeReturnTo } from '../src/github.mjs';

const HOST = 'localhost:3000';

// GitHub のトークンの交換を差し替えたアプリ。(data は空のフォルダ)
function makeApp ({ configured = true, exchange = ()=> ({ status: 200, body: { access_token: 'gho_test' } }) } = {}) {
    const calls = [];
    const fetch = async (url, init)=> {
        calls.push({ url, body: JSON.parse(init.body) });
        const { status, body } = exchange();

        return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    };
    const github = configured
          ? { client_id: 'cid', client_secret: 'secret', fetch }
          : { client_id: null, client_secret: null, fetch };
    const app = createApp({ data_dir: mkdtempSync(join(tmpdir(), 'ihub-github-')), github });

    return { app, calls };
}

function get (app, path, init = {}) {
    return app.request(path, { ...init, headers: { host: HOST, ...(init.headers || {}) } });
}

async function login (app, return_to = '/wbs/1000003') {
    const res = await get(app, `/api/github/oauth/login?return_to=${encodeURIComponent(return_to)}`);

    assert.equal(res.status, 302);

    return new URL(res.headers.get('location'));
}

test('戻り先は、この画面の中のパスだけを許す', ()=> {
    assert.equal(safeReturnTo('/wbs/1000003'), '/wbs/1000003');
    assert.equal(safeReturnTo('//evil.example.com'), '/');
    assert.equal(safeReturnTo('/\\evil.example.com'), '/');
    assert.equal(safeReturnTo('https://evil.example.com'), '/');
    assert.equal(safeReturnTo(undefined), '/');
});

test('設定が無ければ、login は 503 で、token は configured: false', async ()=> {
    const { app } = makeApp({ configured: false });

    assert.equal((await get(app, '/api/github/oauth/login')).status, 503);
    assert.deepEqual(await (await get(app, '/api/github/token')).json(), { configured: false, token: null });
});

test('login は GitHub の認可画面へ送り出す', async ()=> {
    const { app } = makeApp();
    const url = await login(app);

    assert.equal(url.origin + url.pathname, 'https://github.com/login/oauth/authorize');
    assert.equal(url.searchParams.get('client_id'), 'cid');
    assert.equal(url.searchParams.get('redirect_uri'), `http://${HOST}/api/github/oauth/callback`);
    assert.equal(url.searchParams.get('scope'), 'repo project read:org');
    assert.match(url.searchParams.get('state'), /^[0-9a-f]{32}$/);
});

test('callback はトークンに替えて元の画面へ戻し、token で受け取れる', async ()=> {
    const { app, calls } = makeApp();
    const state = (await login(app)).searchParams.get('state');

    assert.deepEqual(await (await get(app, '/api/github/token')).json(), { configured: true, token: null });

    const res = await get(app, `/api/github/oauth/callback?code=abc&state=${state}`);

    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), '/wbs/1000003');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://github.com/login/oauth/access_token');
    assert.deepEqual(calls[0].body, { client_id: 'cid', client_secret: 'secret', code: 'abc', redirect_uri: `http://${HOST}/api/github/oauth/callback` });
    assert.deepEqual(await (await get(app, '/api/github/token')).json(), { configured: true, token: 'gho_test' });

    // state は 1 回しか使えない。
    assert.equal((await get(app, `/api/github/oauth/callback?code=abc&state=${state}`)).status, 400);

    // 接続を切る。
    assert.deepEqual(await (await get(app, '/api/github/token', { method: 'DELETE' })).json(), { configured: true, token: null });
});

test('state が合わない callback は 400 で、交換しない', async ()=> {
    const { app, calls } = makeApp();

    await login(app);

    assert.equal((await get(app, '/api/github/oauth/callback?code=abc&state=wrong')).status, 400);
    assert.equal((await get(app, '/api/github/oauth/callback?code=abc')).status, 400);
    assert.equal(calls.length, 0);
});

test('認可画面でキャンセルしたら、交換せずに元の画面へ戻す', async ()=> {
    const { app, calls } = makeApp();
    const state = (await login(app)).searchParams.get('state');
    const res = await get(app, `/api/github/oauth/callback?error=access_denied&state=${state}`);

    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), '/wbs/1000003');
    assert.equal(calls.length, 0);
});

test('交換に失敗したら 502 で、トークンは持たない', async ()=> {
    const { app } = makeApp({ exchange: ()=> ({ status: 200, body: { error: 'bad_verification_code' } }) });
    const state = (await login(app)).searchParams.get('state');
    const res = await get(app, `/api/github/oauth/callback?code=abc&state=${state}`);

    assert.equal(res.status, 502);
    assert.match(await res.text(), /bad_verification_code/);
    assert.equal((await (await get(app, '/api/github/token')).json()).token, null);
});
