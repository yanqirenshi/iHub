import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../bin/ihub-srv.mjs', import.meta.url));
const EXAMPLE = fileURLToPath(new URL('../../ihub.core/examples/data/', import.meta.url));

const run = (...args)=> spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8' });

test('check は、正しいデータで 0、壊れたデータで 1 で終わり、メッセージを出す', ()=> {
    const dir = mkdtempSync(join(tmpdir(), 'ihub-cli-'));

    cpSync(EXAMPLE, dir, { recursive: true });
    assert.equal(run('check', dir).status, 0);

    writeFileSync(join(dir, 'er', 'entities.json'), '[{"bad":1}]');

    const result = run('check', dir);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /er\/entities\/0/);
});

test('init は、雛形をコピーし、同じ名前のファイルがあれば何も書かずに 1 で終わる', ()=> {
    const dir = mkdtempSync(join(tmpdir(), 'ihub-cli-'));

    assert.equal(run('init', dir).status, 0);
    assert.ok(existsSync(join(dir, 'er', 'entities.json')));
    assert.equal(run('check', dir).status, 0);
    assert.equal(run('init', dir).status, 1);
});
