import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from '../src/app.mjs';
import { createValidation } from '../src/validation/index.mjs';

const EXAMPLE = fileURLToPath(new URL('../../ihub.core/examples/data/', import.meta.url));
const JSON_HEADERS = { host: 'localhost:3000', 'Content-Type': 'application/json' };
const HOST = { host: 'localhost:3000' };

let dir;
let data_dir;
let schemas;

// アプリが足すドメイン (memo/notes) を持つ、雛形のデータとスキーマを作る。
beforeEach(()=> {
    dir = mkdtempSync(join(tmpdir(), 'ihub-ext-'));
    data_dir = join(dir, 'data');

    cpSync(EXAMPLE, data_dir, { recursive: true });
    mkdirSync(join(data_dir, 'memo'));
    writeFileSync(join(data_dir, 'memo', 'notes.json'), JSON.stringify([{ id: 1, title: 'a' }]));

    schemas = join(dir, 'schemas');
    mkdirSync(join(schemas, 'memo'), { recursive: true });
    writeFileSync(join(schemas, 'memo', 'notes.schema.json'), JSON.stringify({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'array',
        items: {
            type: 'object',
            properties: { id: { type: 'integer' }, title: { type: 'string' } },
            required: ['id', 'title'],
            additionalProperties: false,
        },
    }));
});

// 使えないタイトル。(rules の確認用)
const rules = { memo: ({ notes })=> notes.filter(n=> n.title==='ng').map(n=> `memo/notes: ng は使えません。(id=${n.id})`) };

test('extensions.schemas_dir と rules で、足したドメインを検証する', ()=> {
    const validation = createValidation({ schemas_dir: schemas, rules });

    assert.equal(validation.findCollection('memo/notes').idKey, 'id');
    assert.deepEqual(validation.validateDataDir(data_dir), []);

    // スキーマに合わないときは、ルールの前に止まる。
    writeFileSync(join(data_dir, 'memo', 'notes.json'), JSON.stringify([{ id: 1, title: 'ng' }, { id: 2 }]));
    assert.equal(validation.validateDataDir(data_dir).length, 1);

    writeFileSync(join(data_dir, 'memo', 'notes.json'), JSON.stringify([{ id: 1, title: 'ng' }]));
    assert.deepEqual(validation.validateDataDir(data_dir), ['memo/notes: ng は使えません。(id=1)']);
});

test('extensions.schemas_dir を渡さないと、足したドメインはスキーマが無いことになる', ()=> {
    const errors = createValidation().validateDataDir(data_dir);

    assert.equal(errors.length, 1);
    assert.match(errors[0], /^memo\/notes: スキーマがありません。/);
});

test('パッケージにあるコレクションを、extensions.schemas_dir で重ねるとエラーにする', ()=> {
    mkdirSync(join(schemas, 'er'));
    writeFileSync(join(schemas, 'er', 'entities.schema.json'), '{"type":"array"}');

    assert.throws(()=> createValidation({ schemas_dir: schemas }), /er\/entities/);
});

test('足したドメインを API で読み書きし、書く前に rules で検証する', async ()=> {
    const app = createApp({ data_dir, extensions: { schemas_dir: schemas, rules } });

    const all = await (await app.request('/api/data', { headers: HOST })).json();
    assert.deepEqual(all.collections['memo/notes'], [{ id: 1, title: 'a' }]);

    const added = await app.request('/api/memo/notes', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ title: 'b' }) });
    assert.equal(added.status, 201);
    assert.deepEqual((await added.json()).record, { id: 2, title: 'b' });

    const bad = await app.request('/api/memo/notes', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ title: 'ng' }) });
    assert.equal(bad.status, 400);
});

test('extensions.routes は、/api/{domain}/{collection} より先に登録される', async ()=> {
    const app = createApp({
        data_dir,
        extensions: {
            schemas_dir: schemas,
            routes: app=> app.get('/api/memo/hello', c=> c.json({ hello: 'world' })),
        },
    });

    assert.deepEqual(await (await app.request('/api/memo/hello', { headers: HOST })).json(), { hello: 'world' });
    assert.equal((await app.request('/api/memo/notes', { headers: HOST })).status, 200);
});

test('app_name で、書き込んだ画面の id を受け取るヘッダー名が変わる', async ()=> {
    const app = createApp({ data_dir, app_name: 'iwo Studio', extensions: { schemas_dir: schemas } });
    const reader = (await app.request('/api/events', { headers: HOST })).body.getReader();
    const decoder = new TextDecoder();
    let text = '';

    const readUntil = async (pattern)=> {
        while (!pattern.test(text)) {
            const { value, done } = await reader.read();

            if (done)
                break;

            text += decoder.decode(value);
        }
    };

    await readUntil(/event: ready/);

    // 'X-iHub-Client' は、app_name が iwo Studio なので使われない。
    await app.request('/api/memo/notes', {
        method: 'POST',
        headers: { ...JSON_HEADERS, 'X-iwo-Studio-Client': 'tab-1', 'X-iHub-Client': 'other' },
        body: JSON.stringify({ title: 'c' }),
    });

    await readUntil(/event: changed/);
    await reader.cancel();

    const changed = text.split('\n').filter(l=> l.startsWith('data: ')).map(l=> JSON.parse(l.slice(6))).find(e=> e.type==='changed');

    assert.equal(changed.client, 'tab-1');
});
