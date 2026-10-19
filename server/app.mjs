// API サーバーのルート。
import { join } from 'node:path';

import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';

import FileStore from './stores/FileStore.mjs';
import DataService, { HttpError } from './services/DataService.mjs';
import guard from './guard.mjs';

function collectionName (c) {
    return `${c.req.param('domain')}/${c.req.param('collection')}`;
}

// URL の id は文字列なので、数字なら数値にする。
function recordId (c) {
    const id = c.req.param('id');

    return /^-?\d+$/.test(id) ? Number(id) : id;
}

function ifMatch (c) {
    return c.req.header('if-match') || null;
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

// data_dir: データのフォルダ。static_dir: ビルドした画面のフォルダ (指定したときだけ配信する)。
export function createApp ({ data_dir, static_dir = null }) {
    const service = new DataService(new FileStore(data_dir));
    const app = new Hono();

    app.use('/api/*', guard);

    // 全データ (起動時に画面が読み込む)
    app.get('/api/data', async c=> c.json(await service.readAll()));

    // コレクション
    app.get('/api/:domain/:collection',   async c=> respond(c, await service.read(collectionName(c))));
    app.put('/api/:domain/:collection',   async c=> respond(c, await service.replace(collectionName(c), await body(c), ifMatch(c))));
    app.patch('/api/:domain/:collection', async c=> respond(c, await service.patchDocument(collectionName(c), await body(c), ifMatch(c))));
    app.post('/api/:domain/:collection',  async c=> respond(c, await service.addRecord(collectionName(c), await body(c), ifMatch(c)), 201));

    // レコード
    app.patch('/api/:domain/:collection/:id',  async c=> respond(c, await service.patchRecord(collectionName(c), recordId(c), await body(c), ifMatch(c))));
    app.delete('/api/:domain/:collection/:id', async c=> respond(c, await service.deleteRecord(collectionName(c), recordId(c), ifMatch(c))));

    app.all('/api/*', c=> c.json({ message: 'API がありません。' }, 404));

    if (static_dir) {
        app.use('/*', serveStatic({ root: static_dir }));
        // 画面の URL (/wbs/1000 など) は、index.html を返して画面側で振り分ける。
        app.get('*', serveStatic({ path: join(static_dir, 'index.html') }));
    }

    app.onError((e, c)=> {
        if (e instanceof HttpError)
            return c.json({ message: e.message, errors: e.errors }, e.status);

        console.error(e);

        return c.json({ message: e.message }, 500);
    });

    return app;
}
