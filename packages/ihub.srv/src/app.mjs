// API サーバーのルート。
import { join } from 'node:path';

import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { serveStatic } from '@hono/node-server/serve-static';

import FileStore from './stores/FileStore.mjs';
import DataService, { HttpError } from './services/DataService.mjs';
import guard from './guard.mjs';
import { registerGithub } from './github.mjs';
import { createValidation } from './validation/index.mjs';
import { watchData } from './watcher.mjs';

// 接続を保つために、何も無くても送る間隔。
const PING_INTERVAL = 25000;

function collectionName (c) {
    return `${c.req.param('domain')}/${c.req.param('collection')}`;
}

// URL の id は文字列なので、数字なら数値にする。
function recordId (c) {
    const id = c.req.param('id');

    return /^-?\d+$/.test(id) ? Number(id) : id;
}

// 書き込んだ画面 (タブ) の id を送るヘッダー名。(X-{アプリ名}-Client。アプリ名の英数字とハイフン以外は - にする)
export function clientHeader (app_name) {
    return `x-${app_name.replace(/[^A-Za-z0-9-]+/g, '-').toLowerCase()}-client`;
}

// If-Match と、書き込んだ画面 (タブ) の id。(通知を受けた画面が、自分の書き込みを見分けるために使う)
function writeOptions (c, client_header) {
    return {
        if_match: c.req.header('if-match') || null,
        client:   c.req.header(client_header) || null,
    };
}

async function body (c) {
    try {
        return await c.req.json();
    } catch (e) {
        throw new HttpError(400, '本文を JSON として読めません。');
    }
}

function respond (c, result, status = 200) {
    c.header('ETag', result.etag);

    return c.json(result, status);
}

// data_dir: データのフォルダ。
// static_dir: ビルドした画面のフォルダ。(指定したときだけ配信する)
// watch: data_dir の変更を見張って、画面へ知らせるか。
// app_name: ログと、書き込んだ画面の id を送るヘッダー (X-{app_name}-Client) の名前。
// extensions: アプリ固有のドメインを足すための拡張。
//   schemas_dir … 追加のスキーマのフォルダ ({domain}/{collection}.schema.json)
//   rules       … 追加の整合性ルール ({ ドメイン: (コレクション)=> エラーの配列 })
//   routes      … 追加のルート。(app)=> {} の形で、/api/{domain}/{collection} より先に登録する
// github: GitHub の OAuth の設定 ({ client_id, client_secret })。省略すると環境変数 GITHUB_OAUTH_CLIENT_ID・GITHUB_OAUTH_CLIENT_SECRET から読む。
//   どちらも無いときは、/api/github/token が configured: false を返すだけで、ほかは変わらない。(github.mjs)
export function createApp ({ data_dir, static_dir = null, watch = false, app_name = 'iHub', extensions = {}, github = {} }) {
    const validation = createValidation({ schemas_dir: extensions.schemas_dir, rules: extensions.rules });
    const service = new DataService(new FileStore(data_dir), validation);
    const client_header = clientHeader(app_name);
    const options = c=> writeOptions(c, client_header);
    const app = new Hono();

    if (watch)
        app.stopWatching = watchData(data_dir, name=> service.changed(name));

    app.use('/api/*', guard);

    if (extensions.routes)
        extensions.routes(app);

    // GitHub の OAuth。(/api/:domain/:collection より先に登録する。/api/github/token がコレクションと見なされないように)
    registerGithub(app, github);

    // 全データ (起動時に画面が読み込む)
    app.get('/api/data', async c=> c.json(await service.readAll()));

    // 変更の通知 (Server-Sent Events)
    // 接続したときに ready (全コレクションの ETag) を送り、そのあとは changed と invalid を送る。
    app.get('/api/events', async c=> {
        const { etags } = await service.readAll();

        const res = streamSSE(c, async stream=> {
            const send = (event)=> stream.writeSSE({ event: event.type, data: JSON.stringify(event) }).catch(()=> {});
            const unsubscribe = service.subscribe(send);
            const aborted = new Promise(resolve=> stream.onAbort(resolve));

            await send({ type: 'ready', etags });

            // 接続が切れるまで、間隔をあけて ping を送る。(切れたら、待たずに終える)
            while (!stream.aborted) {
                let timer;

                await Promise.race([aborted, new Promise(resolve=> { timer = setTimeout(resolve, PING_INTERVAL); })]);
                clearTimeout(timer);

                if (!stream.aborted)
                    await stream.write(': ping\n\n');
            }

            unsubscribe();
        });

        // 開発サーバーが応答を圧縮すると、通知がためこまれて届かなくなるので、圧縮させない。
        res.headers.set('Cache-Control', 'no-cache, no-transform');

        return res;
    });

    // コレクション
    app.get('/api/:domain/:collection',   async c=> respond(c, await service.read(collectionName(c))));
    app.put('/api/:domain/:collection',   async c=> respond(c, await service.replace(collectionName(c), await body(c), options(c))));
    app.patch('/api/:domain/:collection', async c=> respond(c, await service.patchDocument(collectionName(c), await body(c), options(c))));
    app.post('/api/:domain/:collection',  async c=> respond(c, await service.addRecord(collectionName(c), await body(c), options(c)), 201));

    // レコード
    app.patch('/api/:domain/:collection/:id',  async c=> respond(c, await service.patchRecord(collectionName(c), recordId(c), await body(c), options(c))));
    app.delete('/api/:domain/:collection/:id', async c=> respond(c, await service.deleteRecord(collectionName(c), recordId(c), options(c))));

    app.all('/api/*', c=> c.json({ message: 'API がありません。' }, 404));

    if (static_dir) {
        app.use('/*', serveStatic({ root: static_dir }));
        // 画面の URL (/wbs/1000 など) は、index.html を返して画面側で振り分ける。
        app.get('*', serveStatic({ path: join(static_dir, 'index.html') }));
    }

    app.onError((e, c)=> {
        if (e instanceof HttpError)
            return c.json({ message: e.message, errors: e.errors }, e.status);

        console.error(`[${app_name}]`, e);

        return c.json({ message: e.message }, 500);
    });

    return app;
}
