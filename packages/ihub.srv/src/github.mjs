// GitHub の OAuth (OAuth App の Web アプリケーションフロー)。
// client secret を画面に出さないため、コードとトークンの交換はこのサーバーで行う。
// トークンはメモリにだけ持つ。(ファイルには書かない。サーバーを起動し直したら、認証し直す)
import { randomBytes } from 'node:crypto';

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
// 個人用アクセストークンと同じ権限 (docs/src/content/github.md)
const SCOPE = 'repo project read:org';
// 認可画面へ送り出してから、戻ってくるまでの期限
const STATE_TTL = 10 * 60 * 1000;

// 戻り先は、この画面の中のパスだけを許す。(/ で始まり、// や /\ で始まらない)
export function safeReturnTo (v) {
    if (typeof v !== 'string' || !v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\'))
        return '/';

    return v;
}

function callbackUrl (c) {
    return `http://${c.req.header('host')}/api/github/oauth/callback`;
}

// app: Hono のアプリ。
// client_id・client_secret: OAuth App のもの。(省略すると環境変数 GITHUB_OAUTH_CLIENT_ID・GITHUB_OAUTH_CLIENT_SECRET。どちらも無ければ、configured: false を返すだけで、OAuth は使えない)
// fetch: GitHub へ要求するための関数。(テストで差し替える)
export function registerGithub (app, {
    client_id     = process.env.GITHUB_OAUTH_CLIENT_ID || null,
    client_secret = process.env.GITHUB_OAUTH_CLIENT_SECRET || null,
    fetch         = globalThis.fetch,
} = {}) {
    const configured = Boolean(client_id && client_secret);
    const states = new Map(); // state → { return_to, expires }
    let token = null;

    // 期限の切れた state を捨てる。
    const sweep = ()=> {
        const now = Date.now();

        for (const [k, v] of states)
            if (v.expires < now) states.delete(k);
    };

    // 画面が起動時に読む。
    app.get('/api/github/token', c=> c.json({ configured, token }));

    // 接続を切る。(OAuth のトークンを捨てる)
    app.delete('/api/github/token', c=> {
        token = null;

        return c.json({ configured, token });
    });

    // 認可画面へ送り出す。
    app.get('/api/github/oauth/login', c=> {
        if (!configured)
            return c.json({ message: 'GitHub の OAuth App が設定されていません。環境変数 GITHUB_OAUTH_CLIENT_ID と GITHUB_OAUTH_CLIENT_SECRET (.env.local など) を設定して、API サーバーを起動し直してください。' }, 503);

        sweep();

        const state = randomBytes(16).toString('hex');

        states.set(state, { return_to: safeReturnTo(c.req.query('return_to')), expires: Date.now() + STATE_TTL });

        const url = new URL(AUTHORIZE_URL);

        url.searchParams.set('client_id', client_id);
        url.searchParams.set('redirect_uri', callbackUrl(c));
        url.searchParams.set('scope', SCOPE);
        url.searchParams.set('state', state);

        return c.redirect(url.toString(), 302);
    });

    // GitHub から戻ってくる。コードをトークンに替えて、元の画面へ戻す。
    app.get('/api/github/oauth/callback', async c=> {
        sweep();

        const state = c.req.query('state');
        const entry = state ? states.get(state) : null;

        if (!entry)
            return c.text('state が合いません。認証をやり直してください。', 400);

        states.delete(state);

        // 認可画面で「キャンセル」したときなど
        if (c.req.query('error'))
            return c.redirect(entry.return_to, 302);

        const code = c.req.query('code');

        if (!code)
            return c.text('code がありません。', 400);

        const res = await fetch(ACCESS_TOKEN_URL, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id, client_secret, code, redirect_uri: callbackUrl(c) }),
        });
        const json = await res.json().catch(()=> ({}));

        if (!res.ok || !json.access_token)
            return c.text(`トークンを受け取れませんでした。(${json.error_description || json.error || res.status})`, 502);

        token = json.access_token;

        return c.redirect(entry.return_to, 302);
    });
}
